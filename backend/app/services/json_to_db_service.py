import json
# import os
import logging
from sqlalchemy.orm import Session
from .. import models
from ..schemas.pdf_schema import ExtractedPDFData
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SOURCE_JSON_DIR = Path(__file__).resolve().parent.parent.parent / "pdf" / "enhanced_json"


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

def validate_emoji(emoji: str) -> str:
    """
    Validates that the emoji is exactly 1 character.
    If not, returns the default '❔' emoji.
    """
    if emoji and len(emoji) == 1:
        return emoji
    logger.warning(f"emoji: {emoji}, character count: {len(emoji)}, did not change.")
    return emoji

def process_single_json_file(db: Session, file_path: Path):
    logger.info(f"Processing file: {file_path.name}")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
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

    # 5. Create new Products
    products_to_add = []
    for pdf_product in parsed_data.products:
        # Validate emoji before adding to database
        validated_emoji = validate_emoji(pdf_product.emoji)
        
        new_product = models.Product(
            weekly_ad=new_weekly_ad,
            retailer_id=db_retailer.id,
            name=pdf_product.name,
            price=pdf_product.price,
            original_price=pdf_product.original_price,
            unit=pdf_product.unit,
            description=pdf_product.description,
            category=pdf_product.category,
            promotion_details=pdf_product.promotion_details,
            promotion_from=pdf_product.promotion_from,
            promotion_to=pdf_product.promotion_to,
            is_frontpage=pdf_product.is_frontpage,
            emoji=validated_emoji,
            gen_terms=pdf_product.gen_terms
        )
        products_to_add.append(new_product)
    
    db.add_all(products_to_add)

    try:
        db.commit()
        db.refresh(new_weekly_ad)
        logger.info(f"Successfully committed Weekly Ad ID: {new_weekly_ad.id} and {len(products_to_add)} products for retailer {retailer_name} from file {file_path.name}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error committing weekly ad and products for {file_path.name}: {e}. Rolled back transaction.")
        raise
    
    logger.info(f"Successfully processed {file_path.name}")

def process_json_extractions(db: Session):
    logger.info(f"Starting JSON extraction processing from directory: {SOURCE_JSON_DIR}")
    try:
        if not SOURCE_JSON_DIR.exists() or not SOURCE_JSON_DIR.is_dir():
            logger.error(f"Source JSON directory not found: {SOURCE_JSON_DIR}")
            return

        processed_files = 0
        for file_path in SOURCE_JSON_DIR.glob("*.json"):
            try:
                process_single_json_file(db, file_path)
                processed_files +=1
            except Exception as e:
                logger.error(f"Failed to process file {file_path.name}: {e}")
                db.rollback() # Rollback on error for this file
            
        logger.info(f"Finished processing. Total files attempted: {processed_files}")
    finally:
        pass # Pass if no other cleanup is needed

