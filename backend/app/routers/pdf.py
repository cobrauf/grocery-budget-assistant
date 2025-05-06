import os
import uuid
import asyncio
import shutil
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.responses import JSONResponse
from pathlib import Path

# Import necessary components from parent directories or app modules
from ..services.pdf_processor import GroceryAdProcessor, UPLOADS_DIR, EXTRACTIONS_DIR

'''
Defines API endpoints specifically for handling PDF files.
Manages temporary file cleanup and provides a basic status check.

POST /pdf/process: Initiates background processing for a single uploaded PDF file.
POST /pdf/upload: Allows uploading a single PDF file to the server's uploads directory.
GET /pdf/list: Lists the names of all PDF files currently in the uploads directory.
POST /pdf/process-uploads/: Queues background processing for all PDF files found in the uploads directory.
GET /pdf/processing-status/: Provides a basic status check of PDF processing based on file counts.
'''

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
    background_tasks.add_task(processor.process_pdf_to_json, temp_file_path)
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
    """Uploads a PDF file to the configured permanent upload directory."""
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

# --- Helper function for background task ---
async def run_processor_for_file(pdf_path: Path):
    """Wraps the processor call for a single file."""
    # Create a new processor instance for each task, or manage a shared one carefully
    # depending on potential statefulness or resource usage.
    # Creating a new one per task is safer if unsure.
    processor = GroceryAdProcessor()
    if not processor.model:
        print(f"Skipping {pdf_path.name} due to processor initialization failure.")
        return # Don't proceed if model didn't init

    print(f"Background task started for: {pdf_path.name}")
    result_path = await processor.process_pdf_to_json(pdf_path)
    if result_path:
        print(f"Background task SUCCESS for {pdf_path.name}. Output: {result_path}")
    else:
        print(f"Background task FAILED for {pdf_path.name}")

# --- API Endpoint ---
@router.post("/process-uploads/", status_code=202)
async def process_all_uploaded_pdfs(background_tasks: BackgroundTasks):
    """
    Scans the UPLOADS_DIR for PDF files and queues background tasks
    to process each one using the Gemini API for data extraction.
    Outputs results as JSON files in the EXTRACTIONS_DIR.

    Returns 202 Accepted immediately, processing happens in the background.
    """
    pdf_files = list(UPLOADS_DIR.glob("*.pdf"))

    if not pdf_files:
        raise HTTPException(
            status_code=404,
            detail=f"No PDF files found in the upload directory: {UPLOADS_DIR}"
        )

    print(f"Found {len(pdf_files)} PDF files in {UPLOADS_DIR}. Queuing for processing...")

    # Add each file processing task to the background
    for pdf_path in pdf_files:
        background_tasks.add_task(run_processor_for_file, pdf_path)

    return {
        "message": f"Accepted: Queued {len(pdf_files)} PDF files for processing.",
        "upload_directory": str(UPLOADS_DIR),
        "output_directory": str(EXTRACTIONS_DIR),
        "files_queued": [f.name for f in pdf_files]
    }

# --- Optional: Endpoint to check status (Very basic example) ---
@router.get("/processing-status/")
async def check_processing_status():
    """Basic check for number of extracted JSON files vs uploaded PDFs."""
    try:
        pdf_files = list(UPLOADS_DIR.glob("*.pdf"))
        json_files = list(EXTRACTIONS_DIR.glob("*.json"))
        # Basic check: compare stems (filenames without extension)
        pdf_stems = {p.stem for p in pdf_files}
        json_stems = {j.stem for j in json_files}

        processed_count = len(pdf_stems.intersection(json_stems))
        pending_count = len(pdf_stems - json_stems)
        total_pdfs = len(pdf_stems)

        return {
            "total_pdfs_found": total_pdfs,
            "json_outputs_found": len(json_stems),
            "successfully_processed_approx": processed_count,
            "pending_or_failed_approx": pending_count,
            "upload_directory": str(UPLOADS_DIR),
            "output_directory": str(EXTRACTIONS_DIR),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking status: {e}") 