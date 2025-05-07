from pydantic import BaseModel
from typing import Optional
from datetime import date

class ProductBaseSchema(BaseModel):
    name: str
    price: float
    description: Optional[str] = None
    unit: Optional[str] = None
    category: Optional[str] = None
    promotion_details: Optional[str] = None

class WeeklyAdBaseSchema(BaseModel):
    valid_from: date
    valid_to: date
    publication_date: Optional[date] = None
    filename: Optional[str] = None
    source_url: Optional[str] = None 