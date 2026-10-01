import os
os.environ.setdefault("PGCLIENTENCODING", "UTF8")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .config import get_settings
from .routers import sync



# Создаем таблицы
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fantasy League for Endurance Athletes",
    description="API для геймифицированной спортивной платформы (Intervals.icu)",
    version="0.1.0"
)

settings = get_settings()

# CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://endurance-fantasy-league.vercel.app",  # ← Твой домен
        "https://vercel.com/ridemachine/endurance-fantasy-league/C1FLpfiyAeP8yGZfDtXFWXgWQsPd",  # ← Превью домен
        # Vercel создаёт уникальные URL для каждого коммита, используем wildcard:
        "https://*.vercel.app",  
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sync.router)

@app.get("/")
async def root():
    return {
        "message": "Fantasy League API is running! ",
        "version": "0.1.0",
        "data_source": "Intervals.icu"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/config-check")
async def config_check():
    """Проверка, что конфиг загрузился"""
    return {
        "api_url": settings.INTERVALS_API_URL,
        "athlete_id": settings.INTERVALS_ATHLETE_ID,
        "has_api_key": bool(settings.INTERVALS_API_KEY)
    }