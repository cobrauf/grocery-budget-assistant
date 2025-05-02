import os
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import shutil
from sqlalchemy.orm import Session
from sqlalchemy.sql import select
from pydantic import BaseModel

from . import crud, models, database, schemas

'''
Acts as the main entry point for the FastAPI web application.
Defines the API endpoints (routes) such as /, /retailers/, and /upload-pdf.
Manages database sessions by utilizing the get_db_session dependency.
Calls functions from crud.py to perform database operations.
Returns HTTP responses back to the clients.
Configures Cross-Origin Resource Sharing (CORS).

List of endpoints-------------------------
GET /: Returns a welcome message to indicate the API is running.

POST /retailers/: Creates a new retailer entry in the database, checking for name uniqueness.
GET /retailers/{retailer_id}: Retrieves details for a specific retailer by their ID.

POST /upload-pdf: Accepts a PDF file, validates its type, and saves it to the local 'uploads' directory.
GET /list-pdfs: Lists the filenames of all PDF files currently stored in the 'uploads' directory.
'''


# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Grocery Budget Assistant API",
    description="API for managing weekly grocery ad data.",
    version="0.1.0",
)

# Configure CORS
# Get the frontend URL from environment variables
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
allowed_origins = [
    "http://localhost:5173",  # Vite dev server
    frontend_url,  # Production frontend URL
    "*",  # Allow requests from any origin during development //TODO
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the upload directory relative to the script location
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
# Ensure the upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Dependency
def get_db_session():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Grocery Budget Assistant API"}


# use Pydantic model for request body and response
@app.post("/retailers/", response_model=schemas.Retailer)
def create_new_retailer(retailer: schemas.RetailerCreate, db: Session = Depends(get_db_session)):
    db_retailer = db.query(models.Retailer).filter(models.Retailer.name == retailer.name).first()
    if db_retailer:
        raise HTTPException(status_code=400, detail="Retailer name already registered")
    # Use the CRUD function which now also expects the schema
    return crud.create_retailer(db=db, retailer=retailer)

@app.get("/retailers/{retailer_id}", response_model=schemas.Retailer) # Define response_model
def read_retailer(retailer_id: int, db: Session = Depends(get_db_session)):
    db_retailer = crud.get_retailer(db, retailer_id=retailer_id)
    if db_retailer is None:
        raise HTTPException(status_code=404, detail="Retailer not found")
    return db_retailer

# --- Add more endpoints here for WeeklyAds and Products --- 

# Endpoint to create a Weekly Ad
@app.post("/weekly_ads/", response_model=schemas.WeeklyAd)
def create_new_weekly_ad(weekly_ad: schemas.WeeklyAdCreate, db: Session = Depends(get_db_session)):
    # Optional: Add check if retailer_id exists
    db_retailer = crud.get_retailer(db, retailer_id=weekly_ad.retailer_id)
    if db_retailer is None:
        raise HTTPException(status_code=404, detail=f"Retailer with id {weekly_ad.retailer_id} not found")
    return crud.create_weekly_ad(db=db, weekly_ad=weekly_ad)

# Endpoint to create a Product
@app.post("/products/", response_model=schemas.Product)
def create_new_product(product: schemas.ProductCreate, db: Session = Depends(get_db_session)):
    # Optional: Add check if weekly_ad_id exists (implementation needed in crud.py)
    # db_weekly_ad = crud.get_weekly_ad(db, weekly_ad_id=product.weekly_ad_id) # Example check
    # if db_weekly_ad is None:
    #     raise HTTPException(status_code=404, detail=f"WeeklyAd with id {product.weekly_ad_id} not found")
    return crud.create_product(db=db, product=product)

# Example: Get products from a specific ad
# @app.get("/weekly_ads/{ad_id}/products/")
# def read_ad_products(ad_id: int, db: Session = Depends(get_db_session)):
#     # Implement logic in crud.py
#     pass

# Example: Search products
# @app.get("/products/search/")
# def search_products(query: str, db: Session = Depends(get_db_session)):
#     # Implement full-text search logic in crud.py
#     pass

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    # Validate file type
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400, detail="Invalid file type. Only PDF files are allowed.")

    # Define the path to save the file
    # Ensure filename is not None (add type check)
    if file.filename is None:
        raise HTTPException(
            status_code=400, detail="File name cannot be empty")

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    try:
        # Save the uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        # Handle potential file saving errors with proper exception chaining
        raise HTTPException(
            status_code=500, detail=f"Could not save file: {e}") from e
    finally:
        # Ensure the file pointer is closed
        file.file.close()

    # Return success response
    return JSONResponse(status_code=200, content={"message": "File uploaded successfully", "filename": file.filename})

@app.get("/list-pdfs")
async def list_pdfs():
    """Endpoint to list all PDF files in the uploads directory"""
    try:
        # List all files in the uploads directory
        files = os.listdir(UPLOAD_DIR)
        # Filter for only PDF files
        pdf_files = [file for file in files if file.lower().endswith('.pdf')]
        return {"pdf_files": pdf_files}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error listing PDF files: {e}"
        ) from e

# Add API routes here

if __name__ == "__main__":
    import uvicorn
    # Use PORT environment variable for production (Render will set this)
    # Fix the type issue by explicitly converting to string first
    port_str = os.getenv("PORT", "8000")
    port = int(port_str)
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
    
# @app.get("/test-db") # Renamed path slightly for clarity, or use /test-db
# def test_database_connection_simple(db: Session = Depends(get_db_session)):
#     """Endpoint to test the database connection."""
#     try:
#         db.scalar(select(1))
#         return {
#             "status": "success",
#             "message": "Successfully connected to database."
#         }
#     except Exception as e:
#         # If any exception occurred, the connection failed
#         print(f"Database connection test failed: {e}") # Optional: log error
#         raise HTTPException(
#             status_code=500,
#             detail=f"Database connection failed: Could not establish connection."
#         )

