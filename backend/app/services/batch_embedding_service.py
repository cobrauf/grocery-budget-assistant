import logging
import os
from sqlalchemy.orm import Session
from sqlalchemy import update
from typing import List, Dict, Any, Optional

import google.generativeai as genai
from dotenv import load_dotenv
from .. import models

load_dotenv() 

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration for Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_EMBEDDINGS_MODEL = os.getenv("GEMINI_EMBEDDINGS_MODEL")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY not found in environment variables. Embedding generation will fail.")

if not GEMINI_EMBEDDINGS_MODEL:
    logger.warning("GEMINI_EMBEDDINGS_MODEL not found in environment variables. Embedding generation will fail.")

BATCH_SIZE = 100  # Number of products to process from DB at a time
EMBEDDING_API_BATCH_SIZE = 100 # Max number of texts to send to Gemini API in one call (Gemini API limit is often 100)
TEST_ROUND_LIMIT = 1


def construct_text_for_embedding(product: models.Product) -> str:
    """
    Constructs a single string from product fields for embedding.
    Fields used: name, category, promotion_details, gen_terms.
    """
    parts = []
    if product.name:
        parts.append(f"Product Name: {product.name}")
    if product.category:
        parts.append(f"Category: {product.category}")
    if product.promotion_details:
        parts.append(f"Promotional Details: {product.promotion_details}")
    if product.gen_terms:
        parts.append(f"Generated Terms: {product.gen_terms}")
        
    print(f"Constructed text for embedding: {parts}")
    return "\n".join(parts)

def _generate_embeddings_batch(texts: List[str]) -> List[Optional[List[float]]]:
    """
    Generates embeddings for a batch of texts using Gemini API.
    Returns a list of embeddings or None for each text if an error occurs for that text or the batch.
    """
    if not texts:
        return []
    if not GEMINI_API_KEY or not GEMINI_EMBEDDINGS_MODEL:
        logger.error("Gemini API key or model not configured. Cannot generate embeddings.")
        return [None] * len(texts)

    try:
        result = genai.embed_content(
            model=GEMINI_EMBEDDINGS_MODEL,
            content=texts,  # API expects a list of strings for batching
            task_type="RETRIEVAL_QUERY" 
        )
        # result['embedding'] will be a list of lists (embeddings)
        return result.get('embedding', [None] * len(texts)) 
    except Exception as e:
        logger.error(f"Error generating batch embeddings for {len(texts)} texts: {e}")
        # Return a list of Nones, so we can map it back to products and skip them
        return [None] * len(texts)


async def batch_embed_products(db: Session) -> Dict[str, Any]:
    """
    Fetches products, generates embeddings in batches, and updates them.
    """
    logger.info(f"Starting batch embedding process. DB Batch size: {BATCH_SIZE}. API Batch Size: {EMBEDDING_API_BATCH_SIZE}. Model: {GEMINI_EMBEDDINGS_MODEL or 'Not Configured'}")

    if not GEMINI_API_KEY or not GEMINI_EMBEDDINGS_MODEL:
        logger.error("Embedding service is not configured (API key or model missing). Aborting.")
        return {"status": "Error: Embedding service not configured.", "batches_processed": 0, "total_products_queried": 0, "total_products_updated": 0}

    total_products_queried_from_db = 0
    total_products_successfully_embedded = 0
    db_batches_processed = 0

    while True:
        products_for_this_db_batch = db.query(models.Product).join(models.WeeklyAd).filter(
            models.WeeklyAd.ad_period == 'current',
            models.Product.embedding == None
        ).limit(BATCH_SIZE).all()

        if not products_for_this_db_batch:
            logger.info("No more products found to embed.")
            break
        
        db_batches_processed += 1
        if db_batches_processed >= TEST_ROUND_LIMIT:
            print(f"!!!!!!!!!!!!!TEST ROUND LIMIT REACHED. Exiting after {db_batches_processed} DB batches.")
            return
        logger.info(f"Processing DB batch {db_batches_processed}. Products in this DB batch: {len(products_for_this_db_batch)}")
        total_products_queried_from_db += len(products_for_this_db_batch)

        # Prepare texts and track corresponding products
        product_text_pairs = []
        for product in products_for_this_db_batch:
            text_to_embed = construct_text_for_embedding(product)
            if text_to_embed.strip():
                product_text_pairs.append({"product": product, "text": text_to_embed})
            else:
                logger.warning(f"Product ID {product.id} ('{product.name}') has no content to embed. Skipping.")

        if not product_text_pairs:
            logger.info(f"No products with text to embed in DB batch {db_batches_processed}. Continuing.")
            if len(products_for_this_db_batch) < BATCH_SIZE: # Last DB batch was processed
                 break
            continue
            
        # Process texts in chunks for the embedding API
        for i in range(0, len(product_text_pairs), EMBEDDING_API_BATCH_SIZE):
            api_batch_product_text_pairs = product_text_pairs[i:i + EMBEDDING_API_BATCH_SIZE]
            texts_for_api_batch = [pair["text"] for pair in api_batch_product_text_pairs]
            
            if not texts_for_api_batch:
                continue

            logger.info(f"Sending {len(texts_for_api_batch)} texts to Gemini API for embedding (DB Batch {db_batches_processed}).")
            embedding_vectors = _generate_embeddings_batch(texts_for_api_batch)

            updates_in_api_batch = 0
            for idx, pair in enumerate(api_batch_product_text_pairs):
                product_to_update = pair["product"]
                embedding_vector = embedding_vectors[idx] if idx < len(embedding_vectors) else None

                if embedding_vector:
                    try:
                        stmt = update(models.Product).where(models.Product.id == product_to_update.id).values(embedding=embedding_vector)
                        db.execute(stmt)
                        updates_in_api_batch += 1
                    except Exception as e:
                        logger.error(f"Error updating embedding for product ID {product_to_update.id} ('{product_to_update.name}'): {e}")
                else:
                    logger.warning(f"Failed to generate embedding for product ID {product_to_update.id} ('{product_to_update.name}'). Skipping update.")
            
            if updates_in_api_batch > 0:
                try:
                    db.commit()
                    logger.info(f"Committed {updates_in_api_batch} product embedding updates for API batch.")
                    total_products_successfully_embedded += updates_in_api_batch
                except Exception as e:
                    db.rollback()
                    logger.error(f"Error committing API batch updates: {e}. Rolled back.")
            else:
                logger.info("No embeddings were successfully generated or updated in this API batch. No commit needed.")

        if len(products_for_this_db_batch) < BATCH_SIZE: # Last DB batch was processed
            logger.info("Processed the last potential DB batch of products.")
            break
            
    logger.info(f"Batch embedding process finished. DB Batches: {db_batches_processed}. Products Queried from DB: {total_products_queried_from_db}. Products Successfully Embedded: {total_products_successfully_embedded}.")
    return {
        "status": "Batch embedding process finished.",
        "db_batches_processed": db_batches_processed,
        "total_products_queried_from_db": total_products_queried_from_db,
        "total_products_successfully_embedded": total_products_successfully_embedded
    } 