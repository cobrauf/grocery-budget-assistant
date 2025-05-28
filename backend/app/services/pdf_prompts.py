GENERAL_PROMPT_TEMPLATE = """
Extract grocery ad data from the provided PDF file ({file_display_name}).

"retailer": Identify the retailer name only from the following known retailers: {retailers_list_str}. If not on list, use "Unknown".

"valid_from/to": For the weekly ad, extract the valid_from date, valid_to date (YYYY-MM-DD format).

"date_processed": Extract the date_processed={current_date_for_processing}, and the original PDF filename.

"name": For each product, extract its name.

"price": price (as a float/number).

"unit": Extract its unit, (FYI, bottle, can, jar, bag etc all should be "Each") (choose from the provided list: {units_list_str}).

"category": Extract its category (choose from the provided list: {categories_list_str}).

"promotion_details": Extract relevant SALES/PACKAGING info into "promotion_details" field (e.g., "8-oz. Pkg.", "Must Buy 4", "Limit 2", "Requires Coupon", etc).
Also Extract relevant PRODUCT info  (eg, Oats & Honey or Cinnamon Raisin, or brand names).
But don't repeat the unit info in the promotion_details field, otherwise it will be redundant to the "unit" field.
IMPORTANT: Have the sales/packaging info in front of the product info, since sales/packaging info is more important.

"description": Leave this field empty.

"is_frontpage": Identify if a product appears on the front page of the ad and set is_frontpage to true or false.

"emoji": Assign an (just 1) emoji for the product in the emoji field (e.g., "🥬" for lettuce). Don't use 🪴 or words. Can use loosely related emoji if no exact match.

"original_price": Optionally, also extract original_price (often not present).

"promotion_from/to": ONLY if they differ from the main weekly_ad valid_from and valid_to dates.

Additional instructions:
Your output should not have any parentheses.
Becareful of prices that are non-standard, like 2/$4, which means 2 items for $4,
in that case, calculate the price per item, and put the 2/$4 in the promotion_details field.
Ignore Spanish text. Don't output Spanish text unless it's a product name.
If you cannot find the price of the product, or if part of the ad isn't legible, skip the product entirely.
For Albertsons and Vons combo ads, use Albertsons as the retailer.

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
      "name": "string", (keep it <= 20 characters)
      "price": float,
      "retailer": "string",
      "description": "string | null", (not using, keep empty/null)
      "unit": "string | null",
      "category": "string | null",
      "promotion_details": "string | null", (keep to <= 50 characters)
      "original_price": "float | null",
      "promotion_from": "YYYY-MM-DD | null",
      "promotion_to": "YYYY-MM-DD | null",
      "is_frontpage": "boolean | null",
      "emoji": "string (emoji character) | null"
    }}
  ]
}}

Here's an example of a product output:
{{
  "name": "Organic Apple",
  "price": 3.99,
  "retailer": "Aldi",
  "description": null,
  "unit": "Pound",
  "category": "Fruits", 
  "promotion_details": "3-LB. Pkg., 2/$4, Limit 2, Gala Variety",
  "original_price": 4.99,
  "promotion_from": null,
  "promotion_to": null,
  "is_frontpage": true,
  "emoji": "🍎"
}}

Here's another example of a product output:
{{
    "name": "Coca-Cola, Pepsi, Squirt",
      "price": 10.99,
      "retailer": "Food4Less",
      "description": null,
      "unit": "Pack",
      "category": "Beverages",
      "promotion_details": "24-Pack Cans, With Digital Coupon",
      "original_price": 15.99,
      "promotion_from": null,
      "promotion_to": null,
      "is_frontpage": true,
      "emoji": "🥤"
}}

One more example:
  {{
      "name": "White Corn",
        "price": 0.25,
        "retailer": "Jons",
        "description": null,
        "unit": "Each",
        "category": "Produce",
        "promotion_details": "4/$0.99",
        "original_price": null,
        "promotion_from": null,
        "promotion_to": null,
        "is_frontpage": true,
        "emoji": "🌽"
  }},

Ensure the response contains only the JSON object, with no surrounding text, explanations, or markdown formatting like ```json.
"""

PRODUCT_CATEGORIES = [
    "Produce",
    "Fruits",
    "Dairy",
    "Meats",
    "Seafood",
    "Bakery",
    "Beverages",
    "Alcohol",
    "Frozen",
    "Deli",
    "Breakfast",
    "Snacks",
    "Dry Goods",
    "Canned",
    "Condiments",
    "Personal Care",
    "Kitchen",
    "Outdoors",
    "Other"
]

PRODUCT_UNITS = [
    "Each",
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
    "Other"
]

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
