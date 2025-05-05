from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from typing import List # Added for type hinting
from . import models # Remove schemas from here
from .schemas import data_schemas # Import the renamed data_schemas
from .schemas.pdf_schema import PDFWeeklyAd, PDFProduct # Update to pdf_schema

'''
Purpose: This file is intended to hold the functions that perform database operations. 
For example, get_retailer, create_retailer, functions to get products by date, functions to add a new weekly ad, etc. 
These functions take a database session (db: Session) and any necessary data as input and interact with the database 
using the SQLAlchemy models defined in models.py.
'''

# Example function to get a retailer by ID
def get_retailer(db: Session, retailer_id: int):
    return db.query(models.Retailer).filter(models.Retailer.id == retailer_id).first()

# Example function to create a retailer
def create_retailer(db: Session, retailer: data_schemas.RetailerCreate):
    db_retailer = models.Retailer(name=retailer.name, website=retailer.website)
    db.add(db_retailer)
    db.commit()
    db.refresh(db_retailer)
    return db_retailer

# Function to get or create a retailer by name
def get_or_create_retailer(db: Session, name: str) -> models.Retailer:
    # Try to get the retailer first
    db_retailer = db.query(models.Retailer).filter(models.Retailer.name == name).first()
    if db_retailer:
        return db_retailer
    # If not found, create it
    else:
        print(f"Creating new retailer: {name}")
        # Assuming website is optional or not available from PDF extraction
        retailer_schema = data_schemas.RetailerCreate(name=name)
        return create_retailer(db, retailer=retailer_schema)

# --- WeeklyAd CRUD ---
def create_weekly_ad(db: Session, weekly_ad: data_schemas.WeeklyAdCreate):
    # Convert Pydantic schema to SQLAlchemy model instance
    db_weekly_ad = models.WeeklyAd(**weekly_ad.model_dump())
    db.add(db_weekly_ad)
    db.commit()
    db.refresh(db_weekly_ad)
    return db_weekly_ad

# Function tailored for data extracted from PDF
def create_weekly_ad_from_pdf(db: Session, ad_data: PDFWeeklyAd, retailer_id: int) -> models.WeeklyAd:
    # Map PDF schema fields to model fields
    db_weekly_ad = models.WeeklyAd(
        retailer_id=retailer_id,
        valid_from=ad_data.start_date,
        valid_to=ad_data.end_date,
        # Add defaults or nulls for other fields if necessary
        # publication_date=None, # Or potentially derive from valid_from?
        # filename=None, # Could be added later if needed
        # source_url=None,
    )
    db.add(db_weekly_ad)
    # We might not commit here if part of a larger transaction in the service layer
    # db.commit()
    # db.refresh(db_weekly_ad)
    # Instead, flush to get the ID if needed before returning
    db.flush()
    db.refresh(db_weekly_ad)
    print(f"Created WeeklyAd ID: {db_weekly_ad.id} for Retailer ID: {retailer_id}")
    return db_weekly_ad

# --- Product CRUD ---
def create_product(db: Session, product: data_schemas.ProductCreate):
    # Convert Pydantic schema to SQLAlchemy model instance
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

# Function to create multiple products from PDF data
def create_products_batch(db: Session, products_data: List[PDFProduct], weekly_ad_id: int):
    products_to_add = []
    for prod_data in products_data:
        # Map PDF schema fields to model fields
        db_product = models.Product(
            weekly_ad_id=weekly_ad_id,
            name=prod_data.name,
            price=prod_data.price,
            description=prod_data.description
            # Other fields like unit, category will be null/default
        )
        products_to_add.append(db_product)

    if products_to_add:
        db.add_all(products_to_add)
        # Commit might happen outside this function if part of a transaction
        # db.commit()
        # Flush to ensure data is sent to DB before potential subsequent reads
        db.flush()
        print(f"Added {len(products_to_add)} products for WeeklyAd ID: {weekly_ad_id}")
    else:
        print(f"No products to add for WeeklyAd ID: {weekly_ad_id}")

# Add more functions here for:
# - Getting Weekly Ads/Products
# - Querying products based on criteria (dates, retailer, keywords, etc.) 