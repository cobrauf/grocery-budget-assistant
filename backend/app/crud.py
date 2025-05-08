# from sqlalchemy.orm import Session, joinedload
# from sqlalchemy import func
# from sqlalchemy.exc import IntegrityError
# from typing import List  # Added for type hinting
# from . import models  # Remove schemas from here
# from .schemas import data_schemas  # Import the renamed data_schemas
# from .schemas.pdf_schema import PDFWeeklyAd, PDFProduct  # Update to pdf_schema

# '''
# Purpose: This file is intended to hold the functions that perform database operations based on data extracted from PDFs.
# Functions interact with the database using SQLAlchemy models defined in models.py.

# The mixed CRUD patterns are because: 
# "Find or create" for Retailers avoids duplicate static entries by name.
# "Create" for WeeklyAds as each ad is a distinct new publication.
# "Upsert" for Products handles potential duplicates or updates within a single ad.
# The logic matches the expected behavior of each entity type.
# '''

# # --- Retailer CRUD ---
# # def find_or_create_retailer(db: Session, name: str) -> models.Retailer:
# #     # Try to get the retailer first
# #     db_retailer = db.query(models.Retailer).filter(
# #         func.lower(models.Retailer.name) == func.lower(name)).first()
# #     if db_retailer:
# #         print(f"Found existing retailer: {name} (ID: {db_retailer.id})")
# #         return db_retailer
# #     # If not found, create it
# #     else:
# #         print(f"Creating new retailer: {name}")
# #         # Assuming website is optional or not available from PDF extraction
# #         # Use a default or leave null if the model allows
# #         db_retailer = models.Retailer(name=name)  # Simplified creation
# #         db.add(db_retailer)
# #         try:
# #             db.flush()  # Flush to get the ID and check for potential constraint violations early
# #             db.refresh(db_retailer)
# #             print(f"Created new retailer: {name} (ID: {db_retailer.id})")
# #         except IntegrityError:
# #             db.rollback()  # Rollback if creation fails (e.g., concurrent creation attempt)
# #             print(
# #                 f"Error creating retailer {name}, likely already exists. Querying again.")
# #             db_retailer = db.query(models.Retailer).filter(
# #                 func.lower(models.Retailer.name) == func.lower(name)).first()
# #             if not db_retailer:
# #                 # Handle the rare case where it still doesn't exist after rollback and retry
# #                 raise Exception(
# #                     f"Failed to find or create retailer '{name}' after integrity error.")
# #         return db_retailer


# # def create_retailer(db: Session, retailer: data_schemas.RetailerCreate) -> models.Retailer:
# #     """
# #     Creates a new retailer using the RetailerCreate schema.
# #     """
# #     db_retailer = models.Retailer(
# #         name=retailer.name,
# #         website=retailer.website
# #     )
# #     db.add(db_retailer)
# #     db.flush()
# #     db.refresh(db_retailer)
# #     return db_retailer


# # def get_retailer(db: Session, retailer_id: int) -> models.Retailer:
# #     return db.query(models.Retailer).filter(models.Retailer.id == retailer_id).first()

# # def get_retailers(db: Session) -> List[models.Retailer]:
# #     print("Getting crud.py retailers")
# #     return db.query(models.Retailer).all()


# # # --- WeeklyAd CRUD ---
# # def create_weekly_ad_from_pdf(db: Session, ad_data: PDFWeeklyAd, retailer_id: int) -> models.WeeklyAd:
# #     # Map PDF schema fields to model fields
# #     db_weekly_ad = models.WeeklyAd(
# #         retailer_id=retailer_id,
# #         valid_from=ad_data.valid_from,
# #         valid_to=ad_data.valid_to,
# #         date_processed=ad_data.date_processed,
# #         filename=ad_data.filename
# #     )
# #     db.add(db_weekly_ad)
# #     # Flush to get the ID, commit might happen in the service layer
# #     db.flush()
# #     db.refresh(db_weekly_ad)
# #     print(
# #         f"Created WeeklyAd ID: {db_weekly_ad.id} for Retailer ID: {retailer_id}, Valid: {ad_data.valid_from} to {ad_data.valid_to}")
# #     return db_weekly_ad


