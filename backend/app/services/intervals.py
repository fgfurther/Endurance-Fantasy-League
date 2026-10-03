"""Intervals.icu API client — per-user with fallback to global settings."""
import csv
import io
import httpx
from datetime import datetime, timedelta
from typing import Optional
from ..config import get_settings

settings = get_settings()

SPORT_XP_MULTIPLIERS = {
    "RIDE": 3.0,
    "RUN": 10.0,
    "SWIM": 25.0,
    "HIKE": 5.0,
    "WALK": 2.0,
    "WORKOUT": 4.0,
    "ROWING": 8.0,
    "CROSSFIT": 5.0,
    "SKATEBOARD": 5.0,
}


def calculate_xp(sport_type: str, distance_m: float, elevation_m: float, moving_time_s: int) -> float:
    distance_km = distance_m / 1000.0
    moving_time_min = moving_time_s / 60.0
    multiplier = SPORT_XP_MULTIPLIERS.get(str(sport_type).upper(), 2.0)
    xp = (distance_km * multiplier) + (elevation_m * 0.1) + (moving_time_min * 0.5)
    return round(xp, 2)


def sleep_multiplier(sleep_secs: float | int | None) -> float:
    """0ч → 0.5 | 8ч → 1.5 | 12ч+ → 2.0"""
    if not sleep_secs or sleep_secs <= 0:
        return 1.0
    hours = float(sleep_secs) / 3600.0
    mult = 0.5 + (hours / 8.0) * 1.0
    return round(max(0.5, min(2.0, mult)), 2)


def _resolve_creds(api_key: str | None, athlete_id: str | None) -> tuple[str, str]:
    """Возвращает (api_key, athlete_id), используя fallback на глобальные settings."""
    key = api_key or settings.INTERVALS_API_KEY
    aid = athlete_id or settings.INTERVALS_ATHLETE_ID or "0"
    if not key:
        raise ValueError("Intervals API key не задан")
    return key, aid


def _auth_for(api_key: str) -> httpx.BasicAuth:
    """Intervals.icu авторизуется BasicAuth: username=API_KEY, password=сам_ключ."""
    return httpx.BasicAuth(username="API_KEY", password=api_key)


# ═══════════════════════════════════════════════════════════════
# Per-user функции (основные)
# ═══════════════════════════════════════════════════════════════

async def fetch_activities_for_user(
    api_key: str,
    athlete_id: str,
    oldest: Optional[str] = None,
    newest: Optional[str] = None,
    limit: int = 200,
) -> list[dict]:
    """Тянет активности конкретного юзера его ключом (JSON API)."""
    if not oldest:
        oldest = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
    if not newest:
        newest = datetime.now().strftime("%Y-%m-%d")

    url = f"{settings.INTERVALS_API_URL}/athlete/{athlete_id}/activities"
    params = {"oldest": oldest, "newest": newest, "limit": limit}
    headers = {"Accept": "application/json", "User-Agent": "FantasyLeagueApp/2.0"}

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url, auth=_auth_for(api_key), headers=headers, params=params, timeout=30.0
        )

        if response.status_code == 401:
            raise PermissionError("Неверный API-ключ Intervals.icu — привяжи заново в профиле")
        if response.status_code == 404:
            raise ValueError(f"Athlete ID '{athlete_id}' не найден в Intervals.icu")
        if response.status_code >= 400:
            print(f"❌ ОШИБКА API activities: {response.status_code}")
            print(f"📄 {response.text[:500]}")
            return []

        data = response.json()
        if isinstance(data, list):
            activities = data
        elif isinstance(data, dict) and "data" in data:
            activities = data["data"]
        else:
            activities = []

        print(f"✅ [{athlete_id}] Получено {len(activities)} активностей ({oldest} → {newest})")
        return activities


