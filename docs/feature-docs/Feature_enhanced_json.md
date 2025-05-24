Okay, this is a solid plan for enhancing your data quality before it even hits the database. Creating an intermediary "enhanced_json" step is a great way to isolate this enrichment process.
Here's a Product Requirements Document (PRD) for this feature, followed by a list of incremental tasks.
Product Requirements Document: LLM-Powered JSON Data Enhancement

1. Introduction
   This document outlines the requirements for a service that takes JSON files extracted from grocery ad PDFs, enhances them using a Large Language Model (LLM, specifically Gemini), and outputs new JSON files with added keywords and corrected data. This process aims to improve the searchability and data quality of product information before it is ingested into the database.
2. Goals
   To enrich product data within existing JSON extractions by adding relevant keywords and concepts using an LLM.
   To implement automated data quality checks and corrections for specific fields (e.g., emoji, price) using an LLM.
   To produce new "enhanced" JSON files that maintain the original structure but include the added keywords and corrections.
   To create a reusable and extendable process for future data enhancements.
3. Target Input & Output
   Input: JSON files located in the backend/pdf/extractions/ directory. These files are assumed to conform to the ExtractedPDFData schema (backend/app/schemas/pdf_schema.py).
   Output: New JSON files written to a backend/pdf/enhanced_json/ directory. These files will have the same overall structure as the input but will include:
   A new attribute within each product object (e.g., gen_terms: str) containing 5-10 comma-separated keywords.
   Corrections to existing fields based on defined rules (e.g., a more suitable emoji if the current one is "❔", ensuring price is not null and if null, remove the item).

Error Handling: If a file cannot be processed or enhancement fails significantly, it should be logged, and potentially the original file copied over or a specific error marker added to the output JSON. 4. Key Features
LLM-Powered Keyword Generation:
For each product in an input JSON, the service will use its existing data (name, category, description, promotion details) to prompt an LLM.
The LLM will generate 5-10 relevant additional keywords, concepts, or related terms.
These keywords will be stored as a comma-separated string in a new field (e.g., gen_terms) within each product object in the output JSON.

Data Quality Check & Correction - Emoji:
If a product's emoji field is "❔" (or a similar placeholder for unknown), the service will use the LLM to suggest a more appropriate emoji based on the product's name and category.
The emoji field in the output JSON will be updated with the LLM's suggestion.

Data Quality Check & Correction - Price:
The service will ensure that the price field for each product is not null and if null, remove the item entirely.

File Processing:
The service will iterate through all JSON files in the input extractions directory.
For each input file, it will generate a corresponding output file in the enhanced_json directory, preserving the original filename.
The service should avoid reprocessing files if an enhanced version with a similar timestamp or content hash already exists (optional, for efficiency).

Schema Consistency: The output JSON files must still be parsable by the ExtractedPDFData schema, potentially with the new gen_terms field being optional or added to an updated schema. 5. LLM Interaction
The system will use the Google Gemini API.
Prompts will be carefully engineered for:
Keyword generation, specifying the desired number and type of keywords.
Emoji suggestion based on product details.
(Suggested) Price inference from promotional text if price is null.

The LLM's output will be parsed and integrated into the new JSON structure. 6. Technology
Python
google-generativeai SDK
Standard library modules for file I/O and JSON processing. 7. Assumptions
Input JSON files are correctly structured according to ExtractedPDFData.
Access to a configured Gemini API (with API key).
The ExtractedPDFData Pydantic schema might need to be updated to include the new gen_terms field (e.g., as Optional[str]).

Incremental Implementation Tasks
Here's a breakdown of tasks. I'm aiming for logical chunks that result in testable changes. Work thru each task then ask me to test the change before moving on to the next task.
Phase 1: Basic Keyword Generation for a Single Product
Task 1.1: Setup Basic Service & LLM Call for Keywords.
Create a new Python script/module (e.g., backend/app/services/json_enhancer_service.py).
Write a function that takes a single product dictionary (from the JSON) as input.
Inside this function, construct a prompt for Gemini to generate 5-10 keywords based on the product's name, category, and description.
Make an actual call to the Gemini API using the google-generativeai SDK.
Testable Change: Print the LLM's raw keyword response to the console for a sample product. You can manually create a sample product dictionary in your script for testing.

