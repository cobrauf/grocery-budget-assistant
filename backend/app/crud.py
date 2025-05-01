from sqlalchemy.orm import Session
from . import models # Assuming you have models.py with SQLAlchemy models

'''
Purpose: This file is intended to hold the functions that perform database operations. 
For example, get_retailer, create_retailer, functions to get products by date, functions to add a new weekly ad, etc. 
These functions take a database session (db: Session) and any necessary data as input and interact with the database 
using the SQLAlchemy models defined in models.py.
'''

# Example function to get a retailer by ID
def get_retailer(db: Session, retailer_id: int):
    return db.query(models.Retailer).filter(models.Retailer.id == retailer_id).first()

# Example function to create a retailer
def create_retailer(db: Session, name: str, website: str | None = None):
    db_retailer = models.Retailer(name=name, website=website)
    db.add(db_retailer)
    db.commit()
    db.refresh(db_retailer)
    return db_retailer

# Add more functions here for:
# - Getting/Creating Weekly Ads
# - Getting/Creating Products
# - Querying products based on criteria (dates, retailer, keywords, etc.) 