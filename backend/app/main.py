import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from .routers import data, pdf
from . import database # Keep for SessionLocal usage if get_db_session remains here (or move get_db_session too)


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

# Define and ensure directories exist at startup
APP_ROOT_DIR = os.path.dirname(__file__) # assigns the path of this file to APP_ROOT_DIR
# Construct paths relative to the project root (backend/)
PROJECT_ROOT_DIR = os.path.dirname(APP_ROOT_DIR) # This should be backend/

UPLOAD_DIR = os.path.join(PROJECT_ROOT_DIR, "pdf", "uploads")
TEMP_PDF_DIR = os.path.join(PROJECT_ROOT_DIR, "pdf", "temp_pdfs")
# EXTRACTIONS_DIR is managed by pdf_processor.py, but ensure it exists if needed here
# EXTRACTIONS_DIR_MAIN = os.path.join(PROJECT_ROOT_DIR, "pdf", "extractions") 

os.makedirs(UPLOAD_DIR, exist_ok=True) # the 2nd arg means if directory already exists, don't throw an error
os.makedirs(TEMP_PDF_DIR, exist_ok=True)
# os.makedirs(EXTRACTIONS_DIR_MAIN, exist_ok=True) # If main needs to ensure it exists too

# Optional: Define dependency here if routers import it, or define in each router
# def get_db_session():
#     db = database.SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

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



