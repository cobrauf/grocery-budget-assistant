# Project Documentation

grocery-budget-assistant/
├── backend/
│ ├── app/ # FastAPI application code
│ │ ├── **init**.py # Marks 'app' as a Python package
│ │ ├── main.py # Main application file with API endpoints
│ │ ├── schemas.py # Pydantic models for request/response validation
│ │ ├── database.py # Database connection setup (SQLAlchemy)
│ │ ├── models.py # SQLAlchemy ORM models (database table definitions)
│ │ ├── crud.py # Database interaction functions (Create, Read, Update, Delete)
│ │ └── uploads/ # Directory for uploaded files (e.g., PDFs)
│ │ └── ...
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
│ └── ProjectFiles.md # Detailed descriptions of key project files
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
- **LangChain & LangGraph**: Framework for building LLM-powered applications
- **Pydantic**: Data validation and settings management using schemas (defined in `schemas.py`)
- **Uvicorn**: ASGI server for running the FastAPI application
- **Psycopg2**: PostgreSQL database adapter for Python
- **python-dotenv**: Reads key-value pairs from `.env` file
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

# File Descriptions

For detailed descriptions of key files and their functions, please see [docs/ProjectFiles.md](./ProjectFiles.md).
