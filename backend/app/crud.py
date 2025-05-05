from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from typing import List # Added for type hinting
from . import models # Remove schemas from here
from .schemas import data_schemas # Import the renamed data_schemas
from .schemas.pdf_schema import PDFWeeklyAd, PDFProduct # Update to pdf_schema

'''
Purpose: This file is intended to hold the functions that perform database operations based on data extracted from PDFs.
Functions interact with the database using SQLAlchemy models defined in models.py.
'''

# --- Retailer CRUD ---
# Function to find an existing retailer or create a new one if not found
def find_or_create_retailer(db: Session, name: str) -> models.Retailer:
    # Try to get the retailer first
    db_retailer = db.query(models.Retailer).filter(func.lower(models.Retailer.name) == func.lower(name)).first()
    if db_retailer:
        print(f"Found existing retailer: {name} (ID: {db_retailer.id})")
        return db_retailer
    # If not found, create it
    else:
        print(f"Creating new retailer: {name}")
        # Assuming website is optional or not available from PDF extraction
        # Use a default or leave null if the model allows
        db_retailer = models.Retailer(name=name) # Simplified creation
        db.add(db_retailer)
        try:
            db.flush() # Flush to get the ID and check for potential constraint violations early
            db.refresh(db_retailer)
            print(f"Created new retailer: {name} (ID: {db_retailer.id})")
        except IntegrityError:
            db.rollback() # Rollback if creation fails (e.g., concurrent creation attempt)
            print(f"Error creating retailer {name}, likely already exists. Querying again.")
            db_retailer = db.query(models.Retailer).filter(func.lower(models.Retailer.name) == func.lower(name)).first()
            if not db_retailer:
                 # Handle the rare case where it still doesn't exist after rollback and retry
                 raise Exception(f"Failed to find or create retailer '{name}' after integrity error.")
        return db_retailer


# --- WeeklyAd CRUD ---
# Function to create a weekly ad from extracted PDF data
def create_weekly_ad(db: Session, ad_data: PDFWeeklyAd, retailer_id: int) -> models.WeeklyAd:
    # Map PDF schema fields to model fields
    db_weekly_ad = models.WeeklyAd(
        retailer_id=retailer_id,
        valid_from=ad_data.start_date,
        valid_to=ad_data.end_date,
        # Add defaults or nulls for other fields if necessary
    )
    db.add(db_weekly_ad)
    # Flush to get the ID, commit might happen in the service layer
    db.flush()
    db.refresh(db_weekly_ad)
    print(f"Created WeeklyAd ID: {db_weekly_ad.id} for Retailer ID: {retailer_id}, Valid: {ad_data.start_date} to {ad_data.end_date}")
    return db_weekly_ad


# --- Product CRUD ---
# Function to upsert (update or insert) products from PDF data
def upsert_products(db: Session, products_data: List[PDFProduct], weekly_ad_id: int):
    """
    Updates existing products or inserts new ones for a specific weekly ad based on product name.
    Accepts a list of PDFProduct objects. Can handle single or multiple products.
    """
    upserted_count = 0
    created_count = 0
    processed_names = set() # Keep track of names processed in this batch to avoid duplicate operations

    for prod_data in products_data:
        if prod_data.name in processed_names:
            print(f"Skipping duplicate product name in batch: {prod_data.name}")
            continue

        # Attempt to find an existing product by name within the same weekly ad
        existing_product = db.query(models.Product).filter(
            models.Product.weekly_ad_id == weekly_ad_id,
            func.lower(models.Product.name) == func.lower(prod_data.name) # Case-insensitive comparison
        ).first()

        if existing_product:
            # Update existing product
            # Check if data has actually changed to avoid unnecessary updates
            if (existing_product.price != prod_data.price or
                existing_product.description != prod_data.description):
                existing_product.price = prod_data.price
                existing_product.description = prod_data.description
                # Update other fields as needed
                db.add(existing_product) # Add to session to mark for update
                upserted_count += 1
                print(f"Updating product '{prod_data.name}' for WeeklyAd ID: {weekly_ad_id}")
            else:
                 print(f"No changes detected for product '{prod_data.name}'. Skipping update.")

        else:
            # Create new product
            db_product = models.Product(
                weekly_ad_id=weekly_ad_id,
                name=prod_data.name,
                price=prod_data.price,
                description=prod_data.description
                # Other fields like unit, category will be null/default
            )
            db.add(db_product)
            created_count += 1
            print(f"Creating new product '{prod_data.name}' for WeeklyAd ID: {weekly_ad_id}")

        processed_names.add(prod_data.name)

    if upserted_count > 0 or created_count > 0:
        # Flush changes within the function, commit might happen outside
        try:
            db.flush()
            print(f"Upsert operation flushed for WeeklyAd ID: {weekly_ad_id}. Updated: {upserted_count}, Created: {created_count}")
        except IntegrityError as e:
            db.rollback()
            print(f"Error during upsert flush for WeeklyAd ID: {weekly_ad_id}. Rolled back changes. Error: {e}")
            # Depending on requirements, you might want to raise the exception
            # raise e
    else:
        print(f"No products needed updating or creating for WeeklyAd ID: {weekly_ad_id}")

# TODO: Add functions for querying/retrieving data as needed.
# Examples:
# - get_weekly_ads_by_retailer(db: Session, retailer_id: int, start_date: date, end_date: date)
# - search_products(db: Session, query: str, retailer_id: Optional[int] = None, ...) 