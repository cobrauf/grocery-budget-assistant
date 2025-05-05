import os
import google.generativeai as genai
from pydantic import ValidationError
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from ..schemas.pdf_schema import ExtractedPDFData
# Use the get_db_session context manager/dependency
from ..database import SessionLocal # Assuming SessionLocal is the factory
# Import the specific CRUD functions we need
from .. import crud
# Add necessary imports for database interaction (e.g., Supabase client, CRUD functions)
# from .. import crud, models # Example
# from ..database import get_db_session # Example

# Placeholder for actual Gemini API Key loading
# Consider using environment variables and a config file/service
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    # In a real app, raise a more specific configuration error or log
    print("Warning: GEMINI_API_KEY environment variable not set.")
else:
    genai.configure(api_key=GEMINI_API_KEY)

# Define the Gemini model to use
# Choose a model capable of handling PDF input, e.g., 'gemini-pro-vision' might need adjustment
# For direct PDF processing, a future model or specific API endpoint might be needed.
# Refer to the latest Google AI documentation for the correct model.
GEMINI_MODEL_NAME = "gemini-1.5-flash" # Example: Use the appropriate model

# Context manager for database sessions in background tasks
def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class GroceryAdProcessor:
    def __init__(self):
        # Initialize Gemini client
        # The genai.configure call might be sufficient, or a specific client setup is needed
        # depending on the library version and usage pattern.
        self.model = genai.GenerativeModel(GEMINI_MODEL_NAME)
        # No db client needed here, will be obtained per-request/task

    async def process_pdf(self, pdf_file_path: str):
        print(f"Processing PDF: {pdf_file_path}")
        validated_data = None # Initialize
        # 1. Prepare PDF for Gemini API
        # The 'google-generativeai' library might require uploading the file first
        # or passing bytes directly. Check the documentation for PDF handling.
        # Example using hypothetical file upload:
        try:
            print("Uploading PDF to Gemini...")
            # This is a placeholder - actual PDF handling depends on the Gemini API/SDK
            # It might involve genai.upload_file or similar.
            # uploaded_file = genai.upload_file(path=pdf_file_path)
            # Or read bytes:
            with open(pdf_file_path, 'rb') as f:
                pdf_bytes = f.read()

            # Placeholder for the actual API call with PDF content
            # Construct the prompt carefully, potentially including the schema definition
            # or instructions on the expected JSON format.
            prompt = """
            Extract grocery ad data from the provided PDF file.
            Identify the retailer name, the weekly ad start and end dates, and a list of products.
            For each product, extract its name, price, and any description (like unit size or quantity).
            Respond ONLY with a valid JSON object matching the following structure:
            { "retailer": "string",
              "weekly_ad": { "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD" },
              "products": [ { "name": "string", "price": float, "description": "string|null" } ]
            }
            Do not include any introductory text, explanations, or markdown formatting around the JSON.
            """

            print("Sending request to Gemini...")
            # The specific method to send PDF content + prompt might vary.
            # This assumes the model can directly take bytes or a reference to an uploaded file.
            response = await self.model.generate_content_async(
                [
                    prompt,
                    # Hypothetical: Pass the uploaded file object or bytes directly
                    # uploaded_file # If using file upload
                    # {'mime_type': 'application/pdf', 'data': pdf_bytes} # If passing bytes
                     {
                         "mime_type": "application/pdf",
                         "data": pdf_bytes
                     }
                ],
                # Add generation_config if needed (temperature, max tokens, etc.)
                # generation_config=genai.types.GenerationConfig(...)
            )

            # Clean the response text: Gemini might add markdown ```json ... ```
            raw_results = response.text.strip().replace('```json', '').replace('```', '').strip()
            print("Received response from Gemini.")
            # print(f"Raw response: {raw_results}")

        except Exception as e:
            # Handle API errors (network, authentication, rate limits, invalid requests etc.)
            print(f"Error calling Gemini API: {e}")
            # TODO: Implement retry logic or more specific failure handling
            # Consider raising an exception to be caught by the background task runner
            return None # Indicate failure

        # 2. Parse and validate results from Gemini
        try:
            print("Parsing and validating Gemini response...")
            # The OutputParser concept from the plan is integrated here via Pydantic
            validated_data = ExtractedPDFData.model_validate_json(raw_results)
            print("Validation successful.")
            # print(f"Validated data: {validated_data.model_dump_json(indent=2)}")
        except ValidationError as e:
            # Handle Pydantic validation errors (schema mismatch)
            print(f"Error validating Gemini response against schema: {e}")
            print(f"Invalid Raw Data: {raw_results}") # Log the problematic data
            # TODO: Implement handling for validation failures (e.g., log, move to error queue)
            return None # Indicate failure
        except Exception as e:
            # Handle other potential errors during parsing (e.g., invalid JSON format)
            print(f"Error parsing Gemini response: {e}")
            print(f"Raw Data causing parse error: {raw_results}")
            return None # Indicate failure

        # 3. Upload to database if validation succeeded
        if validated_data:
            try:
                print("Uploading data to database...")
                # Use the context manager to get a session
                with get_db() as db:
                    await self.upload_to_supabase(db, validated_data)
                print("Database upload transaction successful.")
            except SQLAlchemyError as e:
                print(f"Database transaction failed: {e}")
                # The transaction would have been rolled back automatically by SQLAlchemy
                # if using standard session management with context manager/dependency
                return None # Indicate failure
            except Exception as e:
                print(f"Unexpected error during database upload: {e}")
                return None # Indicate failure
        else:
             print("Skipping database upload due to previous errors.")
             return None # Indicate failure

        print(f"Successfully processed and stored data from: {pdf_file_path}")
        return validated_data # Return successful data

    async def upload_to_supabase(self, db: Session, data: ExtractedPDFData):
        """Handles the database transaction for inserting extracted PDF data."""
        try:
            # 1. Get or create retailer
            # Note: CRUD functions are synchronous, run them in a threadpool
            # if the main process_pdf remains async AND db operations are blocking.
            # For simplicity here, we assume crud functions or the db driver
            # handle async context appropriately or are fast enough.
            # If using asyncpg with SQLAlchemy, operations might be awaitable.
            # Let's assume sync CRUD for now.

            # Use the synchronous db session directly with sync CRUD functions
            retailer = crud.get_or_create_retailer(db, name=data.retailer)

            if not retailer or not retailer.id:
                 raise ValueError(f"Failed to get or create retailer: {data.retailer}")

            # 2. Create weekly ad linked to retailer
            weekly_ad = crud.create_weekly_ad_from_pdf(db, ad_data=data.weekly_ad, retailer_id=retailer.id)

            if not weekly_ad or not weekly_ad.id:
                raise ValueError(f"Failed to create weekly ad for retailer ID: {retailer.id}")

            # 3. Batch insert products linked to weekly ad
            if data.products:
                crud.create_products_batch(db, products_data=data.products, weekly_ad_id=weekly_ad.id)
            else:
                print(f"No products found in extracted data for WeeklyAd ID: {weekly_ad.id}")

            # 4. Commit the transaction
            db.commit()
            print(f"Transaction committed for retailer: {data.retailer}, Ad ID: {weekly_ad.id}")

        except Exception as e:
            print(f"Error during database transaction: {e}. Rolling back...")
            db.rollback()
            # Re-raise the exception to be caught by the caller (process_pdf)
            raise

# Example of how you might initialize and use the processor elsewhere
# async def main_example(pdf_path):
#     processor = GroceryAdProcessor()
#     result = await processor.process_pdf(pdf_path)
#     if result:
#         print("PDF processed successfully.")
#     else:
#         print("PDF processing failed.") 