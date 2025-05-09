# Project Documentation

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
3.  **Database Upload Workflow:**
    - The `json_to_db_service` reads JSON files from `backend/extractions`.
    - It validates the JSON data using `ExtractedPDFData` schema.
    - For each valid JSON file:
      - Checks for existing weekly ad by filename to prevent duplicates
      - Updates ad periods for the retailer (current -> previous -> archived)
      - Creates a new weekly ad marked as 'current'
      - Creates associated products with all extracted details
      - Commits the changes or rolls back on error

# Environment Variables

Ensure a `.env` file is created based on `.env.example`, including:

- `DATABASE_URL`: Connection string for PostgreSQL.
- `GEMINI_API_KEY`: API key for Google Gemini.
- `PDF_UPLOADS_DIR` (Optional): Path to the PDF uploads directory (defaults to `backend/pdf/uploads`).
- `PDF_EXTRACTIONS_DIR` (Optional): Path to the JSON extractions directory (defaults to `backend/pdf/extractions`).

# File Descriptions

For detailed descriptions of key files and their functions, please see [docs/ProjectFiles.md](./ProjectFiles.md).
