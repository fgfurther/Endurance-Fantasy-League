import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..dependencies import get_current_user
from ..auth import encrypt_secret, decrypt_secret
from ..config import get_settings

router = APIRouter(prefix="/api/intervals", tags=["Intervals"])
settings = get_settings()


class KeyIn(BaseModel):
    api_key: str = Field(..., min_length=5)
    athlete_id: str = Field(..., min_length=2)


class KeyStatus(BaseModel):
    has_key: bool
    athlete_id: str | None
    last_validated_at: str | None = None


async def _validate_intervals_credentials(api_key: str, athlete_id: str) -> dict | None:
    """Используем централизованную функцию из services."""
    from ..services.intervals import validate_credentials
    return await validate_credentials(api_key, athlete_id)


@router.get("/status", response_model=KeyStatus)
def key_status(current: User = Depends(get_current_user)):
    return KeyStatus(
        has_key=bool(current.api_key_encrypted),
        athlete_id=current.intervals_id,
    )


@router.post("/connect")
async def connect_key(
    data: KeyIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Проверяем, что athlete_id не занят другим юзером
    conflict = (
        db.query(User)
        .filter(User.intervals_id == data.athlete_id, User.id != current.id)
        .first()
    )
    if conflict:
        raise HTTPException(
            status_code=409,
            detail=f"Этот athlete_id уже привязан к другому аккаунту",
        )
    
    # Валидация ключа через Intervals API
    info = await _validate_intervals_credentials(data.api_key, data.athlete_id)
    if info is None:
        raise HTTPException(
            status_code=400,
            detail="Неверный API-ключ или athlete_id. Проверь в Intervals.icu → Settings → API",
        )
    
    # Сохраняем (шифруем ключ)
    current.intervals_id = data.athlete_id
    current.api_key_encrypted = encrypt_secret(data.api_key)
    
    # Имя из Intervals (если есть)
    fn = info.get("firstName") or info.get("first_name")
    ln = info.get("lastName") or info.get("last_name")
    if fn:
        current.firstname = fn
    if ln:
        current.lastname = ln
    
    db.commit()
    db.refresh(current)
    
    return {
        "message": "Intervals.icu подключён",
        "athlete_id": current.intervals_id,
        "name_from_intervals": f"{fn or ''} {ln or ''}".strip() or None,
    }


@router.delete("/disconnect")
def disconnect_key(
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current.intervals_id = None
    current.api_key_encrypted = None
    db.commit()
    return {"message": "Intervals отвязан"}


def get_decrypted_intervals_creds(user: User) -> tuple[str, str] | None:
    """Вспомогательная функция для других роутеров: возвращает (api_key, athlete_id)."""
    if not user.api_key_encrypted or not user.intervals_id:
        return None
    try:
        return decrypt_secret(user.api_key_encrypted), user.intervals_id
    except Exception:
        return None