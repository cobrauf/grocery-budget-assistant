Number of times this file has been updated: 2

## In Progress Tasks

- [ ] Schemas: Review Pydantic schemas (`pdf_schema.py` and `data_schemas.py`) for consistency and potential refactoring to improve data flow from PDF extraction to database.
  - [ ] Update `pdf_schema.py` to include all desired fields for extraction (e.g., unit, category for products).
  - [ ] Modify PDF extraction logic in `pdf_processor.py` to populate the new fields in `pdf_schema.py`.
  - [ ] Explore using inheritance (e.g., `PDFProduct` from `ProductBase`) to link schemas once field alignment is achieved.

## Completed Tasks

- [x] Installed Python environment for the project.
- [x] Installed React, Vite, and TypeScript libraries for frontend development.
- [x] Started Product Requirements Document (PRD) and project notes documentation.
- [x] Installed Cypress for end-to-end testing (Husky setup was problematic).
- [x] Attempted backend testing, but it was not successful.
- [x] Pushed the project to Render, and it is working.
- [x] Added FastAPI endpoints for creating retailers, weekly ads, and products.
- [x] Set up Supabase with three tables for data storage.
- [x] Added Pydantic models as parameters for the FastAPI endpoints.
- [x] Struggled with implementing a PDF extraction flow.

## Future Tasks

- [ ] User Profile: Allow users to define their budget (e.g., weekly).
- [ ] User Profile: Allow users to specify preferred grocery stores.
- [ ] User Profile: Allow users to note dietary preferences or item restrictions.
- [ ] Shopping List: Provide an interface for users to input their desired grocery items.
- [ ] Ad Data: Implement automated scraping/extraction of ad data from store websites/flyers.
- [ ] Deal Matching: Compare shopping list items against AdItem data.
- [ ] Deal Matching: Employ LLM-assisted fuzzy matching for item names.
- [ ] Deal Matching: Identify store(s) offering the best price for each item.
- [ ] Shopping List Gen: Generate lists prioritizing minimal cost within budget.
- [ ] Shopping List Gen: Consider user's preferred stores in list generation.
- [ ] Shopping List Gen: Optimize for minimizing the number of stores visited.
- [ ] Ad Data: Implement manual ad data entry mechanism.
- [ ] Deal Matching: Implement basic exact item matching.
- [ ] Intelligence: Implement LLM-based fuzzy matching (Langchain).
- [ ] Intelligence: Develop initial planning logic (cheapest item finding).
- [ ] Intelligence: Refactor planning into LangGraph state machine.
- [ ] Automation: Attempt automated ad data extraction (Phase 3).
- [ ] Enhancements: Add advanced optimization (travel time/store consolidation).
- [ ] Post-MVP: Develop a mobile application version.
- [ ] Post-MVP: Integrate with grocery delivery services.
- [ ] Post-MVP: Personalized recommendations based on purchase history.
- [ ] Post-MVP: Meal planning suggestions based on sale items.
- [ ] Database: Implement process to upload extracted JSON data to PostgreSQL.
- [ ] Testing: Successfully implement and execute backend tests.
- [ ] Testing: Resolve issues with Husky setup for Cypress.
