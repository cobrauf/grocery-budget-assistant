# Project Documentation

# Technologies Used

## Backend

- **FastAPI**: Modern, high-performance web framework for building APIs with Python
- **SQLAlchemy**: Python SQL toolkit and Object Relational Mapper (ORM)
- **Supabase**: Open source Firebase alternative (PostgreSQL-based backend)
- **asyncpg**: High-performance PostgreSQL database client library for asyncio.
- **Google Generative AI SDK**: For interacting with Gemini models (`google-generativeai`)
- **Pydantic**: Data validation and settings management using schemas
- **Uvicorn**: ASGI server for running the FastAPI application
- **Psycopg2**: PostgreSQL database adapter for Python (Potentially replaced by asyncpg, confirm usage)
- **python-dotenv**: Reads key-value pairs from `.env` file
- **aiofiles**: Asynchronous file operations
- **Pytest**: Testing framework for Python

## Frontend

- **React 19**: UI library for building component-based interfaces (Verify version if necessary)
- **TypeScript**: Type-safe JavaScript superset
- **Vite**: Modern build tool and development server
- **React Router**: (Not explicitly seen, check if used for routing within App.tsx)
- **Tailwind CSS**: (Primary styling framework, based on `index.css` and usage)
- **Axios**: Promise-based HTTP client (Used in `services/api.ts`)
- **Cypress**: End-to-end testing framework

# Key Workflows

1.  **PDF Data Extraction:**
    - PDF files are placed in the `backend/pdf/uploads` directory.
    - A `POST` request to `/pdf/process-uploads` triggers background processing.
    - The `pdf_processor` service (`backend/app/services/pdf_processor.py`) uploads each PDF to the Gemini Files API.
    - Gemini extracts data based on a structured prompt (`backend/app/services/pdf_prompts.py`).
    - The service validates the JSON response against the schema in `backend/app/schemas/pdf_schema.py`.
    - Valid extracted data is saved as a JSON file in `backend/pdf/extractions`.
2.  **Data Retrieval API (`/products/*`, `/retailers/*`):**
    - Provides endpoints for retrieving and searching data (GET requests).
    - Handled by routers in `backend/app/routers/products.py` and `backend/app/routers/retailers.py`.
    - Logic implemented in corresponding services (`product_service.py`, `retailer_service.py`).
3.  **Database Upload Workflow:**
    - The `json_to_db_service` (`backend/app/services/json_to_db_service.py`) reads JSON files from `backend/pdf/extractions`.
    - It validates the JSON data using the `ExtractedPDFData` schema from `backend/app/schemas/data_schemas.py`.
    - For each valid JSON file:
      - Checks for existing weekly ad by filename to prevent duplicates
      - Updates ad periods for the retailer (current -> previous -> archived)
      - Creates a new weekly ad marked as 'current'
      - Creates associated products with all extracted details using `models.py` definitions.
      - Commits the changes or rolls back on error

# Environment Variables

Ensure a `.env` file is created based on `.env.example` (if exists), including:

- `DATABASE_URL`: Connection string for PostgreSQL.
- `GEMINI_API_KEY`: API key for Google Gemini.
- `PDF_UPLOADS_DIR` (Optional): Path to the PDF uploads directory (defaults to `backend/pdf/uploads`).
- `PDF_EXTRACTIONS_DIR` (Optional): Path to the JSON extractions directory (defaults to `backend/pdf/extractions`).
- `PDF_ARCHIVED_DIR` (Optional): Path to the archived PDF directory (defaults to `backend/pdf/archived`).

# File Descriptions

For detailed descriptions of key files and their functions, please see [docs/ProjectFiles.md](./ProjectFiles.md).
