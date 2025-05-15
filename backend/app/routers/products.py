from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

# Import necessary components
from ..database import get_db
from ..services import product_service 
from fastapi.responses import JSONResponse  
from fastapi.encoders import jsonable_encoder   
from ..schemas.data_schemas import ProductWithDetails # Ensure ProductWithDetails is available


router = APIRouter(
    prefix="/products", # Prefix for all product routes
    tags=["Products"]  # Tag for Swagger UI
)

@router.get("/search/")
async def search_products_endpoint(
    q: str = Query(..., min_length=1, description="Search term for products."),
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=200, description="Max results."),
    offset: int = Query(0, ge=0, description="Offset for pagination.")
):
    """
    Endpoint to search for products using Full-Text Search.
    Delegates the search logic to product_service.search_products.
    """
    print(f"Searching products with query: '{q}', limit: {limit}, offset: {offset}")
    try:
        # Call the service function to perform the search
        search_results = await product_service.search_products(
            db=db, q=q, limit=limit, offset=offset
        )
        return search_results
    except HTTPException as http_exc:
        # Re-raise HTTPException from the service layer
        raise http_exc
    except Exception as e:
        # Catch any other unexpected errors
        print(f"Unexpected error in search_products_endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during product search.")


@router.get("/retailer/{retailer_id}") 
async def get_products_by_retailer_manual_json(
    retailer_id: int,
    ad_period: str = Query("current", description="Ad period (e.g., 'current', 'upcoming')."),
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    """
    Endpoint to get products for a specific retailer and ad period.
    Returns a manually constructed JSONResponse using jsonable_encoder.
    """
    try:
        # Call the service function
        products_db = await product_service.get_products_by_retailer_and_ad_period(
            db=db, 
            retailer_id=retailer_id, 
            ad_period=ad_period,
            limit=limit,
            offset=offset
        )
        # Use jsonable_encoder for serialization, similar to the original endpoint
        return JSONResponse(content=jsonable_encoder(products_db))
    except HTTPException as http_exc:
        # Re-raise known HTTP exceptions
        raise http_exc
    except Exception as e:
        print(f"Error fetching products for retailer {retailer_id}, ad period '{ad_period}': {e}")
        raise HTTPException(status_code=500, detail="Error fetching products for specified retailer and ad period.") 

@router.get("/filter/", response_model=List[ProductWithDetails]) # Added response_model
async def get_filtered_products_endpoint(
    store_ids: str = Query(None, description="Comma-separated list of store IDs. E.g., '1,2,3'"),
    categories: str = Query(None, description="Comma-separated list of categories. E.g., 'Dairy,Meats'"),
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of products to return."),
    offset: int = Query(0, ge=0, description="Offset for pagination.")
):
    """
    Endpoint to get products based on selected store IDs and/or categories.
    Filters are optional. If no filters are provided, it might return an empty list or all current products based on service logic.
    """
    parsed_store_ids = store_ids.split(',') if store_ids else []
    parsed_categories = categories.split(',') if categories else []

    try:
        filtered_products = await product_service.get_products_by_filter(
            db=db,
            store_ids=parsed_store_ids,
            categories=parsed_categories,
            limit=limit,
            offset=offset
        )
        # FastAPI will automatically handle serialization with response_model
        return filtered_products
    except HTTPException as http_exc:
        raise http_exc
    except ValueError as ve:
        # Specific error for invalid integer conversion from service layer
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"Unexpected error in get_filtered_products_endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while filtering products.") 