# Project Documentation

grocery-budget-assistant/
├── backend/
│ ├── app/ # FastAPI application code
│ │ ├── **init**.py # Marks 'app' as a Python package
│ │ ├── main.py # Main application file, combines routers
│ │ ├── routers/ # Directory for API route modules
│ │ │ ├── **init**.py
│ │ │ ├── data.py # Endpoints for data retrieval and direct testing/management
│ │ │ └── pdf.py # Endpoints for PDF processing workflow
│ │ ├── services/ # Business logic layer
│ │ │ ├── **init**.py
│ │ │ └── pdf_processor.py # Service for handling PDF processing via Gemini
│ │ ├── schemas/ # Pydantic models directory
│ │ │ ├── **init**.py
│ │ │ ├── data_schemas.py # Pydantic models for database objects (Retailer, Ad, Product)
│ │ │ └── pdf_schema.py # Pydantic models for PDF extracted data
│ │ ├── database.py # Database connection setup (SQLAlchemy)
│ │ ├── models.py # SQLAlchemy ORM models (database table definitions)
│ │ ├── crud.py # Database interaction functions (CRUD)
│ ├── uploads/ # Directory for uploaded PDF files (input)
│ ├── extractions/ # Directory for JSON files extracted from PDFs (output)
│ ├── sql/ # SQL specific files
│ │ └── schema.sql # Database schema definition (PostgreSQL)
│ ├── .env.example # Example environment variables template
│ ├── requirements.txt # Python dependencies
│ └── Procfile # Deployment configuration for hosting platforms (e.g., Heroku)
|---------------------------------------------------------------
├── docs/
│ ├── PRD.md # Product Requirements Document
│ ├── Feature_PostgresDB # Feature-specific details for Postgres integration
│ ├── ProjectDoc.md # This file - high-level project structure and technologies
│ ├── ProjectFiles.md # Detailed descriptions of key project files
│ └── Mermaid.md # Diagrams illustrating structure and flow
|---------------------------------------------------------------
├── frontend/
│ ├── public/ # Static assets
│ │ └── vite.svg # Vite logo
│ ├── src/ # React/TypeScript source code
│ │ ├── assets/ # Frontend assets
│ │ │ └── react.svg # React logo
│ │ ├── services/ # API and service layer
│ │ │ └── api.ts # API client configuration
│ │ ├── App.css # Main component styling
│ │ ├── App.tsx # Main React component
│ │ ├── index.css # Global styles
│ │ ├── main.tsx # Application entry point
│ │ └── vite-env.d.ts # TypeScript environment declarations
| |=====================================
│ ├── cypress/ # End-to-end testing
│ │ ├── e2e/ # Test specifications
│ │ │ └── counter.cy.ts # Sample test file
│ │ ├── fixtures/ # Test data
│ │ │ └── example.json # Sample test data
│ │ └── support/ # Test support utilities
│ │ ├── commands.ts # Custom test commands
│ │ └── e2e.ts # E2E test configuration
| |=====================================
│ ├── index.html # HTML template
│ ├── package.json # Frontend dependencies and scripts
│ ├── vite.config.ts # Vite configuration
│ ├── tsconfig.json # TypeScript configuration
│ ├── tsconfig.app.json # App-specific TypeScript config
│ ├── tsconfig.node.json # Node-specific TypeScript config
│ ├── tsconfig.cypress.json # Cypress-specific TypeScript config
│ ├── cypress.config.js # Cypress configuration
│ └── eslint.config.js # ESLint configuration

# Technologies Used

## Backend

- **FastAPI**: Modern, high-performance web framework for building APIs with Python
- **SQLAlchemy**: Python SQL toolkit and Object Relational Mapper (ORM)
- **Supabase**: Open source Firebase alternative (PostgreSQL-based backend)
- **Google Generative AI SDK**: For interacting with Gemini models (`google-generativeai`)
- **Pydantic**: Data validation and settings management using schemas
- **Uvicorn**: ASGI server for running the FastAPI application
- **Psycopg2**: PostgreSQL database adapter for Python
- **python-dotenv**: Reads key-value pairs from `.env` file
- **aiofiles**: Asynchronous file operations
- **Pytest**: Testing framework for Python

## Frontend

- **React 19**: UI library for building component-based interfaces
- **TypeScript**: Type-safe JavaScript superset
- **Vite**: Modern build tool and development server
- **React Router**: Navigation and routing for React apps
- **Material UI**: React component library implementing Google's Material Design
- **TailwindCSS**: Utility-first CSS framework
- **Axios**: Promise-based HTTP client
- **Cypress**: End-to-end testing framework

# Key Workflows

1.  **PDF Data Extraction:**
    - PDF files are placed in the `backend/uploads` directory.
    - A `POST` request to `/pdf/process-uploads` triggers background processing.
    - The `pdf_processor` service uploads each PDF to the Gemini Files API.
    - Gemini extracts data based on a structured prompt.
    - The service validates the JSON response against `pdf_schema.py`.
    - Valid extracted data is saved as a JSON file in `backend/extractions`.
2.  **Data Management API (`/data/*`):**
    - Provides endpoints primarily for retrieving data (retailers, ads, products - GET requests).
    - Includes an endpoint (`POST /data/products/`) for manually upserting single products for testing or direct entry.
3.  **Database Upload (Future):**
    - A separate process (to be implemented) will read the JSON files from `backend/extractions`.
    - It will parse the JSON using `data_schemas.py`.
    - It will use `crud.py` functions (`find_or_create_retailer`, `create_weekly_ad`, `upsert_products`) to populate the PostgreSQL database.

# Environment Variables

Ensure a `.env` file is created based on `.env.example`, including:

- `DATABASE_URL`: Connection string for PostgreSQL.
- `GEMINI_API_KEY`: API key for Google Gemini.
- `PDF_UPLOADS_DIR` (Optional): Path to the PDF uploads directory (defaults to `backend/uploads`).
- `PDF_EXTRACTIONS_DIR` (Optional): Path to the JSON extractions directory (defaults to `backend/extractions`).

# File Descriptions

For detailed descriptions of key files and their functions, please see [docs/ProjectFiles.md](./ProjectFiles.md).
