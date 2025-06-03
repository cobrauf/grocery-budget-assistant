import google.generativeai as genai
import os
from typing import List
import logging
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_EMBEDDINGS_MODEL=os.getenv("GEMINI_EMBEDDINGS_MODEL")

if not GEMINI_API_KEY:
    logger.warning("GOOGLE_API_KEY not found in environment variables. Embedding generation will fail.")
elif not GEMINI_EMBEDDINGS_MODEL:
    logger.warning("GEMINI_EMBEDDINGS_MODEL not found in environment variables. Embedding generation will fail.")
else:
    genai.configure(api_key=GEMINI_API_KEY)
    

def generate_embedding(text_to_embed: str) -> List[float]:
    """Generates a vector embedding for the given text."""
    if not text_to_embed:
        logger.warning("Attempted to generate embedding for empty or None text.")
        return None
    try:
        result = genai.embed_content(
            model=GEMINI_EMBEDDINGS_MODEL,
            content=text_to_embed,
            task_type="RETRIEVAL_QUERY" # I believe this is the correct task type for this model
        )
        return result['embedding']
    except Exception as e:
        logger.error(f"Error generating embedding for text: '{text_to_embed[:100]}...': {e}")
        return None

if __name__ == '__main__':
    if GEMINI_API_KEY:
        logger.info(f"Using embedding model: {GEMINI_EMBEDDINGS_MODEL}")
        sample_text_1 = "Organic bananas, bunch of 5"
        embedding_1 = generate_embedding(sample_text_1)
        if embedding_1:
            logger.info(f"Embedding for '{sample_text_1}': {embedding_1[:5]}... (Dimension: {len(embedding_1)})")

        # Example of combining fields for embedding
        # product_data = {
        #     "name": "Whole Milk",
        #     "description": "Grade A pasteurized whole milk, 1 gallon.",
        #     "category": "Dairy & Eggs",
        #     "gen_terms": "milk, dairy, beverage, calcium"
        # }
        # combined_text = f"Product: {product_data['name']}\nDescription: {product_data['description']}\nCategory: {product_data['category']}\nKeywords: {product_data['gen_terms']}"
        # embedding_combined = generate_embedding(combined_text)
        # if embedding_combined:
        #     logger.info(f"Embedding for combined product data: {embedding_combined[:5]}... (Dimension: {len(embedding_combined)})")
    else:
        logger.error("Cannot run embedding_service.py example: GOOGLE_API_KEY is not set.") 