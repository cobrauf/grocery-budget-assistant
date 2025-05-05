from pydantic import BaseModel, Field, conlist
from typing import List, Optional
from datetime import date

class PDFProduct(BaseModel):
    name: str
    price: float
    description: Optional[str] = None

class PDFWeeklyAd(BaseModel):
    start_date: date
    end_date: date

class ExtractedPDFData(BaseModel):
    retailer: str
    weekly_ad: PDFWeeklyAd
    products: conlist(PDFProduct, min_length=1) # Ensure at least one product is extracted 