from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str
    
    # Intervals.icu
    INTERVALS_API_KEY: str
    INTERVALS_ATHLETE_ID: str
    INTERVALS_API_URL: str = "https://intervals.icu/api/v1"
    
    # App
    SECRET_KEY: str
    
    # Конфигурация для правильной работы с .env файлом
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8-sig',  # КЛЮЧЕВОЕ ИЗМЕНЕНИЕ
        extra='ignore',
        case_sensitive=False
    )


@lru_cache()
def get_settings():
    return Settings()