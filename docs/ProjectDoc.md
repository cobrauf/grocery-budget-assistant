# Project Documentation

grocery-budget-assistant/
├── backend/
│ ├── app/ # FastAPI application code
│ │ ├── main.py # Main application file with API endpoints [core file]
│ │ └── ...
│ ├── requirements.txt # Python dependencies
│ └── Procfile # Deployment configuration for hosting platforms
|---------------------------------------------------------------
├── docs/
│ ├── PRD.md # Product Requirements Document
│ └── ProjectDoc.md # This file - project documentation
|---------------------------------------------------------------
├── frontend/
│ ├── public/ # Static assets
│ │ └── vite.svg # Vite logo
│ ├── src/ # React/TypeScript source code
│ │ ├── assets/ # Frontend assets
│ │ │ └── react.svg # React logo
│ │ ├── services/ # API and service layer
│ │ │ └── api.ts # API client configuration [core file]
│ │ ├── App.css # Main component styling
│ │ ├── App.tsx # Main React component [core file]
│ │ ├── index.css # Global styles
│ │ ├── main.tsx # Application entry point [core file]
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
- **Supabase**: Open source Firebase alternative (PostgreSQL-based backend)
- **LangChain & LangGraph**: Framework for building LLM-powered applications
- **Pydantic**: Data validation and settings management
- **Uvicorn**: ASGI server for running the FastAPI application
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

# Key Files and Their Functions

## Backend

### app/main.py

The main FastAPI application file that defines API routes and handles HTTP requests. This serves as the entry point for our backend service.

### requirements.txt

Defines all Python dependencies required for the backend, including FastAPI, LangChain, and Supabase client libraries.

### Procfile

Configuration file used for deployment to hosting platforms (like Heroku).

## Frontend

### src/main.tsx

Entry point for the React application. Sets up the React root and renders the main App component.

### src/App.tsx

The main React component that serves as the container for our application. It handles routing and includes the primary layout of the application.

### src/services/api.ts

Handles API communication between the frontend and backend services.

### src/App.css

Contains styling specific to the App component.

### src/index.css

Global CSS styles that apply to the entire application.

### index.html

The HTML template that serves as the entry point for the frontend application. The built JavaScript gets injected here.

### package.json

Defines the project's npm dependencies, scripts, and configuration.

## Testing

### cypress/e2e/\*.cy.ts

Cypress end-to-end test files that simulate user interactions to test application functionality.

### cypress/support/

Contains utilities and commands to support Cypress testing, including custom commands and global test setup.

### cypress.config.js

Configuration file for Cypress testing framework.

## Configuration Files

### tsconfig.json (and variants)

TypeScript configuration files that determine how TypeScript is compiled for different parts of the application.

### vite.config.ts

Configuration for the Vite build tool, including plugins and build settings.

### eslint.config.js

ESLint configuration for code linting and style enforcement.
