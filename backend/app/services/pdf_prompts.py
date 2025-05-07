GENERAL_PROMPT_TEMPLATE = """
Extract grocery ad data from the provided PDF file ({file_display_name}).
Identify the retailer name. Consider the following known retailers: {retailers_list_str}. If the retailer is not in this list, use the name found in the PDF.
For the weekly ad, extract the valid_from date, valid_to date (YYYY-MM-DD format),
and the date_processed (YYYY-MM-DD format) which would be today's date, and the original PDF filename.
For each product, extract its name (keep it less than 20 characters), price (as a float/number),
its unit (choose from the provided list: {units_list_str}),
its category (choose from the provided list: {categories_list_str}),
any descriptive text (eg, USDA Choice Family Pack, don't repeat unit info, this complements the "name" product field, keep to < 50 characters),
and any promotion_details (e.g., "With Digital Coupon", "Must Buy 4", "Limit 2", "Requires Coupon", etc).
Optionally, also extract original_price (often not present), promotion_from and promotion_to ONLY if they differ from the main weekly_ad valid_from and valid_to dates.
Don't output text within the (), that is meant as hints for you. Your output should not have any parentheses.
Becareful of prices that are non-standard, like 2/$4, which means 2 items for $4,
in that case, calculate the price per item, and put the 2/$4 in the promotion_details field.

Respond ONLY with a valid JSON object matching the following structure:
{{
  "retailer": "string",
  "weekly_ad": {{
    "valid_from": "YYYY-MM-DD",
    "valid_to": "YYYY-MM-DD",
    "date_processed": "YYYY-MM-DD | null",
    "filename": "string | null"
  }},
  "products": [
    {{
      "name": "string",
      "price": float,
      "description": "string | null",
      "unit": "string | null",
      "category": "string | null",
      "promotion_details": "string | null",
      "original_price": "float | null",
      "promotion_from": "YYYY-MM-DD | null",
      "promotion_to": "YYYY-MM-DD | null"
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
  "promotion_details": "With Digital Coupon",
  "original_price": 4.99,
  "promotion_from": null,
  "promotion_to": null
}}
Ensure the response contains only the JSON object, with no surrounding text, explanations, or markdown formatting like ```json.
"""

PRODUCT_CATEGORIES = [
    "Fresh Produce",
    "Fruits",
    "Dairy",
    "Meats",
    "Seafood",
    "Baked Goods",
    "Snack Foods",
    "Beverages",
    "Frozen Foods",
    "Dry Goods",
    "Deli",
    "Alcoholic Beverages",
    "Breakfast Foods",
    "Canned Goods",
    "Condiments",
    "Baking",
    "Household Products",
    "Personal Care",
    "Pet Products",
    "Candy",
    "Other (if can't find a suitable category)" 
]

PRODUCT_UNITS = [
    "Each (eg, bottle, can, jar, bagetc all should be Each)",
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