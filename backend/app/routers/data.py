from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.sql.expression import text # For using raw SQL expressions like to_tsquery
from typing import List, Optional
# from sqlalchemy.exc import IntegrityError
# Import JSONResponse and jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

# Import necessary components from parent directories or app modules
from .. import models
from ..schemas import data_schemas  # Changed to import from new location
from ..database import SessionLocal, get_db # Ensure get_db is correctly imported from database.py
from ..services import json_to_db_service, product_service # Import product_service

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
    # Assuming this is a background task or a simple utility endpoint for now.
    # Ensure json_to_db_service.process_json_extractions is async or handled appropriately.
    return await json_to_db_service.process_json_extractions() # if it's an async function

@router.get("/products/search/", response_model=List[data_schemas.ProductWithDetails])
async def search_products_endpoint(
    q: str = Query(..., min_length=1, description="Search term for products."),
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=200, description="Max results."),
    offset: int = Query(0, ge=0, description="Offset for pagination.")
):
    print(f"Searching products with query: '{q}', limit: {limit}, offset: {offset}")
    if not q.strip():
        raise HTTPException(status_code=400, detail="Search query 'q' cannot be empty.")
    
    # This search logic could also be moved to product_service.py for consistency
    try:
        # Simplified search logic, adapt FTS from existing implementation or use a new service function
        search_results = (
            db.query(models.Product)
            .join(models.WeeklyAd, models.Product.weekly_ad_id == models.WeeklyAd.id)
            .join(models.Retailer, models.Product.retailer_id == models.Retailer.id)
            .filter(models.Product.fts_vector.match(q, postgresql_regconfig='english')) # Assuming fts_vector is used
            .options(
                joinedload(models.Product.retailer),
                joinedload(models.Product.weekly_ad)
            )
            .offset(offset)
            .limit(limit)
            .all()
        )
        return search_results
    except Exception as e:
        print(f"Error during product search: {e}")
        # import traceback; traceback.print_exc(); # For detailed debugging
        raise HTTPException(status_code=500, detail="Error searching products.")

@router.get("/products/retailer/{retailer_id}")
async def get_products_by_retailer_manual_json(
    retailer_id: int,
    ad_period: str = Query("current", description="Ad period (e.g., 'current', 'upcoming')."),
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    try:
        # product_service.get_products_by_retailer_and_ad_period returns a list of SQLAlchemy ORM objects
        products_db = await product_service.get_products_by_retailer_and_ad_period(
            db=db, 
            retailer_id=retailer_id, 
            ad_period=ad_period,
            limit=limit,
            offset=offset
        )
        # Use jsonable_encoder to convert ORM objects (and their relationships)
        # into a structure that can be directly serialized to JSON.
        # This will include nested objects for 'retailer' and 'weekly_ad'.
        return JSONResponse(content=jsonable_encoder(products_db))
    except Exception as e:
        print(f"Error fetching products for retailer {retailer_id}, ad period '{ad_period}': {e}")
        # import traceback; traceback.print_exc(); # For detailed debugging
        raise HTTPException(status_code=500, detail="Error fetching products for specified retailer and ad period.")




