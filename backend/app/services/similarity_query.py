import logging
import os
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import text
from typing import List, Optional
import google.generativeai as genai
from dotenv import load_dotenv

from ..models import Product as ProductModel, WeeklyAd as WeeklyAdModel, Retailer as RetailerModel
from ..schemas.data_schemas import ProductWithDetails

'''
Similarity Query Service: Uses vector embeddings to find products similar to a natural language query.
This service generates an embedding for the user's query and finds the most similar products 
using cosine similarity with the stored product embeddings.
'''

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_EMBEDDINGS_MODEL = os.getenv("GEMINI_EMBEDDINGS_MODEL")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY not found in environment variables. Similarity search will fail.")

if not GEMINI_EMBEDDINGS_MODEL:
    logger.warning("GEMINI_EMBEDDINGS_MODEL not found in environment variables. Similarity search will fail.")


def _generate_query_embedding(query_text: str) -> Optional[List[float]]:
    """
    Generates/returns an embedding for the user's query text using Gemini API.
    """
    if not query_text.strip():
        logger.warning("Empty query text provided for embedding generation.")
        return None
        
    try:
        result = genai.embed_content(
            model=GEMINI_EMBEDDINGS_MODEL,
            content=[query_text],  # API expects a list
            task_type="RETRIEVAL_QUERY"
        )
        embeddings = result.get('embedding', [])
        print(f"============== query embeddings: {embeddings[0][:5]} ...")
        if embeddings:
            return embeddings[0]  # Return the first (and only) embedding
        else:
            logger.error("No embeddings returned from Gemini API.")
            return None
    except Exception as e:
        logger.error(f"Error generating query embedding: {e}")
        return None


async def similarity_search_products(
    db: Session,
    query: str,
    ad_period: str = "current",
    limit: int = 20,
    similarity_threshold: float = 0.3
) -> List[ProductWithDetails]:
    """
    Performs similarity search on products using vector embeddings.
    
    Args:
        db: Database session
        query: Natural language query (e.g., "high protein sales")
        ad_period: Which ad period to search (default: "current")
        limit: Maximum number of results to return (default: 20)
        similarity_threshold: Minimum similarity score (0-1, default: 0.3)
    
    Returns:
        List of ProductWithDetails objects ordered by similarity score
    """
    logger.info(f"Starting similarity search for query: '{query}' with limit: {limit}")
    
    if not GEMINI_API_KEY or not GEMINI_EMBEDDINGS_MODEL:
        logger.error("Embedding service is not configured (API key or model missing).")
        return []
    
    # Generate embedding for the query
    query_embedding = _generate_query_embedding(query)
    if not query_embedding:
        logger.error("Failed to generate embedding for query. Returning empty results.")
        return []
    
    try:
        # Use PostgreSQL's vector similarity search with pgvector
        # The <=> operator calculates cosine distance (lower is more similar)
        # We calculate similarity as 1 - distance to get a 0-1 similarity score
        # Format the query embedding as a vector string to avoid parameter casting issues
        vector_str = '[' + ','.join(map(str, query_embedding)) + ']'
        
        sql_query = text(f"""
            SELECT p.*, r.name as retailer_name, wa.valid_from, wa.valid_to, wa.ad_period,
                   (1 - (p.embedding <=> '{vector_str}'::vector)) as similarity_score
            FROM products p
            JOIN weekly_ads wa ON p.weekly_ad_id = wa.id
            JOIN retailers r ON p.retailer_id = r.id
            WHERE p.embedding IS NOT NULL 
            AND wa.ad_period = :ad_period
            AND (1 - (p.embedding <=> '{vector_str}'::vector)) >= :similarity_threshold
            ORDER BY p.embedding <=> '{vector_str}'::vector
            LIMIT :limit
        """)
        
        result = db.execute(sql_query, {
            "ad_period": ad_period,
            "similarity_threshold": similarity_threshold,
            "limit": limit
        })
        
        rows = result.fetchall()
        logger.info(f"Found {len(rows)} products matching similarity search")
        
        # Convert results to ProductWithDetails objects
        products_with_details: List[ProductWithDetails] = []
        for row in rows:
            details = ProductWithDetails(
                id=row.id,
                name=row.name,
                price=row.price,
                original_price=row.original_price,
                unit=row.unit,
                description=row.description,
                category=row.category,
                promotion_details=row.promotion_details,
                promotion_from=row.promotion_from,
                promotion_to=row.promotion_to,
                is_frontpage=row.is_frontpage,
                emoji=row.emoji,
                retailer=row.retailer_name,
                retailer_id=row.retailer_id,
                weekly_ad_id=row.weekly_ad_id,
                retailer_name=row.retailer_name,
                weekly_ad_valid_from=row.valid_from,
                weekly_ad_valid_to=row.valid_to,
                weekly_ad_ad_period=row.ad_period,
            )
            products_with_details.append(details)
            
        logger.info(f"Successfully converted {len(products_with_details)} results to ProductWithDetails")
        return products_with_details
        
    except Exception as e:
        logger.error(f"Error during similarity search: {e}")
        return [] 