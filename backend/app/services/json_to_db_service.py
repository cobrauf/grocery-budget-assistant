import json
# import os
import logging
from sqlalchemy.orm import Session
from .. import models
from ..schemas.pdf_schema import ExtractedPDFData
from ..database import SessionLocal
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

EXTRACTIONS_DIR = Path(__file__).resolve().parent.parent.parent / "pdf" / "extractions"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def update_ad_periods(db: Session, retailer_id: int):
    logger.info(f"Updating ad periods for retailer_id: {retailer_id}")
    # Previous -> Archived
    db.query(models.WeeklyAd).filter(
        models.WeeklyAd.retailer_id == retailer_id,
        models.WeeklyAd.ad_period == 'previous'
    ).update({"ad_period": "archived"}, synchronize_session=False)

    # Current -> Previous
    db.query(models.WeeklyAd).filter(
        models.WeeklyAd.retailer_id == retailer_id,
        models.WeeklyAd.ad_period == 'current'
    ).update({"ad_period": "previous"}, synchronize_session=False)
    db.commit()
    logger.info("Ad periods updated.")

def process_single_json_file(db: Session, file_path: Path):
    logger.info(f"Processing file: {file_path.name}")
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        parsed_data = ExtractedPDFData(**data)
    except json.JSONDecodeError:
        logger.error(f"Invalid JSON in file: {file_path.name}")
        return
    except Exception as e:
        logger.error(f"Error parsing Pydantic model for {file_path.name}: {e}")
        return

    # 1. Check for existing weekly ad by filename
    existing_ad = db.query(models.WeeklyAd).filter(models.WeeklyAd.filename == parsed_data.weekly_ad.filename).first()
    if existing_ad:
        logger.info(f"Weekly ad with filename '{parsed_data.weekly_ad.filename}' already exists. Skipping {file_path.name}.")
        return

    # 2. Get Retailer
    retailer_name = parsed_data.retailer
    db_retailer = db.query(models.Retailer).filter(models.Retailer.name == retailer_name).first()
    if not db_retailer:
        logger.error(f"Retailer '{retailer_name}' not found in database. Skipping {file_path.name}.")
        # Future: Consider creating the retailer if it doesn't exist or a different handling strategy.
        return
    
    logger.info(f"Found retailer: {db_retailer.name} (ID: {db_retailer.id})")

    # 3. Update ad_period for existing ads of this retailer
    update_ad_periods(db, db_retailer.id)

    # 4. Create new WeeklyAd
    new_weekly_ad = models.WeeklyAd(
        retailer_id=db_retailer.id,
        date_processed=parsed_data.weekly_ad.date_processed,
        valid_from=parsed_data.weekly_ad.valid_from,
        valid_to=parsed_data.weekly_ad.valid_to,
        filename=parsed_data.weekly_ad.filename,
        ad_period='current'  # New ads are always current
    )
    db.add(new_weekly_ad)
    db.commit()
    db.refresh(new_weekly_ad)
    logger.info(f"Created new weekly ad ID: {new_weekly_ad.id} for retailer {retailer_name}")

    # 5. Create new Products
    products_created_count = 0
    for pdf_product in parsed_data.products:
        new_product = models.Product(
            weekly_ad_id=new_weekly_ad.id,
            retailer_id=db_retailer.id, # Link product directly to retailer
            name=pdf_product.name,
            price=pdf_product.price,
            original_price=pdf_product.original_price,
            unit=pdf_product.unit,
            description=pdf_product.description,
            category=pdf_product.category,
            promotion_details=pdf_product.promotion_details,
            promotion_from=pdf_product.promotion_from,
            promotion_to=pdf_product.promotion_to
            # original_text_snippet and image_url are not in PDFProduct currently based on schema
        )
        db.add(new_product)
        products_created_count += 1
    
    db.commit()
    logger.info(f"Added {products_created_count} products for weekly ad ID: {new_weekly_ad.id}")
    logger.info(f"Successfully processed {file_path.name}")

def process_json_extractions():
    logger.info(f"Starting JSON extraction processing from directory: {EXTRACTIONS_DIR}")
    db_gen = get_db()
    db = next(db_gen)
    try:
        if not EXTRACTIONS_DIR.exists() or not EXTRACTIONS_DIR.is_dir():
            logger.error(f"Extractions directory not found: {EXTRACTIONS_DIR}")
            return

        processed_files = 0
        for file_path in EXTRACTIONS_DIR.glob("*.json"):
            try:
                process_single_json_file(db, file_path)
                processed_files +=1
            except Exception as e:
                logger.error(f"Failed to process file {file_path.name}: {e}")
                db.rollback() # Rollback on error for this file
            
        logger.info(f"Finished processing. Total files attempted: {processed_files}")
    finally:
        db.close()

if __name__ == "__main__":
    # This allows the script to be run directly for testing or batch processing
    logger.info("Running json_to_db_service directly.")
    process_json_extractions() 