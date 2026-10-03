"""Одноразовый скрипт: новые поля в users + таблица friendships."""
import os
os.environ.setdefault("PGCLIENTENCODING", "UTF8")

from sqlalchemy import text
from app.database import engine, Base, SessionLocal
from app.models import User, Friendship  # noqa: F401 — чтобы create_all увидел таблицы
from app.auth import hash_password

# Создаёт отсутствующие таблицы (friendships)
Base.metadata.create_all(bind=engine)

# ── ФАЗА 1: DDL-изменения (отдельная транзакция, сразу коммитится) ──
with engine.begin() as conn:
    cols = [
        row[0]
        for row in conn.execute(text(
            "SELECT column_name FROM information_schema.columns WHERE table_name='users'"
        ))
    ]

    if "username" not in cols:
        conn.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR(64)"))
    if "password_hash" not in cols:
        conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)"))
    if "display_name" not in cols:
        conn.execute(text("ALTER TABLE users ADD COLUMN display_name VARCHAR(100)"))
    if "api_key_encrypted" not in cols:
        conn.execute(text("ALTER TABLE users ADD COLUMN api_key_encrypted VARCHAR(500)"))

    conn.execute(text("ALTER TABLE users ALTER COLUMN intervals_id DROP NOT NULL"))

print("✅ Фаза 1: колонки добавлены")

# ── ФАЗА 2: миграция данных (после коммита DDL — блокировок больше нет) ──
db = SessionLocal()
try:
    migrated = 0
    for u in db.query(User).all():
        changed = False
        if not u.username:
            u.username = (u.intervals_id or f"user_{u.id}").lower()
            changed = True
        if not u.password_hash:
            u.password_hash = hash_password("demo123")  # временный пароль
            changed = True
        if not u.display_name:
            u.display_name = (
                f"{u.firstname or 'Athlete'} {u.lastname or ''}".strip() or u.username
            )
            changed = True
        if changed:
            migrated += 1
    db.commit()
    print(f"✅ Фаза 2: мигрировано пользователей: {migrated}")
finally:
    db.close()

# ── ФАЗА 3: индексы (после данных, чтобы unique собрался корректно) ──
with engine.begin() as conn:
    conn.execute(text(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)"
    ))

print("✅ Миграция завершена. Запускай сервер!")