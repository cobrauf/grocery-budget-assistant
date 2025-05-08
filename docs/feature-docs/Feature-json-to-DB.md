# Feature: JSON Data to PostgreSQL Upload

## 1. Objective

To create a robust process for uploading structured JSON data, extracted from PDF weekly ads, into the PostgreSQL database. This process will populate the `retailers`, `weekly_ads`, and `products` tables, ensuring data integrity and preventing duplicate entries.

## 2. File Processing Logic

- **Input**: JSON files located in the `backend/pdf/extractions/` directory.
- **Iteration**: The system will iterate through each JSON file in the specified directory.
- **Schema**: Assumes JSON files conform to the `ExtractedPDFData` schema (`backend/app/schemas/pdf_schema.py`).

## 3. Database Connection

- The process will utilize the existing SQLAlchemy setup defined in `backend/app/database.py` to establish and manage database sessions.

## 4. Duplicate Prevention (Weekly Ads)

- Before processing a JSON file, the system will check the `weekly_ads` table.
- It will use the `filename` field from the JSON's `weekly_ad` object (or the JSON filename itself as a fallback) to see if an ad with the same filename already exists.
- If a match is found, the file will be skipped to prevent duplicate uploads.

## 5. Retailer Handling

- The retailer name will be extracted from the `retailer` field in the JSON data.
- The system will query the `retailers` table to find an existing entry for this retailer.
  - **Assumption**: For this initial implementation, it's assumed the retailer already exists in the database. Handling for new retailers (e.g., auto-creation) can be a future enhancement. If the retailer is not found, an error should be logged, and the file processing might be skipped for that file.

## 6. `WeeklyAd` Management

### 6.1. `ad_period` Update for Existing Ads

- For the identified retailer:
  - All existing `WeeklyAd` records with `ad_period = 'previous'` will be updated to `ad_period = 'archived'`.
  - All existing `WeeklyAd` records with `ad_period = 'current'` will be updated to `ad_period = 'previous'`.
  - This ensures a rolling status for weekly ads.

### 6.2. New `WeeklyAd` Insertion

- A new record will be inserted into the `weekly_ads` table.
- **Fields to populate**:
  - `retailer_id`: Foreign key from the found `Retailer`.
  - `date_processed`: From JSON (`weekly_ad.date_processed`).
  - `valid_from`: From JSON (`weekly_ad.valid_from`).
  - `valid_to`: From JSON (`weekly_ad.valid_to`).
  - `filename`: From JSON (`weekly_ad.filename`).
  - `ad_period`: Set to `'current'`.
- The new `WeeklyAd` ID will be retained for linking products.

## 7. `Product` Insertion

- For each product item in the `products` list of the JSON data:
  - A new record will be inserted into the `products` table.
  - **Fields to populate**:
    - `weekly_ad_id`: Foreign key from the newly inserted `WeeklyAd`.
    - `retailer_id`: Foreign key from the found `Retailer`.
    - `name`: From JSON product item.
    - `price`: From JSON product item.
    - `original_price`: From JSON product item.
    - `unit`: From JSON product item.
    - `description`: From JSON product item.
    - `category`: From JSON product item.
    - `promotion_details`: From JSON product item.
    - `promotion_from`: From JSON product item.
    - `promotion_to`: From JSON product item.
    - `original_text_snippet`: (If available in `PDFProduct`, currently not, but good to note for future schema alignment).
    - `image_url`: (If available).

## 8. Error Handling and Logging

- Implement basic error handling for:
  - File not found or inaccessible.
  - JSON parsing errors.
  - Database errors (e.g., retailer not found).
- Log key events:
  - Start and end of the upload process.
  - Files being processed.
  - Skipped files (duplicates or errors).
  - Number of ads and products inserted.
  - Any errors encountered.

## 9. Script/Service Location and Execution

- The core logic will reside in a new Python module: `backend/app/services/json_to_db_service.py`.
- This service will contain a main function (e.g., `process_json_extractions()`) that orchestrates the entire workflow.
- Consideration for how this script is run (e.g., a CLI script, an administrative FastAPI endpoint, or a scheduled task) will be part of a subsequent step. Initially, it can be a callable function.

## 10. Future Considerations

- Automated creation of new retailers if not found.
- Transactional processing: Ensure that all database operations for a single JSON file are atomic (either all succeed or all fail).
- Moving processed JSON files to an archive directory.
