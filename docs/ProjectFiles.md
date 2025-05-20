grocery-budget-assistant/
├── backend/ Backend code and related files.
│ ├── app/ Directory contains core FastAPI app logic.
│ │ ├── main.py ── Main FastAPI app entry point. Initializes app, includes routers.
| | |=====================================\
│ │ ├── routers/ Directory contains APIRouter modules grouping endpoints.
│ │ │ ├── data.py ── Defines /data API endpoints for retrieving Postgres DB data (currently unused/placeholder).
│ │ │ ├── products.py ── Defines /products API endpoints for searching and managing product data.
│ │ │ ├── retailers.py ── Defines /retailers API endpoints for managing retailer data.
│ │ │ └── pdf.py ── Defines /pdf API endpoints managing PDF processing workflow.
| | |=====================================\
│ │ ├── services/ Directory contains business logic, external service interactions.
│ │ │ ├── pdf_processor.py ── PDF data extraction via Gemini, saves JSON output.
│ │ │ ├── pdf_prompts.py ── Contains prompt templates and lists for Gemini PDF extraction.
│ │ │ ├── json_to_db_service.py ── Processes extracted JSON files into Postgres DB tables.
│ │ │ ├── product_service.py ── Business logic for product-related operations.
│ │ │ └── retailer_service.py ── Business logic for retailer-related operations.
| | |=====================================\
│ │ ├── schemas/ Directory contains Pydantic models for data validation, serialization.
│ │ │ ├── base_schemas.py ── Defines base Pydantic schemas shared by other schema files.
│ │ │ ├── data_schemas.py ── Defines Pydantic models representing database data structure (Retailer, Ad, Product).
│ │ │ └── pdf_schema.py ── Defines Pydantic models representing data structure extracted from PDFs by Gemini.
| | |=====================================\
│ │ ├── utils/ Directory contains utility functions and SQL schema for the backend.
│ │ │ ├── utils.py ── Provides utility functions, e.g., finding the project root.
│ │ │ └── schema.sql ── Contains raw SQL statements to create database tables, indexes, functions.
| | |=====================================\
│ │ ├── database.py ── Configures, manages SQLAlchemy database connection. Provides session dependency.
│ │ ├── models.py ── Defines SQLAlchemy ORM classes mapping Python objects to database tables.
│ │ └── **init**.py ── Makes the 'app' directory a Python package.
| |=====================================\
│ ├── pdf/ ── Directory contains PDF-related data files.
│ │ ├── uploads/ ── Directory is input location for PDF weekly ad files needing processing.
│ │ ├── extractions/ ── Directory saves structured JSON data extracted from PDFs by pdf_processor service.
│ │ └── archived/ ── Directory for storing processed PDF files and their extractions.
│ ├── requirements.txt ── Lists Python dependencies required for backend service. Ensures reproducible environment.
│ ├── Procfile ── Configuration file for deployment platforms like Heroku, specifying process types.
|---------------------------------------------------------------------------------------------
├── docs/ Directory contains documentation files.
│ ├── PRD.md ── Product Requirements Document.
│ ├── ProjectDoc.md ── High-level project structure and technologies document.
│ ├── ProjectFiles.md ── Detailed descriptions of key project files.
│ ├── Mermaid.md ── Diagrams illustrating structure and flow.
│ ├── Tasks.md ── Tracks project tasks and progress.
│ └── feature-docs/ ── (Files purposely not listed)
|---------------------------------------------------------------------------------------------
├── frontend/ Directory contains frontend application code.
│ ├── public/ Contains static assets served directly by web server.
│ │ └── assets/logos/ ── Contains logo image files.
| |=====================================\
│ ├── src/ Contains React/TypeScript source code for frontend application.
| |=====================================\
│ │ ├── components/ Directory for reusable React components.
| | | |=====================================\
│ │ │ ├── common/ ── Contains general-purpose reusable components.
| | | | |=====================================\
│ │ │ │ ├── BottomNav.css ── Styles for BottomNav component.
│ │ │ │ ├── BottomNav.tsx ── Component for bottom navigation.
│ │ │ │ ├── FullOverlay.tsx ── Component for displaying full-screen overlays.
│ │ │ │ ├── LoadingSpinner.css ── Styles for LoadingSpinner component.
│ │ │ │ ├── LoadingSpinner.tsx ── Component displaying a loading animation.
│ │ │ │ ├── ModalBase.css ── Styles for ModalBase component.
│ │ │ │ ├── ModalBase.tsx ── Base component for modals.
│ │ │ │ ├── ProductCard.css ── Styles for ProductCard component.
│ │ │ │ ├── ProductCard.tsx ── Component displaying product details.
│ │ │ │ ├── ResultsView.css ── Styles for ResultsView component.
│ │ │ │ ├── ResultsView.tsx ── Component for displaying results.
│ │ │ │ └── SearchOverlay.tsx ── Component providing a search input overlay.
| | | | |=====================================\
│ │ │ ├── header/ ── Contains components related to the application header.
| | | | |=====================================\
│ │ │ │ ├── CartIcon.tsx ── Component for the cart icon in the header.
│ │ │ │ ├── SearchBar.tsx ── Component for the search bar in the header.
│ │ │ │ └── TopBar.tsx ── Component for the top bar section of the header.
| | | | |=====================================\
│ │ │ ├── modals/ ── Contains modal components.
| | | | |=====================================\
│ │ │ │ ├── CategoryFilterModal.tsx ── Modal for filtering products by category.
│ │ │ │ └── StoreFilterModal.tsx ── Modal for filtering products by store/retailer.
| | | | |=====================================\
│ │ │ ├── not_used/ ── Contains components that are currently not in use.
| | | | |=====================================\
│ │ │ │ ├── DeliveryOptions.tsx ── Component related to delivery options (not used).
│ │ │ │ └── SponsoredAd.tsx ── Component for sponsored ads (not used).
| | | | |=====================================\
│ │ │ ├── pdf-upload/ ── Contains the PdfUpload component and its related files.
| | | | |=====================================\
│ │ │ │ ├── index.ts ── Barrel file exporting the PdfUpload component.
│ │ │ │ └── PdfUpload.tsx ── React component for handling PDF uploads.
| | | | |=====================================\
│ │ │ ├── sidebar/ ── Contains components related to the application sidebar.
| | | | |=====================================\
│ │ │ │ ├── FontSelector.tsx ── Component for selecting application font.
│ │ │ │ ├── SideBar.tsx ── Main sidebar component controlling themes, fonts, etc.
│ │ │ │ └── ThemeSelector.tsx ── Component for selecting application theme.
| | | | |=====================================\
│ │ │ ├── Header.tsx ── Main application header component (Consider moving to `header/` or clarifying role).
│ │ │ └── MainContent.tsx ── Component rendering the main application content area.
| | |=====================================\
│ │ ├── hooks/ ── Contains custom React hooks for state management and logic.
│ │ │ ├── useAppTab.ts ── Hook for managing application tab state.
│ │ │ ├── useRetailers.ts ── Hook managing retailer data fetching and state.
│ │ │ ├── useSearch.ts ── Hook managing search state and API calls.
│ │ │ └── useTheme.ts ── Hook managing application theme and font state.
| | |=====================================\
│ │ ├── services/ Contains modules related to external services like API communication.
│ │ │ └── api.ts ── Configures Axios client for API requests to backend service.
| | |=====================================\
│ │ ├── styles/ ── Contains CSS files and style-related TypeScript modules.
│ │ │ ├── App.css ── General application styles.
│ │ │ ├── DefaultBrowseView.css ── Styles for DefaultBrowseView.
│ │ │ ├── fonts.ts ── Definitions for available application fonts.
│ │ │ ├── index.css ── Global styles and resets.
│ │ │ ├── LoadingSpinner.css ── Styles for the LoadingSpinner component.
│ │ │ ├── ProductCard.css ── Styles for ProductCard component.
│ │ │ ├── ResultsView.css ── Styles for ResultsView component.
│ │ │ ├── SideBar.css ── Styles for SideBar component.
│ │ │ └── themes.ts ── Definitions for available application themes.
| | |=====================================\
│ │ ├── types/ ── Contains TypeScript type definitions.
│ │ │ ├── product.ts ── Type definitions for Product data.
│ │ │ └── retailer.ts ── Type definitions for Retailer data.
| | |=====================================\
│ │ ├── utils/ ── Contains utility functions.
│ │ │ └── localStorageUtils.ts ── Utility functions for local storage.
| | |=====================================\
│ │ ├── views/ ── Contains components representing distinct application views/pages.
│ │ │ ├── BrowseResultsView.tsx ── View for displaying browse results.
│ │ │ ├── DefaultBrowseView.tsx ── Default view for browsing.
│ │ │ ├── DefaultSearchView.tsx ── Default view for searching.
│ │ │ └── SearchResultsView.tsx ── View displaying search results.
| | |=====================================\
│ │ ├── App.tsx ── Root React component. Manages layout, routing logic, and global state context.
│ │ ├── main.tsx ── Main entry point for React application. Renders root component into the DOM.
│ │ └── vite-env.d.ts ── TypeScript declaration file for Vite environment variables.
|---------------------------------------------------------------------------------------------
│ ├── cypress/ Contains end-to-end tests written using Cypress framework.
│ │ ├── e2e/ Directory holds end-to-end test specification files.
│ │ ├── fixtures/ Contains static data used by Cypress tests.
│ │ └── support/ Contains reusable Cypress commands, test setup utilities.
|---------------------------------------------------------------------------------------------
│ ├── .env.example ── Template file showing required environment variables for the frontend.
│ ├── README.md ── Provides information about the frontend setup and development.
│ ├── index.html ── Main HTML template. App's JavaScript bundle injected here.
│ ├── package.json ── Defines Node.js project metadata, dependencies, scripts (build, test).
│ ├── vite.config.ts ── Configuration for Vite build tool, development server.
│ ├── tsconfig.json ── Root TypeScript configuration file for frontend project.
│ ├── tsconfig.app.json ── TypeScript configuration specific to app code within src/.
│ ├── tsconfig.node.json ── TypeScript configuration for Node.js parts like Vite config.
│ ├── tsconfig.cypress.json ── TypeScript configuration specific to Cypress test files.
│ ├── cypress.config.js ── Main configuration file for Cypress testing framework. (Consider renaming to .ts)
│ ├── cypress.config.ts.bak ── Backup of Cypress configuration.
│ └── eslint.config.js ── Configuration for ESLint, code linting and style enforcement.
