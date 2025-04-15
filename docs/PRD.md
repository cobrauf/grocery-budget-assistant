# Product Requirements Document: Smart Grocery Budget Shopping Assistant (v1.0)

## 1. Introduction
This document outlines the requirements for the Smart Grocery Budget Shopping Assistant. The goal is to create a tool that helps users save money and time by automatically analyzing weekly grocery ads from nearby stores and suggesting optimized shopping lists based on user preferences and budget constraints.

## 2. Goals
- **User Goal**: Enable users to easily identify the best deals on their required grocery items across multiple local stores.
- **User Goal**: Reduce the time and effort involved in manually comparing weekly ads and planning shopping trips.
- **Project Goal**: Develop a functional prototype demonstrating core features using Python, Langchain/LangGraph/LangSmith, Pydantic, Cypress testing, and Supabase/Postgres.

## 3. Target Audience
Budget-conscious individuals or families who:
- Regularly shop for groceries
- Are interested in maximizing savings through weekly ads
- Reside in areas with accessible digital grocery flyers

## 4. Key Features (MVP Focus)

### User Profile Management
- Allow users to define their budget (e.g., weekly)
- Allow users to specify preferred grocery stores (based on location/convenience)
- Allow users to note dietary preferences or item restrictions (optional)

### Shopping List Input
- Provide an interface for users to input their desired grocery items (e.g., "1 lb Chicken Breast", "Gala Apples", "Milk")

### Ad Data Ingestion & Management
- **Initial**: Mechanism for manually inputting or semi-automatically processing AdItem data (Item Name, Sale Price, Unit, Store, Dates) from selected local stores' weekly ads into the database
- **Future Goal**: Implement automated scraping/extraction of ad data from store websites/flyers

### Deal Matching & Recommendation Engine
- Compare items on the user's shopping list against available AdItem data for the current week
- Employ fuzzy matching (potentially LLM-assisted) to handle variations in item names (e.g., "Chicken Breast" vs. "Boneless Skinless Chicken Breast Pack")
- Identify the store(s) offering the best price for each matched item

### Optimized Shopping List Generation
- Generate one or more suggested shopping lists based on matching results
- Prioritize minimizing total cost within the user's budget
- Consider user's preferred stores
- **Future Goal**: Optimize for minimizing the number of stores visited

## 5. Technology Stack
- **Backend Language**: Python
- **Data Validation & Modeling**: Pydantic (for API interactions, database models, LLM inputs/outputs, LangGraph state)
- **Database**: Supabase (Postgres) (for storing UserProfile, ShoppingList, Store, AdItem data)
- **AI/LLM Interaction & Orchestration**: Langchain (for LLM calls - fuzzy matching, potential data extraction) & LangGraph (for multi-step planning/agentic workflow: fetch data -> match -> apply constraints -> optimize plan), LangSmith for observability
- **Frontend/API**: Simple Web Interface (e.g., Streamlit or FastAPI) for user input and displaying results. React/Vite for UI.
- **Data Extraction (Future)**: Python libraries (e.g., requests, BeautifulSoup), potentially OCR (pytesseract), and/or LLM-based extraction via Langchain

## 6. Proposed Phased Rollout
1. **Phase 1: Foundation**
   - Setup project, database (Supabase), Pydantic models
   - Manual ad data entry
   - Basic exact item matching

2. **Phase 2: Intelligence**
   - Implement LLM-based fuzzy matching (Langchain)
   - Develop initial planning logic (cheapest item finding)
   - Refactor planning into LangGraph state machine

3. **Phase 3: Automation & Enhancements**
   - Attempt automated ad data extraction
   - Add advanced optimization (e.g., travel time/store consolidation)

## 7. Success Metrics
- Percentage of shopping list items successfully matched to weekly ads
- Average cost savings compared to purchasing all items at a single store
- User satisfaction with recommendations (based on feedback)

## 8. Assumptions and Constraints
- Users have access to internet connectivity to access the application
- Weekly ad data will be reasonably structured and accessible
- Initial version may require some manual data entry
- LLM API costs will need to be managed for sustainable operation

## 9. Dependencies
- Access to grocery store weekly ads in digital format
- API access to LLM services (e.g., OpenAI)
- Supabase/Postgres database setup and configuration

## 10. Future Considerations (Post-MVP)
- Mobile application version
- Integration with grocery delivery services
- Personalized recommendations based on purchase history
- Meal planning suggestions based on sale items