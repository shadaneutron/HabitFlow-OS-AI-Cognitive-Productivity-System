import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# Switch to SQLite since Docker is unavailable locally
SQLALCHEMY_DATABASE_URL = "sqlite:///./habitflow.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Auto-migration: Ensure columns exist
try:
    with engine.begin() as conn:
        # Check table columns in SQLite for notes
        cursor = conn.execute(text("PRAGMA table_info(notes);"))
        columns = [row[1] for row in cursor.fetchall()]
        if columns and "embedding" not in columns:
            conn.execute(text("ALTER TABLE notes ADD COLUMN embedding TEXT;"))
            print("Migration: Added 'embedding' column to 'notes' table successfully.")
            
        # Check table columns in SQLite for users
        cursor_u = conn.execute(text("PRAGMA table_info(users);"))
        columns_u = [row[1] for row in cursor_u.fetchall()]
        if columns_u and "user_name" not in columns_u:
            conn.execute(text("ALTER TABLE users ADD COLUMN user_name TEXT DEFAULT 'User';"))
            print("Migration: Added 'user_name' column to 'users' table successfully.")
            
        # Check table columns in SQLite for brain_dumps
        cursor_bd = conn.execute(text("PRAGMA table_info(brain_dumps);"))
        columns_bd = [row[1] for row in cursor_bd.fetchall()]
        if columns_bd:
            if "is_archived" not in columns_bd:
                conn.execute(text("ALTER TABLE brain_dumps ADD COLUMN is_archived BOOLEAN DEFAULT 0;"))
                print("Migration: Added 'is_archived' column to 'brain_dumps' table successfully.")
            if "is_pinned" not in columns_bd:
                conn.execute(text("ALTER TABLE brain_dumps ADD COLUMN is_pinned BOOLEAN DEFAULT 0;"))
                print("Migration: Added 'is_pinned' column to 'brain_dumps' table successfully.")
except Exception as e:
    print(f"Migration note: {e}")

Base = declarative_base()

# Dependency for FastAPI to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
