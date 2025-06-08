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
1. Expands the query using an LLM to get a more comprehensive list of items for semantic search.
2. Generates an embedding for the user's query and finds the most similar products 
using cosine similarity with the stored product embeddings.
'''

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_EMBEDDINGS_MODEL = os.getenv("GEMINI_EMBEDDINGS_MODEL")
GEMINI_GENERATIVE_MODEL_NAME = os.getenv("GEMINI_MODEL")

# --- Top-level initializations ---
generative_model = None
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    try:
        generative_model = genai.GenerativeModel(GEMINI_GENERATIVE_MODEL_NAME)
    except Exception as e:
        logger.error(
            f"Failed to initialize GenerativeModel ('{GEMINI_GENERATIVE_MODEL_NAME}'): {e}"
        )
else:
    logger.warning(
        "GEMINI_API_KEY not found in environment variables."
    )


if not GEMINI_EMBEDDINGS_MODEL:
    logger.warning("GEMINI_EMBEDDINGS_MODEL not found in environment variables. Similarity search will fail.")

useExpandedQuery = True

def _expand_query_with_llm(query_text: str) -> str:
    """
    Expands a user query using an LLM to get a more comprehensive list of items for semantic search,
    or returns a direct chat response if the query is not product-related.
    """
    if not query_text.strip():
        logger.warning("Empty query text provided for expansion.")
        return ""

    if not generative_model:
        logger.error("Generative model not available. Cannot expand query.")
        return f"CHAT_RESPONSE: Sorry, the AI model is not available right now."

    try:
        # The model is now initialized at the top level.
        prompt = f"""You are a helpful and friendly grocery shopping AI assistant. Your primary task is to assist users with their grocery shopping needs.

First, classify the user's query into one of two categories: 'product_search' or 'chat'.

1.  **product_search**: The user is asking about grocery items, sales, deals, or anything related to finding products.
2.  **chat**: The user is asking a general question, having a conversation, or saying hello.

Based on the classification, respond as follows:

-   If the intent is **product_search**, depending on query specifics, expand the user's query into a comma-separated list of relevant grocery items and categories. Prefix your response with `SEARCH_QUERY:`.
-   If the intent is **chat**, provide a friendly, conversational response. Prefix your response with `CHAT_RESPONSE:`.

Examples:
- Query: "eggs" (specific item)
- Response: `SEARCH_QUERY: eggs'

- Query: "bbq" (idea, theme, etc.)
- Response: `SEARCH_QUERY: bbq sauce, hot dogs, hamburgers, burger buns, corn on the cob, ribs, steak, chicken wings, potato salad`

- Query: "are you open?"
- Response: `CHAT_RESPONSE: I'm an automated assistant, so I'm always available to help you find the best grocery deals!`

- Query: "hi"
- Response: `CHAT_RESPONSE: Hello! How can I help you with your grocery shopping today?`

---
Now, process the following query:
- Query: "{query_text}"
- Response:
"""
        response = generative_model.generate_content(prompt)

        if response.parts:
            llm_response = "".join(part.text for part in response.parts).strip()
            # Make parsing more robust by stripping potential backticks from the response
            if llm_response.startswith('`') and llm_response.endswith('`'):
                llm_response = llm_response[1:-1].strip()

            if "SEARCH_QUERY:" in llm_response or "CHAT_RESPONSE:" in llm_response:
                logger.info(
                    f"LLM Response for '{query_text}': '{llm_response}'"
                )
                return llm_response
            else:
                # If LLM fails to follow instructions, fallback to treating as search
                logger.warning(f"LLM did not provide a prefixed response. Treating as search. Response: {llm_response}")
                return f"SEARCH_QUERY: {llm_response}"
        else:
            logger.warning(
                f"LLM did not return a response for query: '{query_text}'. Treating as standard search."
            )
            return f"SEARCH_QUERY: {query_text}"

    except Exception as e:
        logger.error(f"Error during query expansion for '{query_text}': {e}")
        # Fallback to a chat response in case of an error
        return "CHAT_RESPONSE: I'm sorry, I encountered an error. Please try again."


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

    llm_response_text = _expand_query_with_llm(query)

    if llm_response_text.startswith("CHAT_RESPONSE:"):
        chat_message = llm_response_text.replace("CHAT_RESPONSE:", "").strip()
        # Return a "fake" product with a special ID to signal a chat response to the client
        return [
            ProductWithDetails(
                id="-1",
                name=chat_message,
                price=0,
                unit="",
                retailer="N/A",
                retailer_id=0,
                weekly_ad_id=0,
                retailer_name="N/A",
                weekly_ad_valid_from="1970-01-01",
                weekly_ad_valid_to="1970-01-01",
                weekly_ad_ad_period="N/A",
            )
        ]

    # If it's a search query, extract it from the prefix
    expanded_query = llm_response_text.replace("SEARCH_QUERY:", "").strip() if useExpandedQuery else query
    
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