# # def create_weekly_ad(db: Session, weekly_ad: data_schemas.WeeklyAdCreate) -> models.WeeklyAd:
# #     db_weekly_ad = models.WeeklyAd(
# #         retailer_id=weekly_ad.retailer_id,
# #         valid_from=weekly_ad.valid_from,
# #         valid_to=weekly_ad.valid_to,
# #         date_processed=weekly_ad.date_processed,
# #         filename=weekly_ad.filename
# #     )
# #     db.add(db_weekly_ad)
# #     db.flush()
# #     db.refresh(db_weekly_ad)
# #     return db_weekly_ad


# # def create_product(db: Session, product: data_schemas.ProductCreate) -> models.Product:
# #     db_product = models.Product(
# #         weekly_ad_id=product.weekly_ad_id,
# #         name=product.name,
# #         price=product.price,
# #         original_price=product.original_price,
# #         unit=product.unit,
# #         description=product.description,
# #         category=product.category,
# #         promotion_details=product.promotion_details,
# #         promotion_from=product.promotion_from,
# #         promotion_to=product.promotion_to
# #     )
# #     db.add(db_product)
# #     db.flush()
# #     db.refresh(db_product)
# #     return db_product

# # --- Product CRUD ---

# # Function to upsert (update or insert) a single product via API
# # def upsert_single_product(db: Session, product_data: data_schemas.ProductCreate) -> models.Product:
# #     """
# #     Updates an existing product or inserts a new one for a specific weekly ad,
# #     based on the product name and weekly_ad_id provided in product_data.
# #     Designed for use with direct API calls using ProductCreate schema.
# #     Does NOT commit the transaction.
# #     """
# #     # Attempt to find an existing product by name within the same weekly ad
# #     existing_product = db.query(models.Product).filter(
# #         models.Product.weekly_ad_id == product_data.weekly_ad_id,
# #         func.lower(models.Product.name) == func.lower(product_data.name) # Case-insensitive comparison
# #     ).first()

# #     if existing_product:
# #         # Update existing product
# #         print(f"Updating existing product '{product_data.name}' (ID: {existing_product.id}) for WeeklyAd ID: {product_data.weekly_ad_id}")
# #         update_data = product_data.model_dump(exclude_unset=True) # Get fields present in input
# #         # Don't update weekly_ad_id or name typically, focus on other fields
# #         update_data.pop('weekly_ad_id', None)
# #         update_data.pop('name', None)

# #         # Check if there are actual changes before updating
# #         changed = False
# #         for key, value in update_data.items():
# #             if getattr(existing_product, key) != value:
# #                 setattr(existing_product, key, value)
# #                 changed = True

# #         if changed:
# #             print(f"Changes detected. Applying update for product '{existing_product.name}'.")
# #             db.add(existing_product) # Add to session to mark for update
# #             # Flush to ensure data is sent to DB before potential subsequent reads/refreshes
# #             db.flush()
# #             db.refresh(existing_product)
# #         else:
# #             print(f"No changes detected for product '{existing_product.name}'. Skipping update.")
# #         return existing_product
# #     else:
# #         # Create new product
# #         print(f"Creating new product '{product_data.name}' for WeeklyAd ID: {product_data.weekly_ad_id}")
# #         db_product = models.Product(**product_data.model_dump())
# #         db.add(db_product)
# #         # Flush to get the ID
# #         db.flush()
# #         db.refresh(db_product)
# #         print(f"Created new product '{db_product.name}' with ID: {db_product.id}")
# #         return db_product

# # Function to upsert (update or insert) products from PDF data
# # def upsert_products(db: Session, products_data: List[PDFProduct], weekly_ad_id: int):
# #     """
# #     Updates existing products or inserts new ones for a specific weekly ad based on product name.
# #     Accepts a list of PDFProduct objects (from PDF extraction).
# #     Does NOT commit the transaction.
# #     """
# #     upserted_count = 0
# #     created_count = 0
# #     processed_names = set() # Keep track of names processed in this batch to avoid duplicate operations

# #     for prod_data in products_data:
# #         if prod_data.name in processed_names:
# #             print(f"Skipping duplicate product name in batch: {prod_data.name}")
# #             continue

