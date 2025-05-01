import os
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import shutil

# List of endpoints-------------------------
# GET /: Returns a simple JSON welcome message.
# POST / upload-pdf: Accepts a PDF file upload.
# GET / list-pdfs: Retrieves a JSON list of all filenames ending with .pdf found in the "uploads" directory.

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Grocery Budget Assistant API",
    description="Backend API for the Grocery Budget Assistant application",
    version="1.0.0"
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


@app.get("/")
async def root():
    return {"message": "Welcome to the Grocery Budget Assistant API"}


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
