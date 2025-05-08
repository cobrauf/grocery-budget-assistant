from pydantic import BaseModel
from datetime import date
from .base_schemas import ProductBaseSchema, WeeklyAdBaseSchema # Added import

'''
Pydantic models define the structure and types for your API's incoming (request) and outgoing (response) data using BaseModel.
They enable FastAPI's automatic validation of incoming data, especially JSON request bodies.
Using Base, Create, and Read models helps structure data schemas for different API operations.
from_attributes=True in a model's Config allows it to easily convert SQLAlchemy (ORM) objects into the Pydantic shape for responses.
Base models focus on core data attributes, while Create/Read models add details like IDs, foreign keys, and related objects.
'''

# --- Product Schemas ---
class ProductBase(ProductBaseSchema): # Inherits from ProductBaseSchema
    retailer_id: int # Added retailer_id

class ProductCreate(ProductBase): # create model for Product
    weekly_ad_id: int # <<<< Foreign key

class Product(ProductBase): # read model for Product
    id: int
    weekly_ad_id: int

    class Config:
        from_attributes = True # For SQLAlchemy model compatibility

class ProductWithDetails(Product): # New schema for search results
    retailer_name: str
    weekly_ad_valid_from: date
    weekly_ad_valid_to: date
    weekly_ad_ad_period: str

# --- WeeklyAd Schemas ---
class WeeklyAdBase(WeeklyAdBaseSchema): # Inherits from WeeklyAdBaseSchema
    ad_period: str # Added ad_period

class WeeklyAdCreate(WeeklyAdBase):
    retailer_id: int # Foreign key

class WeeklyAd(WeeklyAdBase):
    id: int
    retailer_id: int
    products: list[Product] = [] # Include related products when reading

    class Config:
        from_attributes = True

# --- Retailer Schemas ---
class RetailerBase(BaseModel):
    name: str
    website: str | None = None

class RetailerCreate(RetailerBase):
    pass # No extra fields needed for creation beyond Base

class Retailer(RetailerBase):
    id: int
    weekly_ads: list[WeeklyAd] = [] # Include related weekly ads when reading

    class Config:
        from_attributes = True 