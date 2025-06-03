import google.generativeai as genai
import os
from typing import List
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# It's recommended to set your GOOGLE_API_KEY as an environment variable
# For example, in your .env file: GOOGLE_API_KEY="YOUR_API_KEY"
# Ensure you have loaded environment variables if you are using a .env file
# from dotenv import load_dotenv
# load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    logger.warning("GOOGLE_API_KEY not found in environment variables. Embedding generation will fail.")
    # You might want to raise an error here or handle it depending on your application's needs
    # raise ValueError("GOOGLE_API_KEY not set in environment variables")
else:
    genai.configure(api_key=GOOGLE_API_KEY)

# As per the PRD, using Gemini text-embedding-004 (768 dimensions)
EMBEDDING_MODEL_NAME = "models/text-embedding-004" # Correct model name for Gemini API

def generate_embedding(text_to_embed: str) -> List[float]:
    """
    Generates a vector embedding for the given text using the Gemini API.

    Args:
        text_to_embed: The string of text to embed.

    Returns:
        A list of floats representing the embedding, or None if an error occurs.
    """
    if not text_to_embed:
        logger.warning("Attempted to generate embedding for empty or None text.")
        return None
    if not GOOGLE_API_KEY:
        logger.error("Cannot generate embedding: GOOGLE_API_KEY is not configured.")
        return None # Or raise an exception

    try:
        # The new API uses embed_content
        result = genai.embed_content(
            model=EMBEDDING_MODEL_NAME,
            content=text_to_embed,
            task_type="RETRIEVAL_DOCUMENT" # or "SEMANTIC_SIMILARITY" / "RETRIEVAL_QUERY" depending on use
        )
        return result['embedding']
    except Exception as e:
        logger.error(f"Error generating embedding for text: '{text_to_embed[:100]}...': {e}")
        return None

if __name__ == '__main__':
    # Example usage (requires GOOGLE_API_KEY to be set)
    if GOOGLE_API_KEY:
        logger.info(f"Using embedding model: {EMBEDDING_MODEL_NAME}")
        sample_text_1 = "Organic bananas, bunch of 5"
        embedding_1 = generate_embedding(sample_text_1)
        if embedding_1:
            logger.info(f"Embedding for '{sample_text_1}': {embedding_1[:5]}... (Dimension: {len(embedding_1)})")

        sample_text_2 = "Fresh strawberries, 1lb container, perfect for desserts."
        embedding_2 = generate_embedding(sample_text_2)
        if embedding_2:
            logger.info(f"Embedding for '{sample_text_2}': {embedding_2[:5]}... (Dimension: {len(embedding_2)})")

        # Example of combining fields for embedding
        product_data = {
            "name": "Whole Milk",
            "description": "Grade A pasteurized whole milk, 1 gallon.",
            "category": "Dairy & Eggs",
            "gen_terms": "milk, dairy, beverage, calcium"
        }
        combined_text = f"Product: {product_data['name']}\nDescription: {product_data['description']}\nCategory: {product_data['category']}\nKeywords: {product_data['gen_terms']}"
        embedding_combined = generate_embedding(combined_text)
        if embedding_combined:
            logger.info(f"Embedding for combined product data: {embedding_combined[:5]}... (Dimension: {len(embedding_combined)})")
    else:
        logger.error("Cannot run embedding_service.py example: GOOGLE_API_KEY is not set.") 