async def fetch_wellness_for_user(
    api_key: str,
    athlete_id: str,
    oldest: Optional[str] = None,
    newest: Optional[str] = None,
) -> list[dict]:
    """Сон, HRV, resting HR для конкретного юзера."""
    if not oldest:
        oldest = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    if not newest:
        newest = datetime.now().strftime("%Y-%m-%d")

    url = f"{settings.INTERVALS_API_URL}/athlete/{athlete_id}/wellness"
    params = {"oldest": oldest, "newest": newest}
    headers = {"Accept": "application/json", "User-Agent": "FantasyLeagueApp/2.0"}

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url, auth=_auth_for(api_key), headers=headers, params=params, timeout=20.0
        )
        if response.status_code >= 400:
            print(f"⚠️ Wellness for {athlete_id}: HTTP {response.status_code}")
            return []
        data = response.json()
        if isinstance(data, list):
            return data
        if isinstance(data, dict) and "data" in data:
            return data["data"]
        return []


async def validate_credentials(api_key: str, athlete_id: str) -> dict | None:
    """
    Проверяет валидность связки ключ + athlete_id.
    Возвращает данные атлета или None.
    Используется при подключении ключа в профиле.
    """
    url = f"{settings.INTERVALS_API_URL}/athlete/{athlete_id}"
    headers = {"Accept": "application/json", "User-Agent": "FantasyLeagueApp/2.0"}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                url, auth=_auth_for(api_key), headers=headers, timeout=15.0
            )
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"⚠️ validate_credentials error: {e}")
            return None


# ═══════════════════════════════════════════════════════════════
# Legacy-обёртки (для обратной совместимости со старым sync.py)
# Используют глобальные settings. НЕ рекомендую для production.
# ═══════════════════════════════════════════════════════════════

async def fetch_athlete_activities(
    oldest: Optional[str] = None,
    newest: Optional[str] = None,
    limit: int = 200,
) -> list[dict]:
    """Legacy: использует глобальные credentials."""
    try:
        key, aid = _resolve_creds(None, None)
        return await fetch_activities_for_user(key, aid, oldest=oldest, newest=newest, limit=limit)
    except ValueError as e:
        print(f"⚠️ fetch_athlete_activities: {e}")
        return []


async def fetch_athlete_activities_csv(
    oldest: Optional[str] = None,
) -> list[dict]:
    """Fallback на CSV (legacy)."""
    if not oldest:
        oldest = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")

    try:
        key, _ = _resolve_creds(None, None)
    except ValueError:
        return []

    # CSV endpoint в Intervals требует athlete_id в URL
    athlete_id = settings.INTERVALS_ATHLETE_ID or "0"
    url = f"{settings.INTERVALS_API_URL}/athlete/{athlete_id}/activities.csv"
    params = {"oldest": oldest}
    headers = {"Accept": "text/csv", "User-Agent": "FantasyLeagueApp/2.0"}

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url, auth=_auth_for(key), headers=headers, params=params, timeout=30.0
        )
        if response.status_code >= 400:
            print(f"❌ CSV error: {response.status_code}")
            return []

        csv_content = response.text
        if csv_content.startswith("\ufeff"):
            csv_content = csv_content[1:]

        reader = csv.DictReader(io.StringIO(csv_content))
        activities = list(reader)
        print(f"✅ CSV: {len(activities)} активностей")
        return activities


async def fetch_activity_detail(activity_id: str, api_key: str | None = None) -> dict | None:
    """Полные данные одной активности."""
    try:
        key, _ = _resolve_creds(api_key, None)
    except ValueError:
        return None

    url = f"{settings.INTERVALS_API_URL}/activity/{activity_id}"
    headers = {"Accept": "application/json", "User-Agent": "FantasyLeagueApp/2.0"}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, auth=_auth_for(key), headers=headers, timeout=15.0)
        if response.status_code >= 400:
            print(f"⚠️ detail {activity_id}: HTTP {response.status_code}")
            return None
        data = response.json()
        return data if isinstance(data, dict) else None


async def fetch_wellness(
    oldest: Optional[str] = None,
    newest: Optional[str] = None,
) -> list[dict]:
    """Legacy: использует глобальные credentials."""
    try:
        key, aid = _resolve_creds(None, None)
        return await fetch_wellness_for_user(key, aid, oldest=oldest, newest=newest)
    except ValueError as e:
        print(f"⚠️ fetch_wellness: {e}")
        return []