# Project Documentation

# Technologies Used

## Backend

- **Google Generative AI SDK**: For interacting with Gemini models (`google-generativeai`) for PDF processing and AI features
- **FastAPI**: Modern, high-performance web framework for building APIs with Python
- **Supabase**: Open source Firebase alternative (PostgreSQL-based backend with vector embeddings support)
- **Pydantic**: Data validation and settings management using schemas
- **SQLAlchemy**: Python SQL toolkit and Object Relational Mapper (ORM)

## Frontend

- **React**: UI library for building component-based interfaces
- **TypeScript**: Type-safe JavaScript superset
- **Vite**: Modern build tool and development server
- **CSS3**: Custom styling approach with component-specific stylesheets

# Key Workflows

1.  **PDF Data Extraction & Enhancement:**

    - A `POST` request to `/pdf/process-uploads` triggers background processing.
    - The `pdf_processor` service (`backend/app/services/pdf_processor.py`) uploads each PDF to the Gemini Files API.
    - Gemini extracts data based on a structured prompt (`backend/app/services/pdf_prompts.py`).
    - The service validates the JSON response against the schema in `backend/app/schemas/pdf_schema.py`.
    - Valid extracted data is saved as a JSON file in `backend/pdf/extractions`.
    - Enhanced data processing occurs via `json_enhancement_service.py` and results are stored in `backend/pdf/enhanced_json`.

2.  **Embedding Generation & AI Search:**

    - The `batch_embedding_service.py` generates vector embeddings for products using AI models.
    - Embeddings are stored in the PostgreSQL database to enable similarity search.
    - The `similarity_query.py` service provides AI-powered product search functionality.
    - Frontend AI views (`DefaultAIView.tsx`, `AIResultsView.tsx`) interface with these AI capabilities.

3.  **Data Retrieval API (`/products/*`, `/retailers/*`):**

    - Provides endpoints for retrieving and searching data (GET requests).
    - Includes traditional search and new AI-powered similarity search endpoints.
    - Handled by routers in `backend/app/routers/products.py` and `backend/app/routers/retailers.py`.
    - Logic implemented in corresponding services (`product_service.py`, `retailer_service.py`).

4.  **Database Upload Workflow:**

    - The `json_to_db_service` (`backend/app/services/json_to_db_service.py`) reads JSON files from `backend/pdf/extractions`.
    - It validates the JSON data using the `ExtractedPDFData` schema from `backend/app/schemas/data_schemas.py`.
    - For each valid JSON file:
      - Checks for existing weekly ad by filename to prevent duplicates
      - Updates ad periods for the retailer (current -> previous -> archived)
      - Creates a new weekly ad marked as 'current'
      - Creates associated products with all extracted details using `models.py` definitions
      - Triggers embedding generation for new products via `batch_embedding_service.py`
      - Commits the changes or rolls back on error

5.  **User Experience Features:**
    - **Favorite Items Management**: Users can save and manage favorite products (`DefaultFavItemsView.tsx`, `FavItemsResultsView.tsx`).
    - **Advanced Sorting & Filtering**: Enhanced sort functionality via `useSort.ts` hook and sort UI components.
    - **View History Tracking**: Navigation and view history management through `useViewHistory.ts` hook.
    - **Responsive UI**: Bottom navigation, modal systems, and overlay components for mobile-first design.

# File Descriptions

For detailed descriptions of key files and their functions, please see [docs/ProjectFiles.md](./ProjectFiles.md).
