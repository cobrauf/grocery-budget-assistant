from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

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
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the Grocery Budget Assistant API"}

# Add your API routes here

if __name__ == "__main__":
    import uvicorn
    # Use PORT environment variable for production (Render will set this)
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)