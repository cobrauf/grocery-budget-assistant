from sqlalchemy.orm import Session, joinedload
from typing import List

from ..models import Product as ProductModel, WeeklyAd as WeeklyAdModel # Aliased for clarity
from ..schemas.data_schemas import ProductWithDetails # Response schema

async def get_products_by_retailer_and_ad_period(
    db: Session, 
    retailer_id: int, 
    ad_period: str,
    limit: int = 100, 
    offset: int = 0
) -> List[ProductWithDetails]:
    query = (
        db.query(ProductModel)
        .join(WeeklyAdModel, ProductModel.weekly_ad_id == WeeklyAdModel.id)
        .filter(ProductModel.retailer_id == retailer_id)
        .filter(WeeklyAdModel.ad_period == ad_period)
        .options(
            joinedload(ProductModel.retailer), # Ensure retailer data is loaded
            joinedload(ProductModel.weekly_ad) # Ensure weekly_ad data is loaded for ProductWithDetails
        )
        .offset(offset)
        .limit(limit)
    )
    products_db = query.all()
    
    # Convert to Pydantic schema. ProductWithDetails should be able to handle this
    # if its Config has from_attributes = True and relationships are correctly defined.
    # The ProductWithDetails schema includes fields from related models, 
    # so Pydantic needs to access these through the SQLAlchemy model instance attributes.
    return products_db 