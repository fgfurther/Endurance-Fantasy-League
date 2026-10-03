"""Очистка таблицы users (и связанных activities/wellness)."""
import os
os.environ.setdefault("PGCLIENTENCODING", "UTF8")

from sqlalchemy import text
from app.database import engine

with engine.begin() as conn:
    conn.execute(text("TRUNCATE users CASCADE"))

print("✅ Таблица users очищена (включая activities и wellness)")