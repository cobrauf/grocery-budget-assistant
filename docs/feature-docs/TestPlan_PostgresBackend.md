# Test Plan: Postgres Backend Operations with Supabase

## Prerequisites

1. Supabase account created ✅
2. Need to:
   - Get Supabase connection URL
   - Add connection URL to `.env` file
   - Apply SQL schema to Supabase database

## Test Operations

### 1. Retailer Operations

```sql
-- Test adding retailer
INSERT INTO retailers (name, website)
VALUES ('Safeway', 'https://www.safeway.com');

-- Test reading retailer
SELECT * FROM retailers WHERE name = 'Safeway';

-- Test updating retailer
UPDATE retailers
SET website = 'https://www.safeway.com/shop'
WHERE name = 'Safeway';

-- Test removing retailer
DELETE FROM retailers WHERE name = 'Safeway';
```

### 2. Weekly Ad Operations

```sql
-- Test adding weekly ad
INSERT INTO weekly_ads (
    retailer_id,
    publication_date,
    valid_from,
    valid_to,
    filename,
    source_url
) VALUES (
    1, -- assuming retailer_id from previous insert
    '2024-05-01',
    '2024-05-01',
    '2024-05-07',
    'safeway_weekly_may1.pdf',
    'https://www.safeway.com/weekly-ad/may1'
);

-- Test reading weekly ad
SELECT wa.*, r.name as retailer_name
FROM weekly_ads wa
JOIN retailers r ON wa.retailer_id = r.id
WHERE r.name = 'Safeway';

-- Test removing weekly ad
DELETE FROM weekly_ads WHERE id = 1;
```

### 3. Product Operations

```sql
-- Test adding product
INSERT INTO products (
    weekly_ad_id,
    name,
    price,
    unit,
    description,
    category,
    promotion_details
) VALUES (
    1, -- assuming weekly_ad_id from previous insert
    'Organic Bananas',
    0.69,
    'lb',
    'Fresh organic bananas',
    'Produce',
    'Save 30¢ per pound'
);

-- Test reading product
SELECT p.*, wa.valid_from, wa.valid_to, r.name as retailer_name
FROM products p
JOIN weekly_ads wa ON p.weekly_ad_id = wa.id
JOIN retailers r ON wa.retailer_id = r.id
WHERE p.category = 'Produce';

-- Test updating product
UPDATE products
SET price = 0.59, promotion_details = 'Special: Save 40¢ per pound'
WHERE name = 'Organic Bananas';

-- Test removing product
DELETE FROM products WHERE name = 'Organic Bananas';
```

## Test Implementation Steps

1. **Initial Setup**

   - Update .env with Supabase connection URL
   - Run schema.sql against Supabase database
   - Verify tables are created successfully

2. **Test Flow**
   a. Add test retailer
   b. Verify retailer in database
   c. Add weekly ad for retailer
   d. Verify weekly ad in database
   e. Add products to weekly ad
   f. Verify products in database
   g. Update product information
   h. Verify updates
   i. Test deletion (products → weekly ad → retailer)
   j. Verify cascade deletion worked correctly

3. **Verification Methods**
   - Use Supabase dashboard to view table contents
   - Query through backend API endpoints
   - Verify foreign key constraints work properly
   - Check that timestamps are being set correctly

## Success Criteria

- ✓ All CRUD operations work as expected
- ✓ Foreign key relationships maintain data integrity
- ✓ Cascade deletes work properly
- ✓ All required fields are enforced
- ✓ Timestamps are automatically set
- ✓ No orphaned records after deletions
