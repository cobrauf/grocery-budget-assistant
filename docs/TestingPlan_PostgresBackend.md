# Testing Plan: Database Operations

## 1. Test Data Structure

### 1.1 Required Test Data

- 2 retailers (Safeway and Trader Joe's)
- 1 weekly ad per retailer
- 3 products per weekly ad

### 1.2 Sample Data

#### First Retailer Dataset

```json
{
  "retailer": {
    "name": "Safeway",
    "website": "https://www.safeway.com"
  },
  "weekly_ad": {
    "publication_date": "2024-05-01",
    "valid_from": "2024-05-01",
    "valid_to": "2024-05-07",
    "filename": "safeway_weekly_may1.pdf",
    "source_url": "https://www.safeway.com/weekly-ad/may1"
  },
  "products": [
    {
      "name": "Organic Bananas",
      "price": 0.69,
      "unit": "lb",
      "description": "Fresh organic bananas",
      "category": "Produce",
      "promotion_details": "Save 30¢ per pound"
    },
    {
      "name": "Chicken Breast",
      "price": 2.99,
      "unit": "lb",
      "description": "Fresh boneless skinless chicken breast",
      "category": "Meat",
      "promotion_details": "Save $2.00 per pound"
    },
    {
      "name": "Milk",
      "price": 3.99,
      "unit": "gallon",
      "description": "Whole milk",
      "category": "Dairy",
      "promotion_details": "2 for $7"
    }
  ]
}

#### Second Retailer Dataset
{
  "retailer": {
    "name": "Trader Joe's",
    "website": "https://www.traderjoes.com"
  },
  "weekly_ad": {
    "publication_date": "2024-05-01",
    "valid_from": "2024-05-01",
    "valid_to": "2024-05-07",
    "filename": "traderjoes_weekly_may1.pdf",
    "source_url": "https://www.traderjoes.com/weekly-specials"
  },
  "products": [
    {
      "name": "Organic Avocados",
      "price": 1.99,
      "unit": "each",
      "description": "Fresh organic Hass avocados",
      "category": "Produce",
      "promotion_details": "4 for $5"
    },
    {
      "name": "Greek Yogurt",
      "price": 4.99,
      "unit": "32oz",
      "description": "Plain whole milk Greek yogurt",
      "category": "Dairy",
      "promotion_details": "Regular price"
    },
    {
      "name": "Sourdough Bread",
      "price": 3.49,
      "unit": "loaf",
      "description": "Fresh baked sourdough bread",
      "category": "Bakery",
      "promotion_details": "Fresh baked daily"
    }
  ]
}
```

## 2. Test Flow

### 2.1 Database Connection Test

1. Set up .env with Supabase connection URL
2. Verify connection using FastAPI startup
3. Confirm access to tables

### 2.2 Data Insertion Tests

1. Insert Safeway retailer data
   - Create retailer
   - Create weekly ad
   - Add 3 products
2. Insert Trader Joe's retailer data
   - Create retailer
   - Create weekly ad
   - Add 3 products

### 2.3 Relationship Verification

1. Query products with retailer info
2. Query weekly ads with products
3. Test cascading deletes

## 3. Success Criteria

- Both retailers successfully created
- Weekly ads linked to correct retailers
- All 6 products properly categorized
- Can query across relationships
- Foreign key constraints maintained
- Cascading deletes work properly

## 4. Next Steps

1. Create test data JSON file
2. Test database connection
3. Run insertion tests
4. Verify data relationships

Would you like to proceed with implementing this test plan?
