## Product Requirements Document: Weekly Ad Database Structure

**1. Objective**

To design and implement a PostgreSQL database schema capable of storing structured data extracted from weekly grocery store PDF advertisements. This database will serve as the central repository for product information, prices, and ديals, enabling querying and future integration with a vector store for advanced search capabilities.

**2. Scope**

This PRD focuses specifically on defining the logical structure of the PostgreSQL database required to store weekly ad data. It does not cover the PDF parsing, data extraction, or frontend implementation details, except as they relate to the data model.

**3. Requirements**

The database must store information related to:

- **Retailers:** Information about the grocery stores whose ads are processed.
- **Weekly Ads:** Metadata about each processed weekly ad PDF.
- **Products/Deals:** Details of individual products and their associated ديals found within the weekly ads.

The schema should support:

- Storing key product information (name, price, unit (pricing could be per lb, each,etc), description, category (produce, snacks, etc) ).
- Capturing promotional details and validity periods.
- Linking products back to the specific weekly ad and retailer they came from.
- Allowing for efficient querying of products
- Being adaptable for potential future additions like vector embeddings.

**4. Database Schema (Conceptual Outline)**

The database will consist of at least 2 main tables:

- **`weekly_ads`**: Stores metadata for each processed PDF.
  - `id` (Primary Key)
  - `retailer_id` (Foreign Key referencing `retailers`)
  - `publication_date`
  - `valid_from` (Deal start date)
  - `valid_to` (Deal end date)
  - `filename` (Original PDF filename)
  - `processed_at` (Timestamp of processing)
- **`products`**: Stores details about each product/deal found in an ad.
  - `id` (Primary Key)
  - `weekly_ad_id` (Foreign Key referencing `weekly_ads`)
  - `name`
  - `price`
  - `unit` (e.g., "lb", "each", " упаковка")
  - `description` (Optional, more detailed info)
  - `promotion_details` (Text field for deal description, e.g., "Buy One Get One Free", "2 for $5")
  - `original_text_snippet` (Optional, useful for debugging/context)

**5. Considerations**

- Data types should be chosen appropriately for the expected data (e.g., `VARCHAR` for names, `NUMERIC` for prices, `DATE` or `TIMESTAMP` for dates).
- Relationships between tables should be enforced using foreign keys.
- Indexing should be considered for frequently queried columns (e.g., `retailer_id`, `valid_to`).
- The schema should be flexible enough to accommodate variations in data extracted from different ad formats.
- Future integration with vector embeddings will likely require adding a column with a vector data type to the `products` table and enabling a PostgreSQL extension like `pgvector`.
