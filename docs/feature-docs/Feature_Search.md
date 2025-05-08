# Feature: Product Search

## 1. Objective

To provide an API endpoint that allows users (initially via Postman, eventually the frontend) to search for products in the database based on a textual query. The results should be suitable for further client-side filtering.

## 2. API Endpoint

- **Method**: `GET`
- **Path**: `/data/products/search/`
- **Query Parameters**:
  - `q` (string, required): The search term provided by the user (e.g., "eggs", "chicken breast", "organic apples"). If empty or only whitespace, it should be treated as a bad request.
  - `limit` (integer, optional, default: 50): Maximum number of results to return.
  - `offset` (integer, optional, default: 0): Number of results to skip (for pagination).
- **Success Response**:
  - **Status Code**: `200 OK`
  - **Body**: A JSON array of product objects. Each object will conform to a new Pydantic schema, `ProductWithDetails`, which includes product details along with relevant information from its parent `WeeklyAd` and associated `Retailer`.
- **Error Response**:
  - **Status Code**: `400 Bad Request` if `q` is missing, empty, or consists only of whitespace.
  - **Status Code**: `422 Unprocessable Entity` if query parameters like `limit` or `offset` are of the wrong type or invalid values (e.g., negative).
  - **Status Code**: `500 Internal Server Error` for unexpected issues.

## 3. Search Mechanism

The search will primarily leverage PostgreSQL's Full-Text Search (FTS) capabilities. The `products` table already has an `fts_vector` column, populated by a trigger from the `name`, `description`, `category`, and `promotion_details` fields.

- The search query will use the `@@` operator with `to_tsquery` (or `plainto_tsquery` for simpler user input) against the `fts_vector`.
- The `english` text search configuration will be used.
- Results can optionally be ordered by relevance using `ts_rank` or `ts_rank_cd` in the future.

## 4. Response Data (Pydantic Schema)

To support effective client-side filtering and display, the search endpoint will return a list of products using a new Pydantic schema, `ProductWithDetails`.

- **`ProductWithDetails` (to be created in `backend/app/schemas/data_schemas.py`)**:
  - Inherits all fields from the existing `data_schemas.Product` schema.
  - Adds the following fields from related tables:
    - `retailer_name: str` (from `Retailer.name`)
    - `weekly_ad_valid_from: date` (from `WeeklyAd.valid_from`)
    - `weekly_ad_valid_to: date` (from `WeeklyAd.valid_to`)
    - `weekly_ad_ad_period: str` (from `WeeklyAd.ad_period`)
  - The schema's `Config` must have `from_attributes = True`.

The SQLAlchemy query in the endpoint will need to perform joins with `models.Retailer` and `models.WeeklyAd` and use options like `joinedload` to efficiently fetch this related data.

## 5. Backend Support for Frontend Filters

The primary backend support for anticipated frontend filters is achieved by providing comprehensive data in each item of the search results (as per `ProductWithDetails`). This allows the frontend to perform client-side filtering based on:

- Product `category`
- `retailer_name`
- `weekly_ad_ad_period` (e.g., "current", "previous")
- Price range, etc.

**Further Backend Actions for Easier Filter Implementation (Future Enhancements):**

- **Distinct Filter Values Endpoints**: Consider creating separate endpoints to provide lists of unique values for potential filter dropdowns/checkboxes in the UI. This helps the frontend build dynamic filter options.
  - Example: `GET /data/filter-options/categories` (returns unique product categories)
  - Example: `GET /data/filter-options/retailer-names`
  - Example: `GET /data/filter-options/ad-periods`
- **Server-Side Filtering**: If client-side filtering on large search result sets becomes a performance bottleneck, the search endpoint could be enhanced with additional query parameters to perform filtering at the database level (e.g., `&category=Produce&ad_period=current`). This is a more advanced step if needed. For now, client-side filtering on the returned search results is the primary approach.

## 6. Implementation Steps (Code)

1.  **Create `ProductWithDetails` Pydantic Schema**:
    - In `backend/app/schemas/data_schemas.py`.
2.  **Implement Search Endpoint in `backend/app/routers/data.py`**:
    - Define the `GET /data/products/search/` route.
    - Accept `q: str`, `limit: int`, `offset: int` query parameters. Validate `q`.
    - Construct the SQLAlchemy query:
      - Select from `models.Product`.
      - Join with `models.WeeklyAd` and `models.Retailer`.
      - Use `options(joinedload(models.Product.weekly_ad), joinedload(models.Product.retailer))` for eager loading.
      - Apply the FTS filter: `filter(models.Product.fts_vector.match(q, postgresql_regconfig='english'))`.
      - Apply `offset()` and `limit()`.
      - Execute the query (`.all()`).
    - The `response_model` will be `List[data_schemas.ProductWithDetails]`.
3.  **Testing**:
    - Use Postman to thoroughly test the endpoint with various search terms, including terms expected to match names, descriptions, categories, and promotion details.
    - Test `limit` and `offset` parameters.
    - Verify the response structure matches `ProductWithDetails`, including the joined fields.
    - Test edge cases (e.g., empty `q`, no matches).

## 7. Error Handling

- Ensure `q` is not empty/whitespace; return 400 if it is.
- FastAPI will handle 422 for invalid `limit`/`offset` types. Add custom validation for negative values if desired.
- Wrap database query in `try/except` for potential `SQLAlchemyError` and return 500.

## 8. Future Considerations

- **Search Relevance Ranking**: Implement `ts_rank_cd` and order results by relevance.
- **More Advanced FTS Queries**: Support for phrases, boolean operators (AND, OR, NOT) using different `to_tsquery` functions like `websearch_to_tsquery` or by constructing tsquery manually.
- **Highlighting**: Show which parts of the product data matched the search term.
- **Stemming and Synonyms**: Enhance the PostgreSQL FTS configuration for better matching (e.g., "run" matching "running").
