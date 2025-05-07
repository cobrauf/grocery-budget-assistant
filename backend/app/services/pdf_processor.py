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
from ..utils.utils import find_project_root
from .pdf_prompts import GENERAL_PROMPT_TEMPLATE, PRODUCT_CATEGORIES, KNOWN_RETAILERS, PRODUCT_UNITS # 

'''
Configures and initializes the Google Gemini API service for handling PDF file processing tasks.
Uploads the source PDF files securely to the Gemini Files API for remote processing and analysis.
Sends a specific extraction prompt along with the uploaded file reference to the Gemini API.
Strictly validates the extracted JSON data received from the Gemini API using Pydantic schemas.
Persists the successfully validated, structured data by saving it into local JSON files.
'''

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL") 

PROJECT_ROOT = find_project_root()
UPLOADS_DIR = PROJECT_ROOT / "backend" / "pdf" / "uploads"
EXTRACTIONS_DIR = PROJECT_ROOT / "backend" / "pdf" / "extractions"

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
        if not self.model: # failsafe in case the class has been instantiated but the model is not configured
            print("Processor not initialized correctly. Skipping processing.")
            return None

        output_json_path = EXTRACTIONS_DIR / f"{pdf_path.stem}.json"
        print(f"Starting processing for: {pdf_path.name}")

        uploaded_file = None # To keep track for potential deletion
        try:
            # 1. Upload PDF using Files API
            print(f"Uploading {pdf_path.name} to Gemini Files API...")
            uploaded_file = await asyncio.to_thread(
                genai.upload_file, path=pdf_path, display_name=pdf_path.name
            )
            print(f"File uploaded successfully: {uploaded_file.name} ({uploaded_file.uri})")

            # 2. Generate content using the uploaded file
            categories_str = ", ".join([f'"{cat}"' for cat in PRODUCT_CATEGORIES])
            retailers_str = ", ".join([f'"{ret}"' for ret in KNOWN_RETAILERS]) if KNOWN_RETAILERS else "any specified retailer"
            units_str = ", ".join([f'"{unit}"' for unit in PRODUCT_UNITS])

            prompt = GENERAL_PROMPT_TEMPLATE.format(
                file_display_name=pdf_path.name,
                categories_list_str=categories_str,
                retailers_list_str=retailers_str,
                units_list_str=units_str
            )

            print(f"=========== Generated Prompt:\n{prompt}")

            print(f"Sending request to Gemini model '{GEMINI_MODEL}'...")
            response = await self.model.generate_content_async(
                [prompt, uploaded_file],
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json"
                )
            )

            # Log token usage
            if hasattr(response, 'usage_metadata') and response.usage_metadata:
                print(f"""Token usage for {pdf_path.name}: 
                      Prompt tokens: {response.usage_metadata.prompt_token_count}, 
                      Candidates tokens: {response.usage_metadata.candidates_token_count}, 
                      Total tokens: {response.usage_metadata.total_token_count}""")
            else:
                print(f"Token usage data not available for {pdf_path.name}.")

            # Check for blocked prompts or safety issues
            if not response.candidates:
                 block_reason = response.prompt_feedback.block_reason if response.prompt_feedback else "Unknown"
                 print(f"Request blocked or failed. Reason: {block_reason}. PDF: {pdf_path.name}")
                 return None

            # Clean the response text: Gemini might still add markdown ```json ... ```
            # Access text safely, check if parts exist
            if not response.candidates[0].content.parts:
                print(f"Gemini response has no parts. PDF: {pdf_path.name}")
                return None
            raw_results = response.candidates[0].content.parts[0].text
            cleaned_results = raw_results.strip().removeprefix('```json').removesuffix('```').strip()
            print(f"Received response from Gemini for {pdf_path.name}.")

        except google_exceptions.GoogleAPIError as e:
            print(f"Gemini API Error processing {pdf_path.name}: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error during Gemini interaction for {pdf_path.name}: {e}")
            return None

        # 3. Parse, Validate, and Save JSON
        try:
            # print(f"Validating response for {pdf_path.name}...")
            validated_data = ExtractedPDFData.model_validate_json(cleaned_results)
            print(f"Validation successful for {pdf_path.name}.")

            # print(f"Saving extracted data to {output_json_path}...")
            async with aiofiles.open(output_json_path, mode='w', encoding='utf-8') as f:
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