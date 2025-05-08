import os
import uuid
import asyncio
import shutil
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.responses import JSONResponse
from pathlib import Path

# Import necessary components from parent directories or app modules
from ..services.pdf_processor import GroceryAdProcessor
from ..utils.utils import find_project_root

'''
Defines API endpoints specifically for handling PDF files.
Manages temporary file cleanup and provides a basic status check.

POST /pdf/process-uploads/: Queues background processing for all PDF files found in the uploads directory.
GET /pdf/processing-status/: Provides a basic status check of PDF processing based on file counts.
'''

# Define paths relative to project root using utils.find_project_root()
PROJECT_ROOT = find_project_root()
UPLOADS_DIR = PROJECT_ROOT / "backend" / "pdf" / "uploads"
EXTRACTIONS_DIR = PROJECT_ROOT / "backend" / "pdf" / "extractions"

router = APIRouter(
    prefix="/pdf", # Prefix for PDF related routes
    tags=["PDF Processing"] # Tag for Swagger UI
)

# --- Helper function for background task ---
async def run_processor_for_file(pdf_path: Path):
    """Wraps the processor call for a single file."""
    # Create a new processor instance for each task
    processor = GroceryAdProcessor()
    if not processor.model:
        print(f"Skipping {pdf_path.name} due to processor initialization failure.")
        return

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
    Scans the UPLOADS_DIR for PDF files and queues background tasks to process each one using Gemini API.
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

    return { # a response to the client
        "message": f"Accepted: Queued {len(pdf_files)} PDF files for processing.",
        "upload_directory": str(UPLOADS_DIR),
        "output_directory": str(EXTRACTIONS_DIR),
        "files_queued": [f.name for f in pdf_files]
    }

# --- Endpoint to check status --
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
            "successfully_processed": processed_count,
            "pending_or_not_processed": pending_count,
            "upload_directory": str(UPLOADS_DIR),
            "output_directory": str(EXTRACTIONS_DIR),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking status: {e}")