# #         # Attempt to find an existing product by name within the same weekly ad
# #         existing_product = db.query(models.Product).filter(
# #             models.Product.weekly_ad_id == weekly_ad_id,
# #             func.lower(models.Product.name) == func.lower(prod_data.name) # Case-insensitive comparison
# #         ).first()

# #         if existing_product:
# #             # Update existing product - PDFProduct now has more fields via inheritance
# #             changed = False
# #             if existing_product.price != prod_data.price:
# #                 existing_product.price = prod_data.price
# #                 changed = True
# #             if existing_product.description != prod_data.description:
# #                 existing_product.description = prod_data.description
# #                 changed = True
# #             if existing_product.unit != prod_data.unit:
# #                 existing_product.unit = prod_data.unit
# #                 changed = True
# #             if existing_product.category != prod_data.category:
# #                 existing_product.category = prod_data.category
# #                 changed = True
# #             if existing_product.promotion_details != prod_data.promotion_details:
# #                 existing_product.promotion_details = prod_data.promotion_details
# #                 changed = True
# #             # Potentially map new optional fields if they are in PDFProduct and extracted
# #             if hasattr(prod_data, 'original_price') and prod_data.original_price is not None and existing_product.original_price != prod_data.original_price:
# #                 existing_product.original_price = prod_data.original_price
# #                 changed = True
# #             if hasattr(prod_data, 'promotion_from') and prod_data.promotion_from is not None and existing_product.promotion_from != prod_data.promotion_from:
# #                 existing_product.promotion_from = prod_data.promotion_from
# #                 changed = True
# #             if hasattr(prod_data, 'promotion_to') and prod_data.promotion_to is not None and existing_product.promotion_to != prod_data.promotion_to:
# #                 existing_product.promotion_to = prod_data.promotion_to
# #                 changed = True

# #             if changed:
# #                 print(f"Updating product '{prod_data.name}' for WeeklyAd ID: {weekly_ad_id}")
# #                 db.add(existing_product) # Add to session to mark for update
# #                 upserted_count += 1
# #             else:
# #                  print(f"No price/desc changes detected for product '{prod_data.name}'. Skipping update.")

# #         else:
# #             # Create new product - Map fields available in PDFProduct
# #             db_product = models.Product(
# #                 weekly_ad_id=weekly_ad_id,
# #                 name=prod_data.name,
# #                 price=prod_data.price,
# #                 description=prod_data.description,
# #                 unit=prod_data.unit,
# #                 category=prod_data.category,
# #                 promotion_details=prod_data.promotion_details,
# #                 original_price=prod_data.original_price if hasattr(prod_data, 'original_price') else None,
# #                 promotion_from=prod_data.promotion_from if hasattr(prod_data, 'promotion_from') else None,
# #                 promotion_to=prod_data.promotion_to if hasattr(prod_data, 'promotion_to') else None
# #             )
# #             db.add(db_product)
# #             created_count += 1
# #             print(f"Creating new product '{prod_data.name}' from PDF data for WeeklyAd ID: {weekly_ad_id}")

# #         processed_names.add(prod_data.name)

# #     if upserted_count > 0 or created_count > 0:
# #         # Flush changes within the function, commit might happen outside
# #         try:
# #             db.flush()
# #             print(f"Upsert (PDF) operation flushed for WeeklyAd ID: {weekly_ad_id}. Updated: {upserted_count}, Created: {created_count}")
# #         except IntegrityError as e:
# #             db.rollback()
# #             print(f"Error during upsert (PDF) flush for WeeklyAd ID: {weekly_ad_id}. Rolled back changes. Error: {e}")
# #             # Depending on requirements, you might want to raise the exception
# #             # raise e
# #     else:
# #         print(f"No products needed updating or creating from PDF data for WeeklyAd ID: {weekly_ad_id}")

# # TODO: Add functions for querying/retrieving data as needed.
# # Examples:
# # - get_weekly_ads_by_retailer(db: Session, retailer_id: int, start_date: date, end_date: date)
# # - search_products(db: Session, query: str, retailer_id: Optional[int] = None, ...)
