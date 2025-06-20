from sqlalchemy import Column, Integer, String, Date, Numeric, Text, ForeignKey, DateTime, CheckConstraint, Index, BigInteger, text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import TIMESTAMP, TSVECTOR
from pgvector.sqlalchemy import Vector

from .database import Base


'''
Purpose: Defines Python classes (Retailer, WeeklyAd, Product) that
map directly to your database tables (retailers, weekly_ads, products). 
These are SQLAlchemy ORM models. Each class attribute corresponds to a table column. 
It also defines the relationships between tables (e.g., a WeeklyAd belongs to a Retailer and has many Products).
Product table includes a field specifically for full-text search (TSVECTOR).
'''


class Retailer(Base):
    __tablename__ = "retailers"

    id = Column(BigInteger, primary_key=True, server_default=text("nextval('retailers_id_seq'::regclass)"))
    name = Column(String(255), nullable=False, unique=True)
    website = Column(String(255))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    weekly_ads = relationship("WeeklyAd", back_populates="retailer")

class WeeklyAd(Base):
    __tablename__ = "weekly_ads"

    id = Column(BigInteger, primary_key=True, server_default=text("nextval('weekly_ads_id_seq'::regclass)"))
    retailer_id = Column(BigInteger, ForeignKey("retailers.id", ondelete="CASCADE"), nullable=False)
    date_processed = Column(Date)
    valid_from = Column(Date, nullable=False)
    valid_to = Column(Date, nullable=False)
    filename = Column(String(255))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    ad_period = Column(String(50), nullable=False)

    retailer = relationship("Retailer", back_populates="weekly_ads")
    products = relationship("Product", back_populates="weekly_ad")

    __table_args__ = (
        CheckConstraint('valid_from <= valid_to', name='weekly_ads_valid_dates'),
        Index('idx_weekly_ads_retailer_id', 'retailer_id'),
        Index('idx_weekly_ads_valid_to', 'valid_to'),
    )

class Product(Base):
    __tablename__ = "products"

    id = Column(BigInteger, primary_key=True, server_default=text("nextval('products_id_seq'::regclass)"))
    weekly_ad_id = Column(BigInteger, ForeignKey("weekly_ads.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    price = Column(Numeric(10, 2))
    original_price = Column(Numeric(10, 2), nullable=True)
    unit = Column(String(50))
    description = Column(Text)
    category = Column(String(100))
    promotion_details = Column(Text)
    promotion_from = Column(Date, nullable=True)
    promotion_to = Column(Date, nullable=True)
    gen_terms = Column(Text, nullable=True) # Added for LLM-generated keywords
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    fts_vector = Column(TSVECTOR) # For full-text search
    embedding = Column(Vector(768), nullable=True)
    retailer_id = Column(BigInteger, ForeignKey("retailers.id", ondelete="CASCADE"), nullable=False)
    is_frontpage = Column(Boolean, default=False)
    emoji = Column(String(10), nullable=True)
    retailer = relationship("Retailer")

    weekly_ad = relationship("WeeklyAd", back_populates="products")

    __table_args__ = (
        Index('idx_products_weekly_ad_id', 'weekly_ad_id'),
        Index('idx_products_name', 'name'),
        Index('idx_products_category', 'category'),
        Index('idx_products_fts', 'fts_vector', postgresql_using='gin'),
    ) 