import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

from urllib.parse import urlparse, parse_qs

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Extract search_path if it exists in the URL and clean the URL
connect_args = {}
if SQLALCHEMY_DATABASE_URL:
    parsed = urlparse(SQLALCHEMY_DATABASE_URL)
    query_params = parse_qs(parsed.query)
    
    if "search_path" in query_params:
        connect_args["options"] = f"-c search_path={query_params['search_path'][0]}"
        
        # Reconstruct the URL without search_path
        new_query = "&".join([f"{k}={v[0]}" for k, v in query_params.items() if k != "search_path"])
        new_url_parts = list(parsed)
        new_url_parts[4] = new_query # Update query part
        SQLALCHEMY_DATABASE_URL = parsed._replace(query=new_query).geturl()

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
