# Placeholder for PDF router 

import os
import uuid
import asyncio
import shutil
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.responses import JSONResponse

# Import necessary components from parent directories or app modules
from ..services.pdf_processor import GroceryAdProcessor

# Define directories relative to the location of *this* file (routers/pdf.py)
# Go up one level to app/, then specify the target directories
APP_DIR = os.path.dirname(os.path.dirname(__file__))
UPLOAD_DIR = os.path.join(APP_DIR, "uploads")
TEMP_PDF_DIR = os.path.join(APP_DIR, "temp_pdfs")

# Ensure directories exist (this might ideally be done once at app startup in main.py)
# but including here for router self-containment for now.
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(TEMP_PDF_DIR, exist_ok=True)


router = APIRouter(
    prefix="/pdf", # Prefix for PDF related routes
    tags=["PDF Processing"] # Tag for Swagger UI
)

async def cleanup_temp_file(file_path: str):
    """Removes a temporary file after a delay."""
    await asyncio.sleep(5)
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Cleaned up temp file: {file_path}")
    except Exception as e:
        print(f"Error cleaning up temp file {file_path}: {e}")

@router.post("/process") # Route path relative to prefix: /pdf/process
async def process_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF files allowed.")
    if not file.filename:
        raise HTTPException(status_code=400, detail="File name cannot be empty")

    unique_id = uuid.uuid4()
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext != ".pdf":
         raise HTTPException(status_code=400, detail="Invalid file extension. Only PDF files are allowed.")

    temp_filename = f"{unique_id}{file_ext}"
    temp_file_path = os.path.join(TEMP_PDF_DIR, temp_filename)

    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        print(f"Temporarily saved PDF: {temp_file_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save temporary file: {e}") from e
    finally:
        if hasattr(file.file, 'close'):
             file.file.close()

    processor = GroceryAdProcessor()
    background_tasks.add_task(processor.process_pdf, temp_file_path)
    background_tasks.add_task(cleanup_temp_file, temp_file_path)

    return JSONResponse(
        status_code=202,
        content={
            "message": "PDF processing started in the background.",
            "original_filename": file.filename,
            "processing_id": str(unique_id)
        }
    )

@router.post("/upload") # Route path: /pdf/upload
async def upload_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF files are allowed.")
    if file.filename is None:
        raise HTTPException(status_code=400, detail="File name cannot be empty")

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}") from e
    finally:
        if hasattr(file.file, 'close'):
             file.file.close()

    return JSONResponse(status_code=200, content={"message": "File uploaded successfully to uploads directory", "filename": file.filename})

@router.get("/list") # Route path: /pdf/list
async def list_pdfs():
    try:
        files = os.listdir(UPLOAD_DIR)
        pdf_files = [file for file in files if file.lower().endswith('.pdf')]
        return {"pdf_files": pdf_files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing PDF files: {e}") from e 