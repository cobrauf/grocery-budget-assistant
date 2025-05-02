# Project Structure

## Directory Structure

graph TD
A[grocery-budget-assistant] --> B[backend]
A --> C[frontend]
A --> D[docs]

    B --> E[app]
    B --> F[sql]

    E --> G[main.py]
    E --> H[models.py]
    E --> I[crud.py]
    E --> J[database.py]
    E --> K[uploads/]

    F --> L[schema.sql]

    C --> M[src]
    C --> N[public]

    M --> P[components]
    M --> Q[services]
    M --> R[App.tsx]
    M --> S[main.tsx]

    P --> T[pdf-upload]

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

## Technology Stack

- Frontend: React + TypeScript + Vite
- Backend: FastAPI + SQLAlchemy
- Database: PostgreSQL (Supabase)
- Testing: Cypress
- Development Tools: uvicorn, python-dotenv
