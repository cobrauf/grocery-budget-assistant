from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy.exc import IntegrityError

# Import necessary components from parent directories or app modules
from .. import models
from ..schemas import data_schemas  # Changed to import from new location
from ..database import SessionLocal

'''
Defines API endpoints for retrieving data (Retailers, Weekly Ads, Products),
Creation/Update operations via PDF upload happen through a different process.
Uses FastAPI's APIRouter to group these data-related routes.
Handles database operations using SQLAlchemy sessions.
Validates and formats data using Pydantic schemas.
'''

# Dependency to get DB session (can be defined here or imported if defined centrally)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


router = APIRouter(
    prefix="/data",  # Optional prefix for all routes in this router
    tags=["Data Management"]  # Tag for Swagger UI documentation
)

@router.get("/retailers/", response_model=List[data_schemas.Retailer])
def list_retailers(db: Session = Depends(get_db)):
    print("Listing retailers")
    return db.query(models.Retailer).all()

@router.get("/weekly_ads/", response_model=List[data_schemas.WeeklyAd])
def list_weekly_ads(db: Session = Depends(get_db)):
    print("Listing weekly ads")
    return db.query(models.WeeklyAd).all()



