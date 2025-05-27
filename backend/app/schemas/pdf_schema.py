from pydantic import BaseModel, conlist
from typing import Optional
from datetime import date
from .base_schemas import ProductBaseSchema, WeeklyAdBaseSchema

class PDFProduct(ProductBaseSchema):
    # Fields are inherited, no need to redefine unless overriding
    gen_terms: Optional[str] = None
    pass

class PDFWeeklyAd(WeeklyAdBaseSchema):
    # Fields are inherited
    pass

class ExtractedPDFData(BaseModel):
    retailer: str
    weekly_ad: PDFWeeklyAd
    products: conlist(PDFProduct, min_length=1) # Ensure at least one product is extracted 