from sqlalchemy.orm import Session
from typing import List
from ..models import Retailer as RetailerModel # Use alias to avoid name clash
from ..schemas.data_schemas import Retailer as RetailerSchema

async def get_all_retailers(db: Session) -> List[RetailerSchema]:
    retailers_db = db.query(RetailerModel).all()
    # Pydantic model will handle the conversion if orm_mode (from_attributes) is True
    return retailers_db 