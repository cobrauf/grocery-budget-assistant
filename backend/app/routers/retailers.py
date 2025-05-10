from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..services import retailer_service # Make sure retailer_service.py is created
from ..schemas.data_schemas import Retailer as RetailerSchema

router = APIRouter(
    prefix="/retailers",
    tags=["Retailers"]
)

@router.get("/", response_model=List[RetailerSchema]) # Changed path to "/" as prefix is "/retailers"
async def read_all_retailers(db: Session = Depends(get_db)):
    retailers = await retailer_service.get_all_retailers(db=db)
    return retailers 