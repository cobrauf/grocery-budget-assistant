from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from .. import models
from ..database import get_db 
from ..services import json_to_db_service
from ..services import json_enhancement_service
from ..services import batch_embedding_service
from ..services import similarity_query
from ..services.similarity_query import DEFAULT_SEARCH_LIMIT, DEFAULT_SIMILARITY_THRESHOLD
from ..schemas.data_schemas import ProductWithDetails

'''
Defines API endpoints for retrieving data (Retailers, Weekly Ads, Products),
Creation/Update operations via PDF upload happen through a different process.
Uses FastAPI's APIRouter to group these data-related routes.
Handles database operations using SQLAlchemy sessions.
Validates and formats data using Pydantic schemas.
'''

router = APIRouter(
    prefix="/data",  # Optional prefix for all routes in this router
    tags=["Data Management"]  # Tag for Swagger UI documentation
)

# Keeping get retailers/weekly ads here for now. Products endpoints moved to products.py + product_service.py
@router.get("/retailers/")
def list_retailers(db: Session = Depends(get_db)):
    print("Listing retailers")
    return db.query(models.Retailer).all()

@router.get("/weekly_ads/")
async def list_weekly_ads(db: Session = Depends(get_db)):
    print("Listing weekly ads")
    return db.query(models.WeeklyAd).all()

@router.post("/json_to_db/")
async def upload_jsons_to_db(db: Session = Depends(get_db)):
    print("uploading JSONs to DB")
    return json_to_db_service.process_json_extractions(db)

@router.post("/enhance_json/")
async def enhance_json_files_endpoint(): # ensure this is async def
    print("Async Enhancing JSON files via API endpoint...")
    try:
        await json_enhancement_service.enhance_all_json_files() # await the async function
        return {"message": "JSON enhancement process started successfully and has completed."} # Or reflect ongoing status
    except Exception as e:
        print(f"Error during JSON enhancement process: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred during JSON enhancement: {str(e)}")
   

@router.post("/embed_products", response_model=Dict[str, Any]) # response_model is used to specify the expected return type of the endpoint (the message) (not required)
async def trigger_batch_embedding( db: Session = Depends(get_db)):
    """
    Endpoint to trigger the batch embedding process for products.
    """
    print("Embedding products began...")
    await batch_embedding_service.batch_embed_products(db)
    return {
        "message": "Batch product embedding process finished."
    }

# Pydantic model for similarity query request body
class SimilarityQueryRequest(BaseModel):
    query: str
    ad_period: str = "current"
    limit: int = DEFAULT_SEARCH_LIMIT
    similarity_threshold: float = DEFAULT_SIMILARITY_THRESHOLD

# Pydantic model for similarity query response
class SimilarityQueryResponse(BaseModel):
    query_type: str  # e.g., "CHAT_RESPONSE", "SEARCH_RESULT", "CURATED_LIST"
    llm_message: Optional[str] = None  # The LLM's contextual message
    query: str  # For SEARCH_RESULT: expanded search terms; For others: original query or descriptor
    results_count: int
    products: List[ProductWithDetails]

@router.post("/test_similarity_query", response_model=SimilarityQueryResponse)
async def test_similarity_query(
    request: SimilarityQueryRequest,
    db: Session = Depends(get_db)
):
    """
    Test endpoint for similarity-based product search using vector embeddings.
    Returns the top matching products based on semantic similarity.
    """
    print(f"Similarity query request: {request.query}")
    
    try:
        results_dict = await similarity_query.similarity_search_products(
            db=db,
            query=request.query,
            ad_period=request.ad_period,
            limit=request.limit,
            similarity_threshold=request.similarity_threshold
        )
        
        response = SimilarityQueryResponse(**results_dict)
        
        print(f"Similarity query completed. Found {results_dict['results_count']} results.")
        return response
        
    except Exception as e:
        print(f"Error during similarity query: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred during similarity search: {str(e)}"
        )
    
    
# class TestQueryResponse(BaseModel):
#     results_count: int
#     product_name: List[str]
    
# @router.get("/test_1", response_model=TestQueryResponse)
# async def test_1(db: Session = Depends(get_db)):
    

