Number of times this file has been updated: 6

## In Progress Tasks

- [ ] BACKEND - Search: add search feature
      (Subtask) - [x] Add endpoint to search in Postman

## Completed Tasks

- [x] Installed Python env, React, Vite, and TypeScript libraries.
- [x] Started Product Requirements Document (PRD) and project notes documentation.
- [x] Installed Cypress for end-to-end testing (Husky setup was problematic).
- [x] Pushed the project to Render, confirmed it is working.
- [x] Added FastAPI endpoints for creating retailers, weekly ads, and products.
- [x] Set up Supabase Postgres DB with three tables for data storage.
- [x] Added Pydantic models as parameters for the FastAPI endpoints.
- [x] Got PDF extraction to JSON working, lots of tweaks.
- [x] Schemas: Review Pydantic schemas (`pdf_schema.py` and `data_schemas.py`) to improve data flow from PDF extraction to database.
  - [x] Update `pdf_schema.py` to include all desired fields for extraction (e.g., unit, category for products).
  - [x] Modify PDF extraction logic in `pdf_processor.py` to populate the new fields in `pdf_schema.py`.
  - [x] Explore using inheritance (e.g., `PDFProduct` from `ProductBase`) to link schemas once field alignment is achieved.
- [x] Database: Implement process to upload extracted JSON data to PostgreSQL.
      (Subtask) - [x] Define feature requirements and plan in `docs/feature-docs/Feature-json-to-DB.md`.
      (Subtask) - [x] Create `backend/app/services/json_to_db_service.py` with core logic for: - DB connection - Iterating JSON files in `backend/pdf/extractions/` - Duplicate filename check in `weekly_ads` table - Finding retailer from JSON - Updating `ad_period` for existing ads (previous->archived, current->previous) - Inserting new `WeeklyAd` with `ad_period='current'` - Inserting new `Products` linked to the ad and retailer

## Future Tasks

- [ ] FRONTEND - Shopping List: Provide an interface for users to input their desired grocery items.
- [ ] FRONTEND - User Profile: Allow users to define their budget, add preferences.
- [ ] FRONTEND - Shopping List Gen: Generate lists prioritizing minimal cost within budget.
- [ ] FRONTEND - Shopping List Gen: Consider user's preferred stores in list generation.
- [ ] FRONTEND - Shopping List Gen: Optimize for minimizing the number of stores visited.
- [ ] FRONTEND - Deal Matching: Implement basic exact item matching.

- [ ] BACKEND - Ad Data: Implement automated scraping/extraction of ad data from store websites/flyers.
- [ ] BACKEND - Automation: Attempt automated ad data extraction (Phase 3).
