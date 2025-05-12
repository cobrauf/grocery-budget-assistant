from sqlalchemy.orm import Session, joinedload
from typing import List
from fastapi import HTTPException

from ..models import Product as ProductModel, WeeklyAd as WeeklyAdModel, Retailer as RetailerModel 
from ..schemas.data_schemas import ProductWithDetails 

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
    return products_db 

# New function for searching products
async def search_products(
    db: Session, 
    q: str, 
    limit: int, 
    offset: int
) -> List[ProductWithDetails]:
    '''
    Searches for products using Full-Text Search (FTS) based on the query string.
    Includes joined loading for retailer and weekly ad details.
    '''
    if not q or not q.strip():
        raise HTTPException(status_code=400, detail="Search query 'q' cannot be empty.")

    try:
        search_results = (
            db.query(ProductModel)
            .join(WeeklyAdModel, ProductModel.weekly_ad_id == WeeklyAdModel.id)
            .join(RetailerModel, ProductModel.retailer_id == RetailerModel.id)
            .filter(ProductModel.fts_vector.match(q, postgresql_regconfig='english')) 
            .options(
                joinedload(ProductModel.retailer),
                joinedload(ProductModel.weekly_ad)
            )
            .offset(offset)
            .limit(limit)
            .all()
        )
        # The results should already be ORM objects compatible with ProductWithDetails
        return search_results
    except Exception as e:
        print(f"Error during product search service: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error during product search: {str(e)}")