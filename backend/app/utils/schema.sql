-- SQL schema based on docs/Feature_PostgresDB

-- Enable extensions if needed (e.g., for pgvector later)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- Table: retailers
CREATE TABLE IF NOT EXISTS retailers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    website VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table: weekly_ads
CREATE TABLE IF NOT EXISTS weekly_ads (
    id BIGSERIAL PRIMARY KEY,
    retailer_id BIGINT NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    date_processed DATE,
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    filename VARCHAR(255),
    ad_period VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT weekly_ads_valid_dates CHECK (valid_from <= valid_to)
);

-- Indexes for weekly_ads
CREATE INDEX IF NOT EXISTS idx_weekly_ads_retailer_id ON weekly_ads(retailer_id);
CREATE INDEX IF NOT EXISTS idx_weekly_ads_valid_to ON weekly_ads(valid_to);

-- Table: products
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    weekly_ad_id BIGINT NOT NULL REFERENCES weekly_ads(id) ON DELETE CASCADE,
    retailer_id BIGINT NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2), -- Price per unit
    original_price NUMERIC(10, 2),
    unit VARCHAR(50), -- e.g., "lb", "each", "pack", "oz", "kg", "g"
    description TEXT,
    category VARCHAR(100), -- e.g., "Produce", "Dairy", "Meat", "Pantry", "Frozen"
    promotion_details TEXT, -- e.g., "Buy One Get One Free", "2 for $5", "Save $1.00"
    promotion_from DATE,
    promotion_to DATE,
    gen_terms TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_frontpage BOOLEAN DEFAULT FALSE,
    emoji VARCHAR(10)
    -- vector_embedding VECTOR(1536) -- Example placeholder for future pgvector integration (dimension depends on model)
);

-- Indexes for products
CREATE INDEX IF NOT EXISTS idx_products_weekly_ad_id ON products(weekly_ad_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Add tsvector columns and triggers for full-text search (optional but recommended)
ALTER TABLE products ADD COLUMN IF NOT EXISTS fts_vector tsvector;

CREATE OR REPLACE FUNCTION update_product_fts_vector() RETURNS trigger AS $$
BEGIN
  NEW.fts_vector := to_tsvector('english',
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(NEW.category, '') || ' ' ||
    coalesce(NEW.promotion_details, '') || ' ' ||
    coalesce(NEW.gen_terms, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_fts_update_trigger
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_product_fts_vector();

-- Index for full-text search
CREATE INDEX IF NOT EXISTS idx_products_fts ON products USING GIN(fts_vector);

-- Grant usage permissions for the anon role if using Supabase RLS
-- You might need to adjust these depending on your RLS policies
-- GRANT SELECT ON TABLE retailers TO anon;
-- GRANT SELECT ON TABLE weekly_ads TO anon;
-- GRANT SELECT ON TABLE products TO anon;
-- GRANT INSERT, UPDATE, DELETE ON TABLE retailers TO service_role;
-- GRANT INSERT, UPDATE, DELETE ON TABLE weekly_ads TO service_role;
-- GRANT INSERT, UPDATE, DELETE ON TABLE products TO service_role; 