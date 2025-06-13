# Project Structure & Flow

<!-- (when updating, keep to this format consistency, ignore init files) -->

## Frontend Directory Structure (Detailed)

```mermaid
graph TD
    MainTSX[src/main.tsx] --> AppTSX(src/App.tsx)

    subgraph AppLevel [App.tsx Imports & Structure]
        AppTSX --> Header(src/components/Header.tsx)
        AppTSX --> MainContent(src/components/MainContent.tsx)
        AppTSX --> CommonBottomNav(src/components/common/BottomNav.tsx)
        AppTSX --> SideBar(src/components/sidebar/SideBar.tsx)
        AppTSX --> PdfUpload(src/components/pdf-upload/PdfUpload.tsx)
        AppTSX --> CategoryFilterModal(src/components/modals/CategoryFilterModal.tsx)
        AppTSX --> StoreFilterModal(src/components/modals/StoreFilterModal.tsx)
        AppTSX --> DefaultSearchView(src/views/DefaultSearchView.tsx)
        AppTSX --> SearchResultsView(src/views/SearchResultsView.tsx)
        AppTSX --> DefaultBrowseView(src/views/DefaultBrowseView.tsx)
        AppTSX --> BrowseResultsView(src/views/BrowseResultsView.tsx)
        AppTSX --> DefaultAIView(src/views/DefaultAIView.tsx)
        AppTSX --> AIResultsView(src/views/AIResultsView.tsx)
        AppTSX --> DefaultFavItemsView(src/views/DefaultFavItemsView.tsx)
        AppTSX --> FavItemsResultsView(src/views/FavItemsResultsView.tsx)
        AppTSX --> useThemeHook(src/hooks/useTheme.ts)
        AppTSX --> useSearchHook(src/hooks/useSearch.ts)
        AppTSX --> useRetailersHook(src/hooks/useRetailers.ts)
        AppTSX --> useAppTabHook(src/hooks/useAppTab.ts)
        AppTSX --> useSortHook(src/hooks/useSort.ts)
        AppTSX --> useViewHistoryHook(src/hooks/useViewHistory.ts)
        AppTSX --> apiService(src/services/api.ts)
        AppTSX --> localStorageUtils(src/utils/localStorageUtils.ts)
    end

    subgraph MainContentLevel [MainContent.tsx Imports]
        MainContent --> CommonFullOverlay(src/components/common/FullOverlay.tsx)
        MainContent --> CommonLoadingSpinner(src/components/common/LoadingSpinner.tsx)
        MainContent --> CommonProductCard(src/components/common/ProductCard.tsx)
        MainContent --> CommonResultsView(src/components/common/ResultsView.tsx)
    end

    subgraph HeaderLevel [Header.tsx and components/header/*]
       Header(src/components/Header.tsx) --> TopBar(src/components/header/TopBar.tsx)
       Header --> SearchBar(src/components/header/SearchBar.tsx)
       Header --> CartIcon(src/components/header/CartIcon.tsx)
       SearchBar --> CommonSearchOverlay(src/components/common/SearchOverlay.tsx)
    end

    subgraph SideBarLevel [SideBar.tsx Imports]
        SideBar(src/components/sidebar/SideBar.tsx) --> FontSelector(src/components/sidebar/FontSelector.tsx)
        SideBar --> ThemeSelector(src/components/sidebar/ThemeSelector.tsx)
    end

    subgraph ModalLevel [Modal Components]
        CategoryFilterModal
        StoreFilterModal
        CategoryFilterModal --> ModalBase(src/components/common/ModalBase.tsx)
        StoreFilterModal --> ModalBase
    end

    subgraph PDFUploadLevel [PdfUpload Component]
      PdfUpload(src/components/pdf-upload/PdfUpload.tsx)
    end

    subgraph ViewLevel [View Components]
        DefaultSearchView
        SearchResultsView --> CommonProductCard_SearchRes(src/components/common/ProductCard.tsx)
        DefaultBrowseView
        BrowseResultsView --> CommonProductCard_BrowseRes(src/components/common/ProductCard.tsx)
        DefaultAIView
        AIResultsView --> CommonProductCard_AIRes(src/components/common/ProductCard.tsx)
        DefaultFavItemsView
        FavItemsResultsView --> CommonProductCard_FavRes(src/components/common/ProductCard.tsx)
    end

    subgraph HookLevel [Custom Hooks]
        useSearchHook
        useThemeHook
        useRetailersHook
        useAppTabHook
        useSortHook
        useViewHistoryHook
    end

    subgraph ServiceLevel [Services]
        apiService
    end

    subgraph UtilLevel [Utils]
        localStorageUtils
    end

    subgraph TypeLevel [Types]
        ProductType(src/types/product.ts)
        RetailerType(src/types/retailer.ts)
    end

    subgraph StyleLevel [Styles - Selected]
        AppCSS(src/styles/App.css)
        IndexCSS(src/styles/index.css)
        ThemesTS(src/styles/themes.ts)
        FontsTS(src/styles/fonts.ts)
        SideBarCSS(src/styles/SideBar.css)
        ProductCardCSS(src/styles/ProductCard.css)
        ResultsViewCSS(src/styles/ResultsView.css)
        DefaultBrowseViewCSS(src/styles/DefaultBrowseView.css)
        DefaultAIViewCSS(src/styles/DefaultAIView.css)
        DefaultSearchViewCSS(src/styles/DefaultSearchView.css)
        DefaultFavItemsViewCSS(src/styles/DefaultFavItemsView.css)
        CommonBottomNavCSS(src/styles/BottomNav.css)
        CommonLoadingSpinnerCSS(src/styles/LoadingSpinner.css)
        CommonModalBaseCSS(src/styles/ModalBase.css)
        FavItemBarCSS(src/styles/FavItemBar.css)
        SortPillsBarCSS(src/styles/SortPillsBar.css)
    end

    %% Styling for subgraphs (optional)
    style AppLevel fill:#f9f,stroke:#333,stroke-width:1px
    style MainContentLevel fill:#fff0e6,stroke:#333,stroke-width:1px
    style HeaderLevel fill:#e6ffe6,stroke:#333,stroke-width:1px
    style SideBarLevel fill:#e6e6ff,stroke:#333,stroke-width:1px
    style ModalLevel fill:#f0e6ff,stroke:#333,stroke-width:1px
    style PDFUploadLevel fill:#e6f9ff,stroke:#333,stroke-width:1px
    style ViewLevel fill:#ccffee,stroke:#333,stroke-width:1px
    style HookLevel fill:#ffffcc,stroke:#333,stroke-width:1px
    style ServiceLevel fill:#ffe6cc,stroke:#333,stroke-width:1px
    style UtilLevel fill:#e0e0e0,stroke:#333,stroke-width:1px
    style TypeLevel fill:#ffcccc,stroke:#333,stroke-width:1px
    style StyleLevel fill:#ccffcc,stroke:#333,stroke-width:1px
```

## Frontend Directory Structure (simplified)

<!-- (when updating, keep to this format consistency, ignore init files) -->

```mermaid
graph TD
    MainTSX[src/main.tsx] --> AppTSX(src/App.tsx)

    AppTSX --> AppComps(App-Level Components<br>src/components/Header.tsx<br>src/components/MainContent.tsx)
    AppTSX --> CommonComps_App(Common Components Ref by App<br>src/components/common/BottomNav.tsx)
    AppTSX --> Modals_App(Modal Components Ref by App<br>src/components/modals/CategoryFilterModal.tsx<br>src/components/modals/StoreFilterModal.tsx)
    AppTSX --> SideBar(Sidebar<br>src/components/sidebar/SideBar.tsx)
    AppTSX --> PdfUpload(PDF Upload<br>src/components/pdf-upload/PdfUpload.tsx)
    AppTSX --> Views(Views<br>src/views/DefaultSearchView.tsx<br>src/views/SearchResultsView.tsx<br>src/views/DefaultBrowseView.tsx<br>src/views/BrowseResultsView.tsx<br>src/views/DefaultAIView.tsx<br>src/views/AIResultsView.tsx<br>src/views/DefaultFavItemsView.tsx<br>src/views/FavItemsResultsView.tsx)
    AppTSX --> Hooks(Hooks<br>src/hooks/useTheme.ts<br>src/hooks/useSearch.ts<br>src/hooks/useRetailers.ts<br>src/hooks/useAppTab.ts<br>src/hooks/useSort.ts<br>src/hooks/useViewHistory.ts)
    AppTSX --> Services(Services<br>src/services/api.ts)
    AppTSX --> Utils(Utils<br>src/utils/localStorageUtils.ts)
    AppTSX --> Types(Types<br>src/types/product.ts<br>src/types/retailer.ts)
    AppTSX --> Styles(Styles - General<br>src/styles/App.css<br>src/styles/index.css<br>src/styles/themes.ts<br>src/styles/fonts.ts)

    AppComps --> HeaderComps(Header Sub-Components<br>src/components/header/TopBar.tsx<br>src/components/header/SearchBar.tsx<br>src/components/header/CartIcon.tsx)
    AppComps --> CommonComps_Main(Common Components Ref by MainContent<br>src/components/common/FullOverlay.tsx<br>src/components/common/LoadingSpinner.tsx<br>src/components/common/ProductCard.tsx<br>src/components/common/ResultsView.tsx)

    HeaderComps --> CommonComps_Header(Common Components Ref by Header<br>src/components/common/SearchOverlay.tsx)

    Modals_App --> CommonComps_Modals(Common Components Ref by Modals<br>src/components/common/ModalBase.tsx)

    SideBar --> SidebarComps(Sidebar Components<br>src/components/sidebar/FontSelector.tsx<br>src/components/sidebar/ThemeSelector.tsx)

    Views --> CommonComps_Views(Common Components Ref by Views<br>src/components/common/ProductCard.tsx)
    Views --> Hooks
    Views --> Types

    Hooks --> Services
    Hooks --> Types
    Hooks --> Utils

    Services --> Types
```

