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


def _auth():
    return httpx.BasicAuth(username="API_KEY", password=settings.INTERVALS_API_KEY)


def sleep_multiplier(sleep_secs: float | int | None) -> float:
    """
    0ч → 0.5 | 8ч → 1.5 | 12ч+ → 2.0
    """
    if not sleep_secs or sleep_secs <= 0:
        return 1.0  # нет данных о сне — без штрафа/бонуса
    hours = float(sleep_secs) / 3600.0
    mult = 0.5 + (hours / 8.0) * 1.0
    return round(max(0.5, min(2.0, mult)), 2)


async def fetch_athlete_activities(
    oldest: Optional[str] = None,
    newest: Optional[str] = None,
    limit: int = 200,
) -> list[dict]:
    """
    Тянет активности через JSON API (надёжнее CSV).
    oldest/newest — YYYY-MM-DD. По умолчанию — последние 90 дней.
    """
    if not oldest:
        oldest = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
    if not newest:
        newest = datetime.now().strftime("%Y-%m-%d")

    athlete_id = settings.INTERVALS_ATHLETE_ID or "0"
    url = f"{settings.INTERVALS_API_URL}/athlete/{athlete_id}/activities"

    params = {
        "oldest": oldest,
        "newest": newest,
        "limit": limit,
    }

    headers = {"Accept": "application/json", "User-Agent": "FantasyLeagueApp/1.0"}

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url, auth=_auth(), headers=headers, params=params, timeout=30.0
        )

        if response.status_code >= 400:
            print(f"❌ ОШИБКА API activities: {response.status_code}")
            print(f"📄 {response.text[:500]}")
            return []

        data = response.json()
        # API иногда возвращает list, иногда объект
        if isinstance(data, list):
            activities = data
        elif isinstance(data, dict) and "data" in data:
            activities = data["data"]
        else:
            activities = []

        print(f"✅ Получено {len(activities)} активностей (JSON, {oldest} → {newest})")
        return activities


async def fetch_athlete_activities_csv(
    oldest: Optional[str] = None,
) -> list[dict]:
    """Fallback на CSV, если JSON недоступен."""
    if not oldest:
        oldest = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")

    url = f"{settings.INTERVALS_API_URL}/athlete/0/activities.csv"
    params = {"oldest": oldest}
    headers = {"Accept": "text/csv", "User-Agent": "FantasyLeagueApp/1.0"}

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url, auth=_auth(), headers=headers, params=params, timeout=30.0
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


async def fetch_activity_detail(activity_id: str) -> dict | None:
    """Полные данные одной активности. Для Strava-источников часто всё равно пусто."""
    url = f"{settings.INTERVALS_API_URL}/activity/{activity_id}"
    headers = {"Accept": "application/json", "User-Agent": "FantasyLeagueApp/1.0"}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, auth=_auth(), headers=headers, timeout=15.0)
        if response.status_code >= 400:
            print(f"⚠️ detail {activity_id}: HTTP {response.status_code}")
            return None
        data = response.json()
        return data if isinstance(data, dict) else None


async def fetch_wellness(
    oldest: Optional[str] = None,
    newest: Optional[str] = None,
) -> list[dict]:
    """Сон, HRV, resting HR, fatigue и т.д."""
    if not oldest:
        oldest = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    if not newest:
        newest = datetime.now().strftime("%Y-%m-%d")

    athlete_id = settings.INTERVALS_ATHLETE_ID or "0"
    url = f"{settings.INTERVALS_API_URL}/athlete/{athlete_id}/wellness"

    params = {"oldest": oldest, "newest": newest}
    headers = {"Accept": "application/json", "User-Agent": "FantasyLeagueApp/1.0"}

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url, auth=_auth(), headers=headers, params=params, timeout=20.0
        )
        if response.status_code >= 400:
            print(f"❌ Wellness error: {response.status_code} {response.text[:300]}")
            return []

        data = response.json()
        if isinstance(data, list):
            return data
        if isinstance(data, dict) and "data" in data:
            return data["data"]
        return []