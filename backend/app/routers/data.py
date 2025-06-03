from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, Any

from .. import models
from ..database import get_db 
from ..services import json_to_db_service
from ..services import json_enhancement_service
from ..services import batch_embedding_service

'''
Defines API endpoints for retrieving data (Retailers, Weekly Ads, Products),
Creation/Update operations via PDF upload happen through a different process.
Uses FastAPI's APIRouter to group these data-related routes.
Handles database operations using SQLAlchemy sessions.
Validates and formats data using Pydantic schemas.
'''

router = APIRouter(
    prefix="/data",  # Optional prefix for all routes in this router
    tags=["Data Management"]  # Tag for Swagger UI documentation
)


# Keeping get retailers/weekly ads here for now. Products endpoints moved to products.py + product_service.py
@router.get("/retailers/")
def list_retailers(db: Session = Depends(get_db)):
    print("Listing retailers")
    return db.query(models.Retailer).all()

@router.get("/weekly_ads/")
async def list_weekly_ads(db: Session = Depends(get_db)):
    print("Listing weekly ads")
    return db.query(models.WeeklyAd).all()

@router.post("/json_to_db/")
async def upload_jsons_to_db(db: Session = Depends(get_db)):
    print("uploading JSONs to DB")
    return json_to_db_service.process_json_extractions(db)

@router.post("/enhance_json/")
async def enhance_json_files_endpoint(): # ensure this is async def
    print("Async Enhancing JSON files via API endpoint...")
    try:
        await json_enhancement_service.enhance_all_json_files() # await the async function
        return {"message": "JSON enhancement process started successfully and has completed."} # Or reflect ongoing status
    except Exception as e:
        print(f"Error during JSON enhancement process: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred during JSON enhancement: {str(e)}")
   

@router.post("/embed_products", response_model=Dict[str, Any])
async def trigger_batch_embedding(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Endpoint to trigger the batch embedding process for products.
    The process runs in the background.
    """
    background_tasks.add_task(batch_embedding_service.batch_embed_products, db)
    print("Batch product embedding task has been scheduled to run in the background.")
    return {
        "message": "Batch product embedding process initiated in the background.",
        "details": "The process will fetch products with ad_period='current' and no existing embeddings, "
                   "generate embeddings, and update them in the database."
    }






