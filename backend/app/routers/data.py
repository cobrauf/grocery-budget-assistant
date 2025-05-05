from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Import necessary components from parent directories or app modules
from .. import crud, models
from ..schemas import data_schemas # Changed to import from new location
from ..database import SessionLocal

'''
Defines core API endpoints for Retailers, Weekly Ads, and Products.
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
    prefix="/data", # Optional prefix for all routes in this router
    tags=["Data Operations"] # Tag for Swagger UI documentation
)

# --- Retailer Endpoints ---

@router.post("/retailers/", response_model=data_schemas.Retailer)
def create_new_retailer(retailer: data_schemas.RetailerCreate, db: Session = Depends(get_db)):
    db_retailer = db.query(models.Retailer).filter(models.Retailer.name == retailer.name).first()
    if db_retailer:
        raise HTTPException(status_code=400, detail="Retailer name already registered")
    return crud.create_retailer(db=db, retailer=retailer)

@router.get("/retailers/{retailer_id}", response_model=data_schemas.Retailer)
def read_retailer(retailer_id: int, db: Session = Depends(get_db)):
    db_retailer = crud.get_retailer(db, retailer_id=retailer_id)
    if db_retailer is None:
        raise HTTPException(status_code=404, detail="Retailer not found")
    return db_retailer

# --- WeeklyAd Endpoints ---

@router.post("/weekly_ads/", response_model=data_schemas.WeeklyAd)
def create_new_weekly_ad(weekly_ad: data_schemas.WeeklyAdCreate, db: Session = Depends(get_db)):
    db_retailer = crud.get_retailer(db, retailer_id=weekly_ad.retailer_id)
    if db_retailer is None:
        raise HTTPException(status_code=404, detail=f"Retailer with id {weekly_ad.retailer_id} not found")
    return crud.create_weekly_ad(db=db, weekly_ad=weekly_ad)

# --- Product Endpoints ---

@router.post("/products/", response_model=data_schemas.Product)
def create_new_product(product: data_schemas.ProductCreate, db: Session = Depends(get_db)):
    # Optional: Add check if weekly_ad_id exists
    # db_weekly_ad = crud.get_weekly_ad(db, weekly_ad_id=product.weekly_ad_id) # Example check
    # if db_weekly_ad is None:
    #     raise HTTPException(status_code=404, detail=f"WeeklyAd with id {product.weekly_ad_id} not found")
    return crud.create_product(db=db, product=product)

# --- Add other data-related endpoints here (GET lists, search, etc.) --- 