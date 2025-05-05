# Project File Descriptions

This document provides concise descriptions for key files in the `grocery-budget-assistant` project.
File order follows the structure diagram in `docs/ProjectDoc.md`.

## Backend Files (`backend/`)

### `app/`

Directory containing the core FastAPI application logic.

#### `__init__.py`

Marks the `app` directory as a Python package, enabling relative imports.

#### `main.py`

Main FastAPI application entry point. Initializes the FastAPI app and includes routers from the `app/routers` directory.

#### `routers/`

Directory containing APIRouter modules for grouping related endpoints.

##### `__init__.py`

Marks `routers` as a Python package.

##### `data.py`

Defines API endpoints under the `/data` prefix, primarily for retrieving data (retailers, products) and allowing direct single-product upserts for testing/manual entry (`POST /products/`).

##### `pdf.py`

Defines API endpoints under the `/pdf` prefix for managing the PDF processing workflow. Includes `POST /process-uploads` to trigger extraction for files in the `uploads` directory and `GET /processing-status`.

#### `services/`

Directory containing business logic and interactions with external services.

##### `__init__.py`

Marks `services` as a Python package.

##### `pdf_processor.py`

Contains the `GroceryAdProcessor` class responsible for orchestrating PDF data extraction. It uses the Google Generative AI SDK (Files API) to upload PDFs, prompts Gemini for structured JSON data, validates the response, and saves the output to the `extractions` directory.

#### `schemas/`

Directory containing Pydantic models for data validation and serialization.

##### `__init__.py`

Marks `schemas` as a Python package.

##### `data_schemas.py`

Defines Pydantic models representing the structure of data stored in the database (e.g., `Retailer`, `WeeklyAd`, `Product` and their `Create`/`Base` variants).

##### `pdf_schema.py`

Defines Pydantic models (`PDFProduct`, `PDFWeeklyAd`, `ExtractedPDFData`) representing the expected structure of data extracted from PDFs by the Gemini model.

#### `database.py`

Configures and manages the SQLAlchemy database connection using environment variables. Provides database session dependency (`get_db`).

#### `models.py`

Defines SQLAlchemy ORM classes mapping Python objects to database tables (`Retailer`, `WeeklyAd`, `Product`), including relationships and constraints.

#### `crud.py`

Contains functions for database operations (Create, Read, Update, Delete) using SQLAlchemy models and sessions. Includes specific functions tailored for different data sources/workflows like `find_or_create_retailer`, `create_weekly_ad` (from PDF data), `upsert_products` (batch from PDF data), `upsert_single_product` (direct API), and retrieval functions like `get_retailer_by_id`.

### `uploads/`

Directory designated as the input location for PDF weekly ad files that need processing. The `/pdf/process-uploads` endpoint scans this directory.

### `extractions/`

Directory where the structured JSON data, extracted from PDFs by the `pdf_processor` service, is saved. Each output JSON file corresponds to an input PDF file.

### `sql/`

Directory holding database schema related SQL files.

#### `schema.sql`

Contains raw SQL statements to create PostgreSQL database tables, indexes, and functions (potentially used for initial setup or reference).

### `.env.example`

Template file showing required environment variables (e.g., `DATABASE_URL`, `GEMINI_API_KEY`, optional `PDF_UPLOADS_DIR`, `PDF_EXTRACTIONS_DIR`). Copy to `.env` and populate.

### `requirements.txt`

Lists all Python dependencies required for the backend service, including `fastapi`, `sqlalchemy`, `uvicorn`, `psycopg2-binary`, `python-dotenv`, `google-generativeai`, `aiofiles`. Ensures reproducible environment.

### `Procfile`

Configuration file for deployment platforms like Heroku, specifying process types.

## Frontend Files (`frontend/`)

### `public/`

Contains static assets served directly by the web server.

#### `vite.svg`

Example static asset (Vite logo).

### `src/`

Contains the React/TypeScript source code for the frontend application.

#### `assets/`

Directory for frontend-specific static assets like images or logos.

##### `react.svg`

Example frontend asset (React logo).

#### `services/`

Contains modules related to external services, like API communication.

##### `api.ts`

Configures the Axios client for making API requests to the backend service.

#### `App.css`

Contains CSS styles specific to the main `App.tsx` component.

#### `App.tsx`

The root React component. Manages application layout and routing logic.

#### `index.css`

Contains global CSS styles applied across the entire frontend application.

#### `main.tsx`

The main entry point for the React application. Renders the root component (`App.tsx`).

#### `vite-env.d.ts`

TypeScript declaration file for Vite-specific environment variables.

### `cypress/`

Contains end-to-end tests written using the Cypress framework.

#### `e2e/`

Directory holding the end-to-end test specification files (e.g., `*.cy.ts`).

##### `counter.cy.ts`

An example end-to-end test file.

#### `fixtures/`

Contains static data used by Cypress tests.

##### `example.json`

Example fixture data file.

#### `support/`

Contains reusable Cypress commands and test setup utilities.

##### `commands.ts`

Defines custom, reusable Cypress commands for tests.

##### `e2e.ts`

Configuration file for Cypress end-to-end test setup.

### `index.html`

The main HTML file template. The application's JavaScript bundle is injected here.

### `package.json`

Defines Node.js project metadata, dependencies (npm packages), and scripts (build, test, etc.).

### `vite.config.ts`

Configuration file for the Vite build tool and development server.

### `tsconfig.json`

Root TypeScript configuration file for the frontend project.

### `tsconfig.app.json`

TypeScript configuration specifically for the application code within `src/`.

### `tsconfig.node.json`

TypeScript configuration for Node.js-specific parts, like Vite config.

### `tsconfig.cypress.json`

TypeScript configuration specifically for Cypress test files.

### `cypress.config.js`

Main configuration file for the Cypress testing framework.

### `eslint.config.js`

Configuration file for ESLint, used for code linting and style enforcement.
