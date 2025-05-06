from pydantic import BaseModel, conlist
from typing import Optional
from datetime import date

class PDFProduct(BaseModel):
    name: str
    price: float
    description: Optional[str] = None
    unit: Optional[str] = None
    category: Optional[str] = None
    promotion_details: Optional[str] = None

class PDFWeeklyAd(BaseModel):
    valid_from: date
    valid_to: date
    publication_date: Optional[date] = None
    filename: Optional[str] = None
    source_url: Optional[str] = None

class ExtractedPDFData(BaseModel):
    retailer: str
    weekly_ad: PDFWeeklyAd
    products: conlist(PDFProduct, min_length=1) # Ensure at least one product is extracted 