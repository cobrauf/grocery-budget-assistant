import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from .routers import data, pdf
from . import database # Keep for SessionLocal usage if get_db_session remains here (or move get_db_session too)
from .utils.utils import find_project_root

'''
Main FastAPI application entry point.
Initializes the FastAPI app, configures CORS, includes API routers,
and handles application startup tasks like creating directories.
'''

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Grocery Budget Assistant API",
    description="API for managing weekly grocery ad data, including PDF processing.",
    version="0.1.0",
)

# Configure CORS
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
allowed_origins = [
    "http://localhost:5173",
    frontend_url,
    "*", # TODO: Restrict in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define paths relative to project root using utils.find_project_root()
PROJECT_ROOT = find_project_root()
UPLOAD_DIR = PROJECT_ROOT / "backend" / "pdf" / "uploads"

@app.get("/")
def read_root():
    return {"message": "Welcome to the Grocery Budget Assistant API"}

# Include routers
app.include_router(data.router)
app.include_router(pdf.router)


# Keep the run block
if __name__ == "__main__":
    import uvicorn
    port_str = os.getenv("PORT", "8000")
    port = int(port_str)
    # Point uvicorn to the app instance in this file
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=True)



