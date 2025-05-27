import google.generativeai as genai
import os
import json
from pathlib import Path
from typing import Dict, Any, Optional
from ..schemas.pdf_schema import ExtractedPDFData, PDFProduct
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load API key and model name from environment variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = os.getenv("GEMINI_MODEL", 'gemini-pro')  # Default to 'gemini-pro' if not set

if not GEMINI_API_KEY:
    logging.warning("GEMINI_API_KEY environment variable not found. LLM calls will fail.")
else:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        logging.info(f"Gemini API configured successfully. Using model: {MODEL_NAME}")
    except Exception as e:
        logging.error(f"Error configuring Gemini API: {e}. LLM calls will likely fail.")

# Define paths relative to this file's location
SERVICE_FILE_DIR = Path(__file__).resolve().parent
EXTRACTIONS_DIR = SERVICE_FILE_DIR.parent.parent / "pdf" / "extractions"
ENHANCED_JSON_DIR = SERVICE_FILE_DIR.parent.parent / "pdf" / "enhanced_json"

def process_single_json_file_for_enhancement(filepath: Path) -> Optional[ExtractedPDFData]:
    """
    Reads a JSON file, sends its entire content to the LLM for enhancement (adding 'gen_terms'),
    and returns the enhanced ExtractedPDFData object if successful.
    """
    if not GEMINI_API_KEY:
        logging.error("Gemini API key not configured. Cannot enhance file.")
        return None
    
    try:
        model = genai.GenerativeModel(MODEL_NAME)
    except Exception as e:
        logging.error(f"Failed to initialize GenerativeModel ('{MODEL_NAME}'): {e}. Cannot enhance file {filepath.name}")
        return None

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            raw_json_content = f.read()
            
           

        prompt_parts = [
            "You are an AI assistant that enhances JSON data for grocery products.",
            "Your task is to add a new attribute called 'gen_terms' to each product object within the 'products' array in the provided JSON data.",
            "The 'gen_terms' attribute should contain a comma-separated string of 5-10 relevant keywords, concepts, or related terms based on the product's existing information (e.g., name, category, promotional details).",
            "For food generally considered healthy (produce/fruits/meats/dairy), add 'healthy' to the attribute.",
            "For food generally considered high in protein (meats/fish/eggs/nuts/beans), add 'high protein' to the attribute.",
            "IMPORTANT: All other parts of the JSON structure and data MUST remain unchanged. Treat the input JSON as immutable except for the addition of the 'gen_terms' attribute to each product.",
            "Ensure the output is identical to the input JSON except for the addition of the 'gen_terms' attribute to each product.",
            "Here is an example input JSON:",
            "```json",
            EXAMPLE_INPUT_JSON,
            "```",
            "Here is an example output JSON:",
            "```json",
            EXAMPLE_OUTPUT_JSON,
            "```",
            "---------------------------------",
            "Here is the REAL JSON data to process:",
            "```json",
            raw_json_content,
            "```",
            "Please return the complete, modified JSON data with the 'gen_terms' added to each product."
        ]
        prompt = "\\n".join(prompt_parts)
        logging.info(f"------------------ Prompt-----------:\n{prompt}")
        logging.info(f"Sending content of {filepath.name} to Gemini ('{MODEL_NAME}') for enhancement.")
        
      
        response = model.generate_content(prompt)

        if response.parts:
            llm_output_json_string = "".join(part.text for part in response.parts).strip()
            
            # The LLM might return the JSON string within a code block (e.g., ```json ... ```)
            # We need to strip that if present.
            if llm_output_json_string.startswith("```json"):
                llm_output_json_string = llm_output_json_string[len("```json"):].strip()
            if llm_output_json_string.endswith("```"):
                llm_output_json_string = llm_output_json_string[:-len("```")].strip()
            
            logging.info(f"--- LLM Raw Output for {filepath.name} ---") # Log the raw LLM output
            logging.info(llm_output_json_string)
            logging.info("--- End of LLM Raw Output ---")
            
            logging.debug(f"Raw LLM JSON output for {filepath.name}:\\n{llm_output_json_string}")

            try:
                enhanced_json_data = json.loads(llm_output_json_string)
                # Validate with Pydantic schema
                validated_enhanced_data = ExtractedPDFData(**enhanced_json_data)
                logging.info(f"Successfully parsed and validated LLM response for {filepath.name}.")
                return validated_enhanced_data
            except json.JSONDecodeError as je:
                logging.error(f"Failed to decode JSON from LLM response for {filepath.name}: {je}")
                logging.error(f"LLM Output that failed to parse: {llm_output_json_string}")
                return None
            except Exception as e: # Catch Pydantic validation errors or other issues
                logging.error(f"Failed to validate or process LLM JSON response for {filepath.name}: {e}")
                logging.error(f"LLM Output that failed validation: {llm_output_json_string}")
                return None
        else:
            logging.warning(f"No content (parts) generated by LLM for file '{filepath.name}'. Response: {response}")
            if hasattr(response, 'prompt_feedback') and response.prompt_feedback:
                logging.warning(f"Prompt feedback for '{filepath.name}': {response.prompt_feedback}")
            return None

    except FileNotFoundError:
        logging.error(f"File not found: {filepath}")
        return None
    # Removed the specific json.JSONDecodeError for initial file read as it's handled inside the try block for raw_json_content
    except Exception as e:
        logging.error(f"An unexpected error occurred while processing file {filepath}: {e}")
        return None


