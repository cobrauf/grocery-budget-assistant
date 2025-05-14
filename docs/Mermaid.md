# Project Structure & Flow

<!-- (when updating, keep to this format consistency, ignore init files) -->

## Frontend Directory Structure (Detailed)

graph TD
MainTSX[src/Main.tsx] --> AppTSX(src/App.tsx)

    subgraph AppLevel [App.tsx Imports & Structure]
        AppTSX --> Header(src/components/Header.tsx)
        AppTSX --> MainContent(src/components/MainContent.tsx)
        AppTSX --> BottomNav(src/components/BottomNav.tsx)
        AppTSX --> SideBar(src/components/sidebar/SideBar.tsx)
        AppTSX --> PdfUpload(src/components/pdf-upload/PdfUpload.tsx)
        AppTSX --> SearchResultsView(src/views/SearchResultsView.tsx)
        AppTSX --> RetailerLogosView(src/views/RetailerLogosView.tsx)
        AppTSX --> useThemeHook(src/hooks/useTheme.ts)
        AppTSX --> useSearchHook(src/hooks/useSearch.ts)
        AppTSX --> useRetailersHook(src/hooks/useRetailers.ts)
        AppTSX --> apiService(src/services/api.ts)
    end

    subgraph MainContentLevel [MainContent.tsx Imports]
        MainContent --> FullOverlay(src/components/common/FullOverlay.tsx)
        MainContent --> LoadingSpinner(src/components/common/LoadingSpinner.tsx)
        MainContent --> ProductCard(src/components/common/ProductCard.tsx)
    end

    subgraph HeaderLevel [Header.tsx Imports]
       Header --> SearchOverlay(src/components/common/SearchOverlay.tsx)
    end

    subgraph SideBarLevel [SideBar.tsx Imports]
        SideBar --> FontSelector(src/components/sidebar/FontSelector.tsx)
        SideBar --> ThemeSelector(src/components/sidebar/ThemeSelector.tsx)
    end

    subgraph ViewLevel [View Components]
        SearchResultsView --> ProductCard_View(src/components/common/ProductCard.tsx)
        RetailerLogosView --> ProductCard_RetailerView(src/components/common/ProductCard.tsx)
    end

    subgraph HookLevel [Custom Hooks]
        useSearchHook
        useThemeHook
        useRetailersHook
    end

    subgraph ServiceLevel [Services]
        apiService
    end

    subgraph TypeLevel [Types]
        ProductType(src/types/product.ts)
        RetailerType(src/types/retailer.ts)
    end

    subgraph StyleLevel [Styles]
        AppCSS(src/styles/app.css)
        IndexCSS(src/styles/index.css)
        LoadingCSS(src/styles/loadingSpinner.css)
        FontsTS(src/styles/fonts.ts)
        ThemesTS(src/styles/themes.ts)
    end

    %% Styling for subgraphs (optional)
    style AppLevel fill:#f9f,stroke:#333,stroke-width:1px
    style MainContentLevel fill:#fff0e6,stroke:#333,stroke-width:1px
    style HeaderLevel fill:#e6ffe6,stroke:#333,stroke-width:1px
    style SideBarLevel fill:#e6e6ff,stroke:#333,stroke-width:1px
    style ViewLevel fill:#ccffee,stroke:#333,stroke-width:1px
    style HookLevel fill:#ffffcc,stroke:#333,stroke-width:1px
    style ServiceLevel fill:#ffe6cc,stroke:#333,stroke-width:1px
    style TypeLevel fill:#ffcccc,stroke:#333,stroke-width:1px
    style StyleLevel fill:#ccffcc,stroke:#333,stroke-width:1px

## Frontend Directory Structure (simplified)

<!-- (when updating, keep to this format consistency, ignore init files) -->

graph TD
MainTSX[src/Main.tsx] --> AppTSX(src/App.tsx)

    AppTSX --> AppComps(App-Level Components<br>src/components/Header.tsx<br>src/components/MainContent.tsx<br>src/components/BottomNav.tsx<br>src/components/PdfUpload.tsx)
    AppTSX --> SideBar(src/components/sidebar/SideBar.tsx)
    AppTSX --> Views(Views<br>src/views/SearchResultsView.tsx<br>src/views/RetailerLogosView.tsx)
    AppTSX --> Hooks(Hooks<br>src/hooks/useTheme.ts<br>src/hooks/useSearch.ts<br>src/hooks/useRetailers.ts)
    AppTSX --> Services(Services<br>src/services/api.ts)
    AppTSX --> Types(Types<br>src/types/product.ts<br>src/types/retailer.ts)
    AppTSX --> Styles(Styles<br>src/styles/app.css<br>src/styles/index.css<br>src/styles/loadingSpinner.css<br>src/styles/fonts.ts<br>src/styles/themes.ts)


    AppComps --> CommonComps(Common Components<br>src/components/common/FullOverlay.tsx<br>src/components/common/LoadingSpinner.tsx<br>src/components/common/ProductCard.tsx<br>src/components/common/SearchOverlay.tsx)

    SideBar --> SidebarComps(Sidebar Components<br>src/components/sidebar/FontSelector.tsx<br>src/components/sidebar/ThemeSelector.tsx)

    Views --> CommonComps
    Views --> Hooks
    Views --> Types

    Hooks --> Services
    Hooks --> Types

    Services --> Types

## Backend Directory Structure (Simplified)

<!-- (when updating, keep to this format consistency, ignore init files) -->

graph TD
backend --> app
backend --> pdf
backend --> root_files(requirements.txt<br>Procfile<br>venv/)

    app --> routers
    app --> services
    app --> schemas
    app --> utils
    app --> app_files(models.py<br>database.py<br>main.py)

    pdf --> pdf_uploads(uploads/)
    pdf --> pdf_extractions(extractions/)
    pdf --> pdf_archived(archived/)

    routers --> routers_files(data.py<br>pdf.py<br>products.py<br>retailers.py)
    services --> services_files(pdf_processor.py<br>pdf_prompts.py<br>json_to_db_service.py<br>product_service.py<br>retailer_service.py)
    schemas --> schemas_files(base_schemas.py<br>data_schemas.py<br>pdf_schema.py)
    utils --> utils_files(utils.py<br>schema.sql)

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

- Frontend: React + TypeScript + Vite + Tailwind CSS (Confirm primary UI lib)
- Backend: FastAPI + SQLAlchemy + google-generativeai + aiofiles + asyncpg
- Database: PostgreSQL (Supabase)
- Testing: Cypress + Pytest (Confirm frontend testing setup)
- Development Tools: uvicorn, python-dotenv
