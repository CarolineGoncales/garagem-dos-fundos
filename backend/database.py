
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Banco local para desenvolvimento
if not DATABASE_URL:
    BASE_DIR = Path(__file__).resolve().parent
    DATABASE_URL = f"sqlite:///{BASE_DIR / 'garagem.db'}"

# Compatibilidade com URLs do Render
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgres://",
        "postgresql://",
        1
    )

if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://",
        "postgresql+psycopg2://",
        1
    )

connect_args = {}

engine_options = {
    "pool_pre_ping": True
}

if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine_options["connect_args"] = connect_args

elif DATABASE_URL.startswith("postgresql"):
    engine_options["connect_args"] = {
        "options": "-csearch_path=garagem,public"
    }

engine = create_engine(
    DATABASE_URL,
    **engine_options
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