Task 1.2: Parse LLM Keyword Response & Add to Product.
Modify the function from Task 1.1 to parse the LLM's keyword string (e.g., comma-separated) into a clean string.
Add this parsed string as a new key (e.g., gen_terms) to the input product dictionary.
Testable Change: Print the modified product dictionary to the console, showing the new gen_terms field populated.

Phase 2: Processing a Full JSON File & Outputting
Task 2.1: Process All Products in One JSON File.
Create a new function in json_enhancer_service.py that takes a full ExtractedPDFData Pydantic object (or the raw dictionary loaded from a JSON file) as input.
Send the entire json data to the api and ask it to generate terms and return the new data. This should be 1 api call.
Testable Change: Load a sample JSON file from extractions/ in your script, process it using this new function, and print the entire modified data structure (with keywords added to all products) to the console.

Task 2.2: Write Enhanced Data to a New JSON File.
Modify the function from Task 2.1 to take an input file path and an output directory path.
After processing all products, write the modified ExtractedPDFData (now including gen_terms for each product) to a new JSON file in the specified output directory (e.g., enhanced_json/). Preserve the original filename.
Ensure the output JSON is well-formatted (e.g., json.dump with indent=2).
Testable Change: Run the script with a sample input JSON from extractions/. Verify that a new, correctly named JSON file appears in enhanced_json/ and that it contains the added gen_terms fields for all products.

Phase 3: Implementing Data Quality Checks (Emoji & Price)
Task 3.1: LLM-Powered Emoji Correction.
In json_enhancer_service.py, create a new function that takes a product dictionary.
If product['emoji'] == '❔', construct a prompt for Gemini to suggest a more suitable emoji based on product['name'] and product['category'].
Call Gemini, parse its response (expecting a single emoji character), and update product['emoji'].
Integrate this emoji correction function into the main file processing logic (from Task 2.1) so it's called for each product before keyword generation (or after, order might not strictly matter here but before seems fine).
Testable Change: Use an input JSON where some products have "❔" emojis. Check the output JSON in enhanced_json/ to see if these emojis have been updated to more appropriate ones.

Task 3.2: Price Null Check (Initial Reporting).
Modify the product processing loop. If product['price'] is null or not present:
For now, simply log a warning to the console (e.g., Product X in file Y has a null price.).

Testable Change: Use an input JSON where a product has a null price. Verify the warning is logged. The output JSON will still have the null price for now.

Phase 4: Orchestration and Robustness
Task 4.1: Main Orchestration Script.
Create a main execution block or function in json_enhancer_service.py (or a separate run_enhancer.py script).
This script should:
Define input (extractions/) and output (enhanced_json/) directories.
Ensure the output directory exists.
Glob all \*.json files in the input directory.
For each file, call the main processing function (developed in Task 2.2 and enhanced in Phase 3).
Add basic logging (e.g., "Processing file X...", "Finished processing file X, output to Y").

Testable Change: Place multiple JSON files in extractions/. Run the main script. Verify all files are processed and corresponding enhanced files appear in enhanced_json/. Check console logs.

Task 4.2: Update Pydantic Schema for gen_terms.
In backend/app/schemas/pdf_schema.py, modify the PDFProduct schema (or its base).
Add gen_terms: Optional[str] = None. This makes the field optional so your existing json_to_db_service can still read older JSONs if needed, but new ones will have it.
Testable Change: Your json_to_db_service (when you eventually point it to enhanced_json/) should be able to parse the new JSONs without Pydantic validation errors related to the new field. You can test this locally by trying to load an enhanced JSON using ExtractedPDFData.model_validate_json().

Suggestions & Considerations during these tasks:
LLM Costs & Rate Limits: Be mindful of making too many LLM calls, especially if you have many products per JSON or many JSON files. For development, test with a small subset of files/products. Gemini has free tiers, but be aware of limits.
Prompt Engineering: The quality of your keywords and corrections will heavily depend on your prompts. Iterate on them.
Error Handling in LLM Calls: Wrap LLM API calls in try-except blocks. What happens if the API fails for one product? Log the error and continue with the rest? Skip the enhancement for that product?
Idempotency (Optional Advanced): Consider how to avoid re-enhancing already enhanced files if the script is run multiple times. This could involve checking output file existence and modification times, or content hashing. For now, simply overwriting is fine for development.
Configuration: Make API keys and directory paths configurable (e.g., via .env or constants at the top of the script).
This task list should provide a good, incremental path. Let me know what you think!
