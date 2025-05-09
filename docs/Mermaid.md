# Project Structure & Flow

## Directory Structure

graph TD
A[grocery-budget-assistant] --> B[backend]
A --> C[frontend]
A --> D[docs]

    B --> E[app]
    B --> F[sql]
    B --> PDFDIR[pdf/]

    E --> G[main.py]
    E --> H[models.py]
    E --> I[crud.py]
    E --> J[database.py]
    E --> UTILS[utils/]

    F --> L[schema.sql]

    PDFDIR --> K[uploads/]
    PDFDIR --> EXT[extractions/]
    PDFDIR --> TMP[temp_pdfs/]
    PDFDIR --> ARC[archived/]

    C --> M[src]
    C --> N[public]

    M --> P[components]
    M --> Q[services]
    M --> R[App.tsx]
    M --> S[main.tsx]

    P --> T[pdf-upload]

## Backend Directory Structure (Simplified)

```mermaid
graph TD
    B(backend) --> APP(app)
    B --> PDFROOT(pdf/)

    APP --> ROUTERS(routers/)
    APP --> SERVICES(services/)
    APP --> SCHEMAS(schemas/)
    APP --> UTILS_APP(utils/)
    APP --> MODELS(models.py)
    APP --> CRUD(crud.py)
    APP --> DBSETUP(database.py)
    APP --> MAIN(main.py)

    ROUTERS --> PDATA(data.py)
    ROUTERS --> PPDF(pdf.py)

    SERVICES --> PDFPROC(pdf_processor.py)
    SERVICES --> PDFPROMPTS(pdf_prompts.py)

    SCHEMAS --> SBASE(base_schemas.py)
    SCHEMAS --> SDATA(data_schemas.py)
    SCHEMAS --> SPDF(pdf_schema.py)

    PDFROOT --> PDFUPLOADS(uploads/)
    PDFROOT --> PDFEXTRACTIONS(extractions/)
    PDFROOT --> PDFTEMP(temp_pdfs/)
    PDFROOT --> PDFARCHIVED(archived/)
```

## Database Schema

```mermaid
erDiagram
    retailers {
        bigint id PK
        varchar name UK
        varchar website
        timestamptz created_at
    }

    weekly_ads {
        bigint id PK
        bigint retailer_id FK
        date publication_date
        date valid_from
        date valid_to
        varchar filename
        varchar source_url
        timestamptz processed_at
        timestamptz created_at
    }

    products {
        bigint id PK
        bigint weekly_ad_id FK
        varchar name
        numeric price
        varchar unit
        text description
        varchar category
        text promotion_details
        text original_text_snippet
        varchar image_url
        timestamptz created_at
        tsvector fts_vector
    }

    retailers ||--o{ weekly_ads : "has many"
    weekly_ads ||--o{ products : "contains many"
```

## Component Flow

```mermaid
flowchart LR
    subgraph Frontend
        A[PDF Upload Component] --> B[API Service]
        B --> C[Backend API]
    end

    subgraph Backend
        C --> D[FastAPI Router]
        D --> E[CRUD Operations]
        E --> F[Database Models]
        F --> G[Supabase PostgreSQL]
    end

    subgraph Database
        G --> H[retailers]
        G --> I[weekly_ads]
        G --> J[products]
    end
```

## Key Features

- PDF Upload and Processing
- Weekly Ad Management
- Product Tracking
- Full-text Search
- RESTful API Integration

## PDF Processing Flow

```mermaid
sequenceDiagram
    participant Client
    participant PDFRouter as FastAPI Router (/pdf)
    participant BackgroundTask
    participant PDFProcessor as PDF Processor Service
    participant GeminiAPI as Google Gemini API
    participant UploadsDir as Directory (uploads/)
    participant ExtractionsDir as Directory (extractions/)

    Client->>+PDFRouter: POST /process-uploads
    PDFRouter->>UploadsDir: Scan for *.pdf files
    UploadsDir-->>PDFRouter: List of PDF paths
    loop For Each PDF Path
        PDFRouter->>BackgroundTask: Add Task (run_processor_for_file(pdf_path))
    end
    PDFRouter-->>-Client: 202 Accepted (Queued)

    BackgroundTask->>+PDFProcessor: process_pdf_to_json(pdf_path)
    PDFProcessor->>UploadsDir: Read PDF file
    UploadsDir-->>PDFProcessor: PDF data
    PDFProcessor->>+GeminiAPI: Upload File (PDF)
    GeminiAPI-->>-PDFProcessor: Uploaded File Handle
    PDFProcessor->>+GeminiAPI: Generate Content (Prompt + File Handle)
    GeminiAPI-->>-PDFProcessor: JSON Response (string)
    PDFProcessor->>PDFProcessor: Validate JSON (using pdf_schema)
    alt Validation OK
        PDFProcessor->>ExtractionsDir: Write Validated JSON data
        ExtractionsDir-->>PDFProcessor: Success
        PDFProcessor-->>-BackgroundTask: Return JSON path
    else Validation Fails
        PDFProcessor-->>-BackgroundTask: Return None (Error logged)
    end
```

## JSON to Database Flow

```mermaid
sequenceDiagram
    participant JService as JSON to DB Service
    participant ExtrDir as Extractions Directory
    participant Validator as Schema Validator
    participant DB as PostgreSQL DB

    JService->>ExtrDir: Scan for JSON files
    ExtrDir-->>JService: List of JSON paths

    loop For Each JSON File
        JService->>ExtrDir: Read JSON file
        ExtrDir-->>JService: JSON content
        JService->>Validator: Validate with ExtractedPDFData schema

        alt Validation Success
            JService->>DB: Check existing weekly ad
            DB-->>JService: Exists/Not exists

            alt Ad Not Found
                JService->>DB: Update ad periods for retailer
                JService->>DB: Create new weekly ad (current)
                JService->>DB: Batch create products
                DB-->>JService: Success/Failure
            end
        else Validation Fails
            JService->>JService: Log error & continue
        end
    end
```

## Data API Flow (Example: Product Upsert)

```mermaid
sequenceDiagram
    participant Client
    participant DataRouter as FastAPI Router (/data)
    participant CRUD
    participant DB as PostgreSQL DB

    Client->>+DataRouter: POST /products/ (ProductCreate JSON)
    DataRouter->>+CRUD: upsert_single_product(db_session, product_data)
    CRUD->>DB: SELECT product WHERE name=X AND ad_id=Y
    alt Product Exists
        DB-->>CRUD: Existing Product Record
        CRUD->>CRUD: Update fields
        CRUD->>DB: UPDATE product SET ... WHERE id=Z
        DB-->>CRUD: Update Result
    else Product Not Found
        DB-->>CRUD: Not Found
        CRUD->>DB: INSERT INTO products (...)
        DB-->>CRUD: New Product Record (with ID)
    end
    CRUD-->>-DataRouter: Upserted Product Object
    DataRouter->>DB: COMMIT
    DataRouter-->>-Client: 200 OK (Product JSON)
```

## Technology Stack

- Frontend: React + TypeScript + Vite
- Backend: FastAPI + SQLAlchemy + google-generativeai + aiofiles
- Database: PostgreSQL (Supabase)
- Testing: Cypress
- Development Tools: uvicorn, python-dotenv
