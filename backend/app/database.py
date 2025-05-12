import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file in the backend directory

'''
Purpose: Handles the connection to your PostgreSQL database using SQLAlchemy, the Object-Relational Mapper (ORM). 
It reads the DATABASE_URL from the environment (.env file), creates the SQLAlchemy engine (the core interface to the database), 
and sets up a session factory (SessionLocal) for managing database transactions. 
The get_db function is a FastAPI dependency used to provide a database session to your API endpoint functions.

Reasoning: Centralizes database connection logic in one place, making it easier to manage and configure. 
Using SQLAlchemy provides a Pythonic way to interact with the database instead of writing raw SQL everywhere. 
The session management pattern ensures database connections are handled efficiently and correctly within the context of web requests.
'''

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set.")

# Create synchronous engine
engine = create_engine(DATABASE_URL)

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy models
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# print(f"Database URL: {DATABASE_URL[:]}...")