def enhance_all_json_files():
    """
    Iterates through all JSON files in the extractions directory,
    enhances them by asking the LLM to add generated terms to the whole JSON content,
    and saves them to the enhanced_json directory.
    """
    if not GEMINI_API_KEY:
        logging.error("GEMINI_API_KEY not configured. Halting enhancement process.")
        return

    ENHANCED_JSON_DIR.mkdir(parents=True, exist_ok=True)

    processed_files = 0
    failed_files = 0

    extraction_files = list(EXTRACTIONS_DIR.glob("*.json"))
    if not extraction_files:
        logging.info(f"No JSON files found in {EXTRACTIONS_DIR}. Nothing to process.")
        return

    logging.info(f"Found {len(extraction_files)} JSON files to process in {EXTRACTIONS_DIR} using model '{MODEL_NAME}'.")

    for filepath in extraction_files:
        logging.info(f"Processing file: {filepath.name}...")
        enhanced_data_model = process_single_json_file_for_enhancement(filepath)
        
        if enhanced_data_model:
            output_filepath = ENHANCED_JSON_DIR / filepath.name
            try:
                with open(output_filepath, 'w', encoding='utf-8') as f:
                    # Use .model_dump_json() for Pydantic models to ensure proper serialization of date objects
                    f.write(enhanced_data_model.model_dump_json(indent=2))
                logging.info(f"Successfully enhanced and saved: {output_filepath.name}")
                processed_files += 1
            except Exception as e:
                logging.error(f"Error writing enhanced data for {filepath.name} to {output_filepath}: {e}")
                failed_files += 1
        else:
            logging.warning(f"Failed to process or enhance file: {filepath.name}")
            failed_files += 1
            
    logging.info("JSON Enhancement Process Summary:")
    logging.info(f"Total files found: {len(extraction_files)}")
    logging.info(f"Successfully processed: {processed_files}")
    logging.info(f"Failed to process: {failed_files}")

if __name__ == "__main__":
    logging.info("Starting JSON enhancement service...")
    if not GEMINI_API_KEY:
        logging.warning("Reminder: GEMINI_API_KEY is not set. LLM operations will not work as expected.")
    enhance_all_json_files()
    logging.info("JSON enhancement service finished.")

EXAMPLE_INPUT_JSON ="""
{
  "retailer": "Aldi",
  "weekly_ad": {
    "valid_from": "2025-05-21",
    "valid_to": "2025-05-27",
    "date_processed": "2025-05-21",
    "filename": "Aldi-weekly-22.pdf"
  },
  "products": [
    {
      "name": "Black Angus Patties",
      "price": 5.49,
      "retailer": "Aldi",
      "description": null,
      "unit": "Pound",
      "category": "Meats",
      "promotion_details": "was $5.99",
      "original_price": 5.99,
      "promotion_from": null,
      "promotion_to": null,
      "is_frontpage": true,
      "emoji": "🍔"
    },
    {
      "name": "Red Grapes",
      "price": 1.29,
      "retailer": "Aldi",
      "description": null,
      "unit": "Pound",
      "category": "Fruits",
      "promotion_details": "was $1.59",
      "original_price": 1.59,
      "promotion_from": null,
      "promotion_to": null,
      "is_frontpage": true,
      "emoji": "🍇"
    },
    {
      "name": "Indoor/Outdoor Rug",
      "price": 14.99,
      "retailer": "Aldi",
      "description": null,
      "unit": "Each",
      "category": "Other",
      "promotion_details": "5' x 7', Reversible",
      "original_price": null,
      "promotion_from": null,
      "promotion_to": null,
      "is_frontpage": false,
      "emoji": "🛋️"
    }
  ]
}
"""

EXAMPLE_OUTPUT_JSON = """
{
  "retailer": "Aldi",
  "weekly_ad": {
    "valid_from": "2025-05-21",
    "valid_to": "2025-05-27",
    "date_processed": "2025-05-21",
    "filename": "Aldi-weekly-22.pdf"
  },
  "products": [
    {
      "name": "Black Angus Patties",
      "price": 5.49,
      "retailer": "Aldi",
      "description": null,
      "unit": "Pound",
      "category": "Meats",
      "promotion_details": "was $5.99",
      "original_price": 5.99,
      "promotion_from": null,
      "promotion_to": null,
      "is_frontpage": true,
      "emoji": "🍔",
      "gen_terms": "beef, ground beef, burgers, grilling, BBQ, frozen, protein, meat, discounted"
    },
    {
      "name": "Red Grapes",
      "price": 1.29,
      "retailer": "Aldi",
      "description": null,
      "unit": "Pound",
      "category": "Fruits",
      "promotion_details": "was $1.59",
      "original_price": 1.59,
      "promotion_from": null,
      "promotion_to": null,
      "is_frontpage": true,
      "emoji": "🍇",
      "gen_terms": "fruit, produce, fresh, snack, healthy, sweet, summer, berries, discounted"
    },
    {
      "name": "Indoor/Outdoor Rug",
      "price": 14.99,
      "retailer": "Aldi",
      "description": null,
      "unit": "Each",
      "category": "Other",
      "promotion_details": "5' x 7', Reversible",
      "original_price": null,
      "promotion_from": null,
      "promotion_to": null,
      "is_frontpage": false,
      "emoji": "🛋️",
      "gen_terms": "home decor, patio, garden, reversible, flooring, mat, living, furniture, household"
    }
  ]
}
"""