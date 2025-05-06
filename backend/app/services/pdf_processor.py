import os
import json
import google.generativeai as genai # type: ignore
from google.api_core import exceptions as google_exceptions # type: ignore # For specific google exceptions
from pydantic import ValidationError
import asyncio
import aiofiles # For async file operations
from pathlib import Path
from sqlalchemy.orm import Session # Added import

from ..schemas.pdf_schema import ExtractedPDFData
# Use the get_db_session context manager/dependency
from ..database import SessionLocal # Assuming SessionLocal is the factory

'''
Configures and initializes the Google Gemini API service for handling PDF file processing tasks.
Uploads the source PDF files securely to the Gemini Files API for remote processing and analysis.
Sends a specific extraction prompt along with the uploaded file reference to the Gemini API.
Strictly validates the extracted JSON data received from the Gemini API using Pydantic schemas.
Persists the successfully validated, structured data by saving it into local JSON files.
'''

# Placeholder for actual Gemini API Key loading
# Consider using environment variables and a config file/service
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
UPLOADS_DIR = Path("backend/pdf/uploads")
EXTRACTIONS_DIR = Path("backend/pdf/extractions")
GEMINI_MODEL = os.getenv("GEMINI_MODEL") # Ensure this model supports File API and JSON output

# Context manager for database sessions in background tasks
def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Initialization ---
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY environment variable not set.")
else:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"Error configuring Gemini API: {e}")

# Ensure output directory exists
EXTRACTIONS_DIR.mkdir(parents=True, exist_ok=True)

# --- PDF Processor Service ---
class GroceryAdProcessor:
    def __init__(self):
        try:
            self.model = genai.GenerativeModel(GEMINI_MODEL)
            print(f"Gemini model '{GEMINI_MODEL}' initialized.")
        except Exception as e:
            print(f"Failed to initialize Gemini model: {e}")
            self.model = None # Mark as unusable

    async def process_pdf_to_json(self, pdf_path: Path) -> str | None:
        """
        Processes a single PDF file using the Gemini Files API, and saves it as a JSON file in the EXTRACTIONS_DIR.
        Args:
            pdf_path: Path object pointing to the input PDF file.
        Returns:
            The path to the created JSON file if successful, otherwise None.
        """
        if not self.model:
            print("Processor not initialized correctly. Skipping processing.")
            return None

        output_json_path = EXTRACTIONS_DIR / f"{pdf_path.stem}.json"
        print(f"Starting processing for: {pdf_path.name}")
        print(f"Target output file: {output_json_path}")

        uploaded_file = None # To keep track for potential deletion
        try:
            # 1. Upload PDF using Files API
            print(f"Uploading {pdf_path.name} to Gemini Files API...")
            # Use display_name for easier identification in list() if needed
            uploaded_file = await asyncio.to_thread(
                genai.upload_file, path=pdf_path, display_name=pdf_path.name
            )
            print(f"File uploaded successfully: {uploaded_file.name} ({uploaded_file.uri})")

            # --- Check file state (optional but recommended) ---
            # Wait briefly for processing if needed, check documentation
            # file_info = genai.get_file(name=uploaded_file.name)
            # while file_info.state.name == "PROCESSING":
            #     await asyncio.sleep(5) # Check every 5 seconds
            #     file_info = genai.get_file(name=uploaded_file.name)
            # if file_info.state.name != "ACTIVE":
            #     raise Exception(f"Uploaded file {uploaded_file.name} failed processing. State: {file_info.state.name}")
            # print(f"Uploaded file '{uploaded_file.name}' is ACTIVE.")
            # --- End optional check ---


            # 2. Generate content using the uploaded file
            prompt = """
            Extract grocery ad data from the provided PDF file ({file_display_name}).
            Identify the retailer name, the weekly ad start and end dates (YYYY-MM-DD format),
            and a list of products.
            For each product, extract its name, price (as a float/number), and any descriptive text
            (like unit size, quantity, brand, or specific offer details).
            Respond ONLY with a valid JSON object matching the following structure:
            {{
              "retailer": "string",
              "weekly_ad": {{
                "start_date": "YYYY-MM-DD",
                "end_date": "YYYY-MM-DD"
              }},
              "products": [
                {{
                  "name": "string",
                  "price": float,
                  "description": "string | null"
                }}
              ]
            }}
            Ensure the response contains only the JSON object, with no surrounding text, explanations, or markdown formatting like ```json.
            """.format(file_display_name=pdf_path.name) # Include filename in prompt for context

            print(f"Sending request to Gemini model '{GEMINI_MODEL}'...")
            response = await self.model.generate_content_async(
                [prompt, uploaded_file],
                # Consider adding generation_config if needed (e.g., response_mime_type="application/json")
                # Check documentation for explicit JSON mode if available for the model
                # generation_config=genai.types.GenerationConfig(
                #     response_mime_type="application/json"
                # )
            )

            # Check for blocked prompts or safety issues
            if not response.candidates:
                 # Check prompt_feedback for block reason
                 block_reason = response.prompt_feedback.block_reason if response.prompt_feedback else "Unknown"
                 print(f"Request blocked or failed. Reason: {block_reason}. PDF: {pdf_path.name}")
                 # Potentially log response.prompt_feedback details
                 return None

            # Clean the response text: Gemini might still add markdown ```json ... ```
            # Access text safely, check if parts exist
            if not response.candidates[0].content.parts:
                print(f"Gemini response has no parts. PDF: {pdf_path.name}")
                return None
            raw_results = response.candidates[0].content.parts[0].text
            cleaned_results = raw_results.strip().removeprefix('```json').removesuffix('```').strip()
            print(f"Received response from Gemini for {pdf_path.name}.")
            # print(f"Cleaned response: {cleaned_results[:200]}...") # Log snippet

        except google_exceptions.GoogleAPIError as e:
            print(f"Gemini API Error processing {pdf_path.name}: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error during Gemini interaction for {pdf_path.name}: {e}")
            return None
        # --- Files API Cleanup (Optional) ---
        # Uncomment if you want explicit deletion, otherwise rely on 48h auto-delete
        # finally:
        #     if uploaded_file:
        #         try:
        #             print(f"Deleting uploaded file: {uploaded_file.name}")
        #             await asyncio.to_thread(genai.delete_file, name=uploaded_file.name)
        #             print(f"Successfully deleted {uploaded_file.name}")
        #         except Exception as e:
        #             print(f"Error deleting uploaded file {uploaded_file.name}: {e}")
        # --- End Cleanup ---


        # 3. Parse, Validate, and Save JSON
        try:
            print(f"Validating response for {pdf_path.name}...")
            validated_data = ExtractedPDFData.model_validate_json(cleaned_results)
            print(f"Validation successful for {pdf_path.name}.")

            print(f"Saving extracted data to {output_json_path}...")
            async with aiofiles.open(output_json_path, mode='w', encoding='utf-8') as f:
                # Use model_dump_json for proper Pydantic serialization
                await f.write(validated_data.model_dump_json(indent=2))
            print(f"Successfully saved JSON for {pdf_path.name}.")
            return str(output_json_path)

        except ValidationError as e:
            print(f"Validation Error for {pdf_path.name}: {e}")
            print(f"Invalid Raw Data: {cleaned_results}")
            return None
        
        except json.JSONDecodeError as e:
            print(f"JSON Decode Error for {pdf_path.name}: {e}")
            print(f"Raw Data causing decode error: {cleaned_results}")
            # Optionally save error file as above
            return None
        
        except Exception as e:
            print(f"Error saving JSON file {output_json_path}: {e}")
            return None