from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db 
from ..services import json_to_db_service
from ..services import json_enhancement_service

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
async def enhance_json_files_endpoint():
    print("Enhancing JSON files via API endpoint...")
    return json_enhancement_service.enhance_all_json_files()
   






