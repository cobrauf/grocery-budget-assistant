import logging
import os
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import text, func
from typing import List, Optional
import google.generativeai as genai
from dotenv import load_dotenv
# from pgvector.sqlalchemy import Vector

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

useExpandedQuery = True

def _expand_query_with_llm(query_text: str) -> str:
    """
    Expands a user query using an LLM to get a more comprehensive list of items for semantic search.
    """
    if not query_text.strip():
        logger.warning("Empty query text provided for expansion.")
        return ""

    try:
        # Use the same model as other services, or a default
        model_name = os.getenv("GEMINI_MODEL", 'gemini-pro')
        model = genai.GenerativeModel(model_name)

        prompt = f"""
You are a grocery shopping assistant. Your task is to expand user queries into a list of relevant items or categories that are commonly associated with the original query.
This helps in finding relevant sales in grocery stores. Most items are groceries, but include other items like household items, cleaning supplies, etc.
Return the expanded terms as a comma-separated list. If the query is already specific, just return the original query. Try to gauge the user's intent and expand the query accordingly.
You can add up to 50 items to the list.

Examples:
- Query: "eggs"
- Expanded: "eggs"

- Query: "dairy"
- Expanded: "dairy, milk, cheese, yogurt, butter, sour cream"

- Query: "bbq"
- Expanded: "bbq sauce, hot dogs, hamburgers, burger buns, corn on the cob, ribs, steak, chicken wings, potato salad"

- Query: "pasta night"
- Expanded: "pasta, spaghetti, lasagna, tomato sauce, meatballs, parmesan cheese, garlic bread"

- Query: "drinks"
- Expanded: "soda, juice, water, sparkling water, sports drinks, coffee, tea"

---
Now, expand the following query:
- Query: "{query_text}"
- Expanded:
"""
        response = model.generate_content(prompt)

        if response.parts:
            expanded_query = "".join(part.text for part in response.parts).strip()
            logger.info(f"useExpandedQuery: {useExpandedQuery}. Original query: '{query_text}'. Expanded query: '{expanded_query}'")
            return expanded_query
        else:
            logger.warning(f"LLM did not return an expansion for query: '{query_text}'. Using original query.")
            return query_text

    except Exception as e:
        logger.error(f"Error during query expansion for '{query_text}': {e}")
        # Fallback to the original query in case of an error
        return query_text


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
        logger.info(f"======== query embeddings: {embeddings[0][:5]} ...")
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
    
    if useExpandedQuery:
        expanded_query = _expand_query_with_llm(query)
    else:
        expanded_query = query
    
    query_embedding = _generate_query_embedding(expanded_query)
    if not query_embedding:
        logger.error("Failed to generate embedding for query. Returning empty results.")
        return []
    
    try:
        # Option 1: Using SQLAlchemy ORM with pgvector operators
        similarity_expr = 1 - ProductModel.embedding.cosine_distance(query_embedding)
        
        query_results_orm = (
            db.query(
                ProductModel,
                RetailerModel.name.label('retailer_name'),
                WeeklyAdModel.valid_from,
                WeeklyAdModel.valid_to,
                WeeklyAdModel.ad_period,
                similarity_expr.label('similarity_score')
            )
            .join(WeeklyAdModel, ProductModel.weekly_ad_id == WeeklyAdModel.id)
            .join(RetailerModel, ProductModel.retailer_id == RetailerModel.id)
            .filter(ProductModel.embedding.isnot(None))
            .filter(WeeklyAdModel.ad_period == ad_period)
            .filter(similarity_expr >= similarity_threshold)
            .order_by(ProductModel.embedding.cosine_distance(query_embedding))
            .limit(limit)
            .all()
        )
        
        # Convert results to ProductWithDetails objects
        products_with_details: List[ProductWithDetails] = []
        for row in query_results_orm:
            product, retailer_name, valid_from, valid_to, ad_period, similarity_score = row
            details = ProductWithDetails(
                id=product.id,
                name=product.name,
                price=product.price,
                original_price=product.original_price,
                unit=product.unit,
                description=product.description,
                category=product.category,
                promotion_details=product.promotion_details,
                promotion_from=product.promotion_from,
                promotion_to=product.promotion_to,
                is_frontpage=product.is_frontpage,
                emoji=product.emoji,
                retailer=retailer_name,
                retailer_id=product.retailer_id,
                weekly_ad_id=product.weekly_ad_id,
                retailer_name=retailer_name,
                weekly_ad_valid_from=valid_from,
                weekly_ad_valid_to=valid_to,
                weekly_ad_ad_period=ad_period,
            )
            logger.info(f"+++ Product ID: {product.id}, Name: '{product.name}', Similarity Score: {similarity_score:.4f}")
            products_with_details.append(details)
            
        logger.info(f">>>>>>> ORM method:Successfully converted {len(products_with_details)} results to ProductWithDetails")
        return products_with_details
        
    except Exception as e:
        logger.error(f"Error during similarity search: {e}")
        # Fallback to the parameter binding approach if ORM approach fails
        return await _similarity_search_fallback(db, query_embedding, ad_period, limit, similarity_threshold)


async def _similarity_search_fallback(
    db: Session,
    query_embedding: List[float],
    ad_period: str,
    limit: int,
    similarity_threshold: float
) -> List[ProductWithDetails]:
    """
    Fallback method using proper parameter binding with raw SQL.
    """
    try:
        logger.info("Using fallback SQL approach for similarity search")
        
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
        logger.info(f"Fallback found {len(rows)} products matching similarity search")
        
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
            
        return products_with_details
        
    except Exception as e:
        logger.error(f"Error during fallback similarity search: {e}")
        return [] 