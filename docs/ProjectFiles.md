```
grocery-budget-assistant/
├── backend/ Backend code and related files.
│ ├── app/ Directory contains core FastAPI app logic.
│ │ ├── __init__.py ── Marks app directory as Python package, enables relative imports.
│ │ ├── main.py ── Main FastAPI app entry point. Initializes app, includes routers.
| | |=====================================
│ │ ├── routers/ Directory contains APIRouter modules grouping endpoints.
│ │ │ ├── __init__.py ── Marks routers as Python package.
│ │ │ ├── data.py ── Defines /data API endpoints for Postgres DB tables (retailers, weekly ads, products)
│ │ │ └── pdf.py ── Defines /pdf API endpoints managing PDF processing workflow.
| | |=====================================
│ │ ├── services/ Directory contains business logic, external service interactions.
│ │ │ ├── __init__.py ── Marks services as Python package.
│ │ │ └── pdf_processor.py ── GroceryAdProcessor class orchestrating PDF data extraction via Gemini, saves JSON output.
| | |=====================================
│ │ ├── schemas/ Directory contains Pydantic models for data validation, serialization.
│ │ │ ├── __init__.py ── Marks schemas as Python package.
│ │ │ ├── data_schemas.py ── Defines Pydantic models representing database data structure (Retailer, Ad, Product).
│ │ │ └── pdf_schema.py ── Defines Pydantic models representing data structure extracted from PDFs by Gemini.
| | |=====================================
│ │ ├── database.py ── Configures, manages SQLAlchemy database connection using env vars. Provides session dependency.
│ │ ├── models.py ── Defines SQLAlchemy ORM classes mapping Python objects to database tables.
│ │ └── crud.py ── Contains database operations (CRUD) functions using SQLAlchemy models, sessions. Tailored for different data sources, workflows.
| |=====================================
│ ├── uploads/ ── Directory is input location for PDF weekly ad files needing processing.
│ ├── extractions/ ── Directory saves structured JSON data extracted from PDFs by pdf_processor service.
│ ├── sql/ Directory holds database schema related SQL files.
│ │ └── schema.sql ── Contains raw SQL statements to create database tables, indexes, functions.
│ ├── .env.example ── Template file showing required environment variables.
│ ├── requirements.txt ── Lists Python dependencies required for backend service. Ensures reproducible environment.
│ └── Procfile ── Configuration file for deployment platforms like Heroku, specifying process types.
|---------------------------------------------------------------
├── docs/ Directory contains documentation files.
│ ├── PRD.md ── Product Requirements Document.
│ ├── Feature_PostgresDB ── Feature-specific details for Postgres integration.
│ ├── ProjectDoc.md ── High-level project structure and technologies document.
│ ├── ProjectFiles.md ── Detailed descriptions of key project files.
│ └── Mermaid.md ── Diagrams illustrating structure and flow.
|---------------------------------------------------------------
├── frontend/ Directory contains frontend application code.
│ ├── public/ Contains static assets served directly by web server.
│ │ └── vite.svg ── Example static asset (Vite logo).
│ ├── src/ Contains React/TypeScript source code for frontend application.
│ │ ├── assets/ Directory for frontend-specific static assets like images or logos.
│ │ │ └── react.svg ── Example frontend asset (React logo).
│ │ ├── services/ Contains modules related to external services like API communication.
│ │ │ └── api.ts ── Configures Axios client for API requests to backend service.
│ │ ├── App.css ── Contains CSS styles specific to App.tsx component.
│ │ ├── App.tsx ── Root React component. Manages layout and routing logic.
│ │ ├── index.css ── Contains global CSS styles applied across application.
│ │ ├── main.tsx ── Main entry point for React application. Renders root component.
│ │ └── vite-env.d.ts ── TypeScript declaration file for Vite environment variables.
| |=====================================
│ ├── cypress/ Contains end-to-end tests written using Cypress framework.
│ │ ├── e2e/ Directory holds end-to-end test specification files.
│ │ │ └── counter.cy.ts ── Example end-to-end test file.
│ │ ├── fixtures/ Contains static data used by Cypress tests.
│ │ │ └── example.json ── Example fixture data file.
│ │ └── support/ Contains reusable Cypress commands, test setup utilities.
│ │ ├── commands.ts ── Defines custom, reusable Cypress commands for tests.
│ │ └── e2e.ts ── Configuration file for Cypress end-to-end test setup.
| |=====================================
│ ├── index.html ── Main HTML template. App's JavaScript bundle injected here.
│ ├── package.json ── Defines Node.js project metadata, dependencies, scripts (build, test).
│ ├── vite.config.ts ── Configuration for Vite build tool, development server.
│ ├── tsconfig.json ── Root TypeScript configuration file for frontend project.
│ ├── tsconfig.app.json ── TypeScript configuration specific to app code within src/.
│ ├── tsconfig.node.json ── TypeScript configuration for Node.js parts like Vite config.
│ ├── tsconfig.cypress.json ── TypeScript configuration specific to Cypress test files.
│ ├── cypress.config.js ── Main configuration file for Cypress testing framework.
│ └── eslint.config.js ── Configuration for ESLint, code linting and style enforcement.
```