## Backend Directory Structure (Simplified)

<!-- (when updating, keep to this format consistency, ignore init files) -->

```mermaid
graph TD
    backend --> app

    app --> routers
    app --> services
    app --> schemas
    app --> utils
    app --> app_files(models.py<br>database.py<br>main.py)

    routers --> routers_files(data.py<br>pdf.py<br>products.py<br>retailers.py)
    services --> services_files(pdf_processor.py<br>pdf_prompts.py<br>json_to_db_service.py<br>json_enhancement_service.py<br>batch_embedding_service.py<br>similarity_query.py<br>product_service.py<br>retailer_service.py)
    schemas --> schemas_files(base_schemas.py<br>data_schemas.py<br>pdf_schema.py)
    utils --> utils_files(utils.py<br>schema.sql)
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
        vector embedding
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
        D[AI Search Component] --> B
        E[Sort/Filter Components] --> B
    end

    subgraph Backend
        C --> D[FastAPI Router]
        D --> E[CRUD Operations]
        D --> F[AI Services]
        E --> G[Database Models]
        F --> H[Embedding Services]
        G --> I[Supabase PostgreSQL]
        H --> I
    end

    subgraph Database
        I --> J[retailers]
        I --> K[weekly_ads]
        I --> L[products with embeddings]
    end
```

## Key Features

- PDF Upload and Processing
- Weekly Ad Management
- Product Tracking
- Full-text Search
- AI-Powered Similarity Search
- Product Embedding Generation
- RESTful API Integration
- Favorite Items Management
- Advanced Sorting and Filtering

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
    participant EnhancedDir as Directory (enhanced_json/)

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
        PDFProcessor->>EnhancedDir: Write Enhanced JSON data
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
    participant EnhancedDir as Enhanced JSON Directory
    participant Validator as Schema Validator
    participant EmbeddingService as Batch Embedding Service
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
                JService->>EmbeddingService: Generate embeddings for products
                EmbeddingService->>DB: Update products with embeddings
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
    participant SimilarityService as Similarity Query Service
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

    Note over Client,DB: Alternative: Similarity Search Flow
    Client->>+DataRouter: GET /products/similar?query=search_term
    DataRouter->>+SimilarityService: find_similar_products(query, limit)
    SimilarityService->>DB: Vector similarity search using embeddings
    DB-->>SimilarityService: Similar products ranked by similarity
    SimilarityService-->>-DataRouter: Ranked product list
    DataRouter-->>-Client: 200 OK (Similar Products JSON)
```

## Technology Stack

- Frontend: React + TypeScript + Vite + CSS3 (Custom styling)
- Backend: FastAPI + SQLAlchemy + google-generativeai + aiofiles + asyncpg
- Database: PostgreSQL (Supabase) with vector embeddings support
- AI/ML: Google Gemini API for PDF processing and text understanding
- Testing: Cypress + Pytest (Frontend and Backend testing)
- Development Tools: uvicorn, python-dotenv, ESLint
- Deployment: Heroku-compatible (Procfile + runtime.txt)
