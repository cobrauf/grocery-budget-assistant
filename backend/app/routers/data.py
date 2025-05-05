from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy.exc import IntegrityError

# Import necessary components from parent directories or app modules
from .. import crud, models
from ..schemas import data_schemas  # Changed to import from new location
from ..database import SessionLocal

'''
Defines API endpoints primarily for retrieving data (Retailers, Weekly Ads, Products),
and also allows direct creation/update of individual records for testing or manual entry.
Creation/Update operations via PDF upload happen through a separate endpoint.
Uses FastAPI's APIRouter to group these data-related routes.
Handles database operations using SQLAlchemy sessions and CRUD functions.
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

# --- Retailer Endpoints ---
@router.post("/retailers/", response_model=data_schemas.Retailer)
def create_new_retailer(retailer: data_schemas.RetailerCreate, db: Session = Depends(get_db)):
    db_retailer = db.query(models.Retailer).filter(
        models.Retailer.name == retailer.name).first()
    if db_retailer:
        raise HTTPException(
            status_code=400, detail="Retailer name already registered")
    return crud.create_retailer(db=db, retailer=retailer)


@router.get("/retailers/{retailer_id}", response_model=data_schemas.Retailer)
def read_retailer(retailer_id: int, db: Session = Depends(get_db)):
    db_retailer = crud.get_retailer_by_id(db, retailer_id=retailer_id)
    if db_retailer is None:
        raise HTTPException(status_code=404, detail="Retailer not found")
    return db_retailer

# --- WeeklyAd Endpoints ---
@router.post("/weekly_ads/", response_model=data_schemas.WeeklyAd)
def create_new_weekly_ad(weekly_ad: data_schemas.WeeklyAdCreate, db: Session = Depends(get_db)):
    db_retailer = crud.get_retailer(db, retailer_id=weekly_ad.retailer_id)
    if db_retailer is None:
        raise HTTPException(
            status_code=404, detail=f"Retailer with id {weekly_ad.retailer_id} not found")
    return crud.create_weekly_ad(db=db, weekly_ad=weekly_ad)

# --- Product Endpoints ---
@router.post("/products/", response_model=data_schemas.Product)
def upsert_product_endpoint(product: data_schemas.ProductCreate, db: Session = Depends(get_db)):
    try:
        db_product = crud.upsert_single_product(db=db, product_data=product)
        db.commit()
        db.refresh(db_product)
        return db_product
    except IntegrityError as e:
        db.rollback()
        if "violates foreign key constraint" in str(e).lower() and "weekly_ads" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"WeeklyAd with id {product.weekly_ad_id} not found.")
        else:
            print(f"Database Integrity Error: {e}")
            raise HTTPException(status_code=400, detail=f"Database error during product upsert: {e}")
    except Exception as e:
        db.rollback()
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")


@router.get("/products/", response_model=List[data_schemas.Product])
def list_products(weekly_ad_id: int = None, db: Session = Depends(get_db)):
    """Get all products, optionally filtered by weekly_ad_id"""
    return crud.get_products(db, weekly_ad_id=weekly_ad_id)

