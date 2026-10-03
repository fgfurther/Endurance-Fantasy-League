from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db, engine

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.post("/reset-db")
def reset_database(db: Session = Depends(get_db)):
    """Одноразовая очистка таблицы users (и связанных данных). Удали этот роутер после использования!"""
    try:
        with engine.begin() as conn:
            conn.execute(text("TRUNCATE users CASCADE"))
        return {"message": "✅ Таблица users очищена"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))