import os
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import shutil

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
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    try:
        # Save the uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        # Handle potential file saving errors
        raise HTTPException(
            status_code=500, detail=f"Could not save file: {e}")
    finally:
        # Ensure the file pointer is closed
        file.file.close()

    # Return success response
    return JSONResponse(status_code=200, content={"message": "File uploaded successfully", "filename": file.filename})

# Add API routes here

if __name__ == "__main__":
    import uvicorn
    # Use PORT environment variable for production (Render will set this)
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
