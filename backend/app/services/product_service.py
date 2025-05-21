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
            # Ensure retailer data is loaded
            joinedload(ProductModel.retailer),
            # Ensure weekly_ad data is loaded
            joinedload(ProductModel.weekly_ad)
        )
        .offset(offset)
        .limit(limit)
    )
    products_orm = query.all()

    products_with_details: List[ProductWithDetails] = []
    for p_orm in products_orm:
        details = ProductWithDetails(
            id=p_orm.id,
            name=p_orm.name,
            price=p_orm.price,
            original_price=p_orm.original_price,
            unit=p_orm.unit,
            description=p_orm.description,
            category=p_orm.category,
            promotion_details=p_orm.promotion_details,
            promotion_from=p_orm.promotion_from,
            promotion_to=p_orm.promotion_to,
            is_frontpage=p_orm.is_frontpage,
            emoji=p_orm.emoji,
            # retailer: str field from ProductBaseSchema, inherited.
            retailer=p_orm.retailer.name if p_orm.retailer else "N/A",
            retailer_id=p_orm.retailer_id,
            weekly_ad_id=p_orm.weekly_ad_id,
            # Fields specific to ProductWithDetails
            retailer_name=p_orm.retailer.name if p_orm.retailer else "N/A",
            weekly_ad_valid_from=p_orm.weekly_ad.valid_from if p_orm.weekly_ad else None,
            weekly_ad_valid_to=p_orm.weekly_ad.valid_to if p_orm.weekly_ad else None,
            weekly_ad_ad_period=p_orm.weekly_ad.ad_period if p_orm.weekly_ad else None,
        )
        products_with_details.append(details)
    return products_with_details


async def search_products(
    db: Session,
    q: str,
    limit: int,
    offset: int
) -> List[ProductWithDetails]:
    '''
    Searches for products using Full-Text Search (FTS) based on the query string.
    Includes joined loading for retailer and weekly ad details.
    Returns a list of Pydantic ProductWithDetails models.
    '''
    if not q or not q.strip():
        raise HTTPException(
            status_code=400, detail="Search query 'q' cannot be empty.")

    try:
        query_results_orm = (
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

        products_with_details: List[ProductWithDetails] = []
        for p_orm in query_results_orm:
            details = ProductWithDetails(
                id=p_orm.id,
                name=p_orm.name,
                price=p_orm.price,
                original_price=p_orm.original_price,
                unit=p_orm.unit,
                description=p_orm.description,
                category=p_orm.category,
                promotion_details=p_orm.promotion_details,
                promotion_from=p_orm.promotion_from,
                promotion_to=p_orm.promotion_to,
                is_frontpage=p_orm.is_frontpage,
                emoji=p_orm.emoji,
                # retailer: str field from ProductBaseSchema
                retailer=p_orm.retailer.name if p_orm.retailer else "N/A",
                retailer_id=p_orm.retailer_id,
                weekly_ad_id=p_orm.weekly_ad_id,
                # Fields specific to ProductWithDetails
                retailer_name=p_orm.retailer.name if p_orm.retailer else "N/A",
                weekly_ad_valid_from=p_orm.weekly_ad.valid_from if p_orm.weekly_ad else None,
                weekly_ad_valid_to=p_orm.weekly_ad.valid_to if p_orm.weekly_ad else None,
                weekly_ad_ad_period=p_orm.weekly_ad.ad_period if p_orm.weekly_ad else None,
            )
            products_with_details.append(details)

        return products_with_details
    except Exception as e:
        print(f"Error during product search service: {e}")
        raise HTTPException(
            status_code=500, detail=f"Internal server error during product search: {str(e)}")


async def get_products_by_filter(
    db: Session,
    store_ids: List[str] = None,  # Made optional, default to None
    categories: List[str] = None,  # Made optional, default to None
    ad_period: str = "current",  # Default to current, but can be overridden
    limit: int = 100,
    offset: int = 0
) -> List[ProductWithDetails]:
    if not store_ids and not categories:
        # If no filters are provided, perhaps return empty or raise error, depending on desired behavior
        # For now, returning empty list as per frontend expectation for /filter? with no params
        return []

    query = (
        db.query(ProductModel)
        .join(WeeklyAdModel, ProductModel.weekly_ad_id == WeeklyAdModel.id)
        # Ensure Retailer is joined for retailer_name
        .join(RetailerModel, ProductModel.retailer_id == RetailerModel.id)
    )

    if store_ids:
        # Convert string IDs to integers if your ProductModel.retailer_id is an integer
        # Assuming retailer_id in ProductModel is an integer. If it's string, no conversion needed.
        try:
            int_store_ids = [int(id_str) for id_str in store_ids]
            query = query.filter(ProductModel.retailer_id.in_(int_store_ids))
        except ValueError:
            raise HTTPException(
                status_code=400, detail="Invalid store ID format. Store IDs must be integers.")

    if categories:
        query = query.filter(ProductModel.category.in_(categories))

    # Apply the ad_period filter
    query = query.filter(WeeklyAdModel.ad_period == ad_period)

    products_orm = (
        query.options(
            joinedload(ProductModel.retailer),
            joinedload(ProductModel.weekly_ad)
        )
        .offset(offset)
        .limit(limit)
        .all()
    )

    products_with_details: List[ProductWithDetails] = []
    for p_orm in products_orm:
        details = ProductWithDetails(
            id=p_orm.id,
            name=p_orm.name,
            price=p_orm.price,
            original_price=p_orm.original_price,
            unit=p_orm.unit,
            description=p_orm.description,
            category=p_orm.category,
            promotion_details=p_orm.promotion_details,
            promotion_from=p_orm.promotion_from,
            promotion_to=p_orm.promotion_to,
            is_frontpage=p_orm.is_frontpage,
            emoji=p_orm.emoji,
            retailer=p_orm.retailer.name if p_orm.retailer else "N/A",
            retailer_id=p_orm.retailer_id,
            weekly_ad_id=p_orm.weekly_ad_id,
            retailer_name=p_orm.retailer.name if p_orm.retailer else "N/A",
            weekly_ad_valid_from=p_orm.weekly_ad.valid_from if p_orm.weekly_ad else None,
            weekly_ad_valid_to=p_orm.weekly_ad.valid_to if p_orm.weekly_ad else None,
            weekly_ad_ad_period=p_orm.weekly_ad.ad_period if p_orm.weekly_ad else None,
        )
        products_with_details.append(details)

    return products_with_details
