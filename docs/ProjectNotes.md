# Project Structure

grocery-budget-assistant/
├── backend/
│ ├── app/ # FastAPI application code
│ │ ├── main.py # Main application file with API endpoints
│ │ └── ...
│ ├── requirements.txt # Python dependencies
│ └── ...
├── docs/
│ ├── PRD.md # Product Requirements Document
│ └── ProjectNotes.md # This file - project documentation
├── frontend/
│ ├── public/ # Static assets
│ │ └── vite.svg # Vite logo
│ ├── src/ # React/TypeScript source code
│ │ ├── assets/ # Frontend assets
│ │ │ └── react.svg # React logo
│ │ ├── App.css # Main component styling
│ │ ├── App.tsx # Main React component
│ │ ├── index.css # Global styles
│ │ ├── main.tsx # Application entry point
│ │ └── vite-env.d.ts # TypeScript environment declarations
│ ├── index.html # HTML template
│ ├── package.json # Frontend dependencies and scripts
│ ├── vite.config.ts # Vite configuration
│ └── ...

# Key Files and Their Functions

## Backend

### app/main.py

The main FastAPI application file that defines API routes and handles HTTP requests. This serves as the entry point for our backend service.

## Frontend

### src/main.tsx

Entry point for the React application. Sets up the React root and renders the main App component.

### src/App.tsx

The main React component that serves as the container for our application. It handles routing and includes the primary layout of the application.

### src/App.css

Contains styling specific to the App component.

### src/index.css

Global CSS styles that apply to the entire application.

### index.html

The HTML template that serves as the entry point for the frontend application. The built JavaScript gets injected here.
