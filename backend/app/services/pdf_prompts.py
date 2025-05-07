GENERAL_PROMPT_TEMPLATE = """
Extract grocery ad data from the provided PDF file ({file_display_name}).
Identify the retailer name. Consider the following known retailers: {retailers_list_str}. If the retailer is not in this list, use the name found in the PDF.
For the weekly ad, extract the valid_from date, valid_to date (YYYY-MM-DD format),
and optionally the publication_date (YYYY-MM-DD format), the original PDF filename, and a source_url if available.
For each product, extract its name (keep it less than 20 characters), price (as a float/number),
its unit (choose from the provided list: {units_list_str}),
its category (choose from the provided list: {categories_list_str}),
any descriptive text (eg, USDA Choice Family Pack, don't repeat unit info, this complements the "name" product field, keep to < 50 characters),
and any promotion_details (e.g., "With Digital Coupon", "Must Buy 4", "Limit 2", "Requires Coupon", etc).

Respond ONLY with a valid JSON object matching the following structure:
{{
  "retailer": "string",
  "weekly_ad": {{
    "valid_from": "YYYY-MM-DD",
    "valid_to": "YYYY-MM-DD",
    "publication_date": "YYYY-MM-DD | null",
    "filename": "string | null",
    "source_url": "string | null"
  }},
  "products": [
    {{
      "name": "string",
      "price": float,
      "description": "string | null",
      "unit": "string | null",
      "category": "string | null",
      "promotion_details": "string | null"
    }}
  ]
}}

Here's an example of a product output:
{{
  "name": "Organic Apple",
  "price": 3.99,
  "description": "Organic, Gala, locally grown",
  "unit": "Pound",
  "category": "Fruits", 
  "promotion_details": "With Digital Coupon"
}}

Ensure the response contains only the JSON object, with no surrounding text, explanations, or markdown formatting like ```json.
"""

PRODUCT_CATEGORIES = [
    "Fresh Produce (Vegetables)",
    "Fruits (Apples)",
    "Dairy (Milk, Cheese, Yogurt)",
    "Meats (Beef, Pork, Chicken, Lamb)",
    "Seafood (Fish)",
    "Baked Goods (Bread, Pastries, In-store Bakery)",
    "Snack Foods (Chips, Pretzels, Crackers)",
    "Beverages (Water, Juice, Soda)",
    "Frozen Foods (Meals, Vegetables, Ice Cream)",
    "Dry Goods (Pasta, Rice, Cereal)",
    "Deli (Meats, Prepared Foods)",
    "Alcoholic Beverages (Beer, Wine, Liquor)",
    "Breakfast Foods",
    "Canned Goods (Soups, Beans, Vegetables)",
    "Condiments",
    "Baking",
    "Household Products (Cleaning Supplies, Paper Goods)",
    "Personal Care (Toiletries, Medicine)",
    "Pet Products",
    "Candy",
    "Other (if can't find a suitable category)" 
]

PRODUCT_UNITS = [
    "Each (Bottle, can, jar, etc)",
    "Pack",
    "Count",
    "Dozen",
    "Case",
    "Pound",          
    "Ounce",          
    "Kg",          
    "Gram",
    "Ml",          
    "Gallon",
    "Quart",
    "Liter",
    "Pint",
    "Other (if can't find a suitable unit)"
]

# This can be updated with a list of known retailer names.
# For now, it's an empty list, meaning the LLM will try to determine it from the PDF.
KNOWN_RETAILERS = [
    "Tokyo Central",
    "Albertsons",
    "Food4Less",
    "Vons",
    "Ralphs",
    "Trader Joe's",
    "Aldi",
    "Sprouts",
    "Jons",
    "Costco",
    "Sam's Club",
    "99 Ranch",
    "Mitsuwa",
    "Superior",
    "H-mart",
    "Hannam Chain",
    "Northgate",
    "Vallarta"
]