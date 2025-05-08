from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.sql.expression import text # For using raw SQL expressions like to_tsquery
from typing import List, Optional
# from sqlalchemy.exc import IntegrityError

# Import necessary components from parent directories or app modules
from .. import models
from ..schemas import data_schemas  # Changed to import from new location
from ..database import SessionLocal
from ..services import json_to_db_service

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

@router.post("/json_to_db/")
def list_upload_jsons(db: Session = Depends(get_db)):
    print("uploading JSONs to DB")
    return json_to_db_service.process_json_extractions()

@router.get("/products/search/", response_model=List[data_schemas.ProductWithDetails])
def search_products(
    q: str = Query(..., min_length=1, description="Search term for products. Must not be empty."), 
    db: Session = Depends(get_db), 
    limit: int = Query(50, ge=1, le=200, description="Maximum number of results to return."), 
    offset: int = Query(0, ge=0, description="Number of results to skip (for pagination).")
):
    print(f"Searching products with query: '{q}', limit: {limit}, offset: {offset}")
    if not q.strip():
        raise HTTPException(status_code=400, detail="Search query 'q' cannot be empty or only whitespace.")

    try:
        # Using plainto_tsquery for simpler user input that doesn't require knowledge of tsquery syntax
        # It converts the query string into a tsquery, interpreting spaces as AND operators by default.
        # For more complex queries (phrases, OR, NOT), to_tsquery or websearch_to_tsquery might be better.
        search_query = db.query(models.Product)\
            .join(models.Product.weekly_ad)\
            .join(models.Product.retailer)\
            .filter(models.Product.fts_vector.match(q, postgresql_regconfig='english'))\
            .options(
                joinedload(models.Product.weekly_ad).joinedload(models.WeeklyAd.retailer), # Ensures retailer of the ad is loaded
                joinedload(models.Product.retailer) # Ensures retailer of the product is loaded (same as above if linked correctly)
            )\
            .offset(offset)\
            .limit(limit)\
            .all()

        # Manually construct the ProductWithDetails response objects
        # because SQLAlchemy's direct conversion might not easily map nested related objects to flat Pydantic fields
        # if there are name clashes or complex mappings not handled by simple from_attributes.
        # For this specific case where ProductWithDetails inherits Product, and adds related flat fields,
        # Pydantic MIGHT be able to handle it if from_attributes=True and the ORM relationships are clear.
        # Let's test the direct conversion first. If it fails or is ambiguous, manual mapping is the fallback.
        
        results_with_details = []
        for product in search_query:
            results_with_details.append(
                data_schemas.ProductWithDetails(
                    **product.__dict__, # Start with product fields
                    retailer_name=product.retailer.name, # Add retailer name
                    weekly_ad_valid_from=product.weekly_ad.valid_from,
                    weekly_ad_valid_to=product.weekly_ad.valid_to,
                    weekly_ad_ad_period=product.weekly_ad.ad_period
                )
            )
        return results_with_details
        
    except Exception as e:
        # Log the exception for debugging
        print(f"Error during product search: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An error occurred while searching for products.")




