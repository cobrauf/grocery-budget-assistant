# Project File Descriptions

This document provides concise descriptions for key files in the `grocery-budget-assistant` project.
File order follows the structure diagram in `docs/ProjectDoc.md`.

## Backend Files (`backend/`)

### `app/`

Directory containing the core FastAPI application logic.

#### `__init__.py`

Marks the `app` directory as a Python package, enabling relative imports.

#### `main.py`

Main FastAPI application file. Defines API routes and handles HTTP requests. Serves as the backend service entry point.

#### `database.py`

Configures and manages the SQLAlchemy database connection using environment variables. Provides database session dependency.

#### `models.py`

Defines SQLAlchemy ORM classes mapping Python objects to database tables (Retailer, WeeklyAd, Product).

#### `crud.py`

Contains functions for database operations (Create, Read, Update, Delete) using SQLAlchemy models. Separates database logic.

### `sql/`

Directory holding database schema related SQL files.

#### `schema.sql`

Contains raw SQL statements to create PostgreSQL database tables, indexes, and functions.

### `.env.example`

Template file showing required environment variables (e.g., database URL, API keys). Copy to `.env`.

### `requirements.txt`

Lists all Python dependencies required for the backend service. Ensures reproducible environment.

### `Procfile`

Configuration file for deployment platforms like Heroku, specifying process types.

## Frontend Files (`frontend/`)

### `public/`

Contains static assets served directly by the web server.

#### `vite.svg`

Example static asset (Vite logo).

### `src/`

Contains the React/TypeScript source code for the frontend application.

#### `assets/`

Directory for frontend-specific static assets like images or logos.

##### `react.svg`

Example frontend asset (React logo).

#### `services/`

Contains modules related to external services, like API communication.

##### `api.ts`

Configures the Axios client for making API requests to the backend service.

#### `App.css`

Contains CSS styles specific to the main `App.tsx` component.

#### `App.tsx`

The root React component. Manages application layout and routing logic.

#### `index.css`

Contains global CSS styles applied across the entire frontend application.

#### `main.tsx`

The main entry point for the React application. Renders the root component (`App.tsx`).

#### `vite-env.d.ts`

TypeScript declaration file for Vite-specific environment variables.

### `cypress/`

Contains end-to-end tests written using the Cypress framework.

#### `e2e/`

Directory holding the end-to-end test specification files (e.g., `*.cy.ts`).

##### `counter.cy.ts`

An example end-to-end test file.

#### `fixtures/`

Contains static data used by Cypress tests.

##### `example.json`

Example fixture data file.

#### `support/`

Contains reusable Cypress commands and test setup utilities.

##### `commands.ts`

Defines custom, reusable Cypress commands for tests.

##### `e2e.ts`

Configuration file for Cypress end-to-end test setup.

### `index.html`

The main HTML file template. The application's JavaScript bundle is injected here.

### `package.json`

Defines Node.js project metadata, dependencies (npm packages), and scripts (build, test, etc.).

### `vite.config.ts`

Configuration file for the Vite build tool and development server.

### `tsconfig.json`

Root TypeScript configuration file for the frontend project.

### `tsconfig.app.json`

TypeScript configuration specifically for the application code within `src/`.

### `tsconfig.node.json`

TypeScript configuration for Node.js-specific parts, like Vite config.

### `tsconfig.cypress.json`

TypeScript configuration specifically for Cypress test files.

### `cypress.config.js`

Main configuration file for the Cypress testing framework.

### `eslint.config.js`

Configuration file for ESLint, used for code linting and style enforcement.
