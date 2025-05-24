import google.generativeai as genai
import os
from dotenv import load_dotenv
import json

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables. Please set it in your .env file.")
genai.configure(api_key=GEMINI_API_KEY)
GEMINI_MODEL = os.getenv("GEMINI_MODEL") 


def generate_keywords_for_product_raw(product: dict) -> str:
    """
    Takes a single product dictionary, constructs a prompt for Gemini 
    to generate 5-10 keywords, and simulates an LLM call.
    Returns the raw LLM response (simulated).
    """
    product_name = product.get("name", "Unknown Product")
    category = product.get("category", "Unknown Category")
    description = product.get("description", "")

    prompt = f"""Generate 5-10 relevant keywords or concepts for the following grocery product.
Product Name: {product_name}
Category: {category}
Description: {description}
Keywords:"""

    print(f"--- Prompt for LLM ---\n{prompt}\n----------------------")

    # Simulate LLM call for now
    simulated_llm_response = "organic, healthy, gluten-free, non-gmo, breakfast, cereal, oats"
    print(f"--- Simulated LLM Response ---\n{simulated_llm_response}\n---------------------------")
    return simulated_llm_response

def parse_and_add_keywords_to_product(product: dict) -> dict:
    """
    Takes a product dictionary, gets raw keywords (simulated),
    parses them, and adds them as 'gen_terms' to the product.
    Returns the modified product dictionary.
    """
    raw_keywords_response = generate_keywords_for_product_raw(product)
    
    # Simple parsing: assume comma-separated, strip whitespace
    parsed_keywords = ", ".join([keyword.strip() for keyword in raw_keywords_response.split(',')])
    
    product_copy = product.copy() # Avoid modifying the original dict directly if it's passed around
    product_copy["gen_terms"] = parsed_keywords
    return product_copy

if __name__ == '__main__':
    # Testable Change for Task 1.1
    print("--- Task 1.1 Test ---")
    sample_product_task_1_1 = {
        "name": "Organic Oatmeal",
        "category": "Breakfast",
        "description": "A healthy and delicious organic oatmeal, perfect for a quick breakfast.",
        "price": 3.99,
        "unit": "box",
        "promotion_description": "2 for $7",
        "emoji": "🥣"
    }
    raw_keywords = generate_keywords_for_product_raw(sample_product_task_1_1)
    print(f"Raw keywords from LLM (simulated): '{raw_keywords}'")
    print("--- End Task 1.1 Test ---\n")

    # Testable Change for Task 1.2
    print("--- Task 1.2 Test ---")
    sample_product_task_1_2 = {
        "name": "Artisanal Bread",
        "category": "Bakery",
        "description": "Freshly baked artisanal bread with a crispy crust.",
        "price": 5.50,
        "unit": "loaf",
        "promotion_description": None,
        "emoji": "🍞"
    }
    modified_product = parse_and_add_keywords_to_product(sample_product_task_1_2)
    print("Modified product with gen_terms:")
    print(json.dumps(modified_product, indent=2))
    print("--- End Task 1.2 Test ---") 