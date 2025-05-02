from pydantic import BaseModel
from datetime import date

'''
Pydantic models define the structure and types for your API's incoming (request) and outgoing (response) data using BaseModel.
They enable FastAPI's automatic validation of incoming data, especially JSON request bodies.
Using Base, Create, and Read models helps structure data schemas for different API operations.
from_attributes=True in a model's Config allows it to easily convert SQLAlchemy (ORM) objects into the Pydantic shape for responses.
Base models focus on core data attributes, while Create/Read models add details like IDs, foreign keys, and related objects.
'''

# --- Product Schemas ---
class ProductBase(BaseModel): # base model for Product
    name: str
    price: float
    unit: str | None = None
    description: str | None = None
    category: str | None = None
    promotion_details: str | None = None

class ProductCreate(ProductBase): # create model for Product
    weekly_ad_id: int # <<<< Foreign key

class Product(ProductBase): # read model for Product
    id: int
    weekly_ad_id: int

    class Config:
        from_attributes = True # For SQLAlchemy model compatibility

# --- WeeklyAd Schemas ---
class WeeklyAdBase(BaseModel):
    publication_date: date | None = None
    valid_from: date | None = None
    valid_to: date | None = None
    filename: str | None = None
    source_url: str | None = None

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