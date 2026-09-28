import csv
import io
import httpx
from datetime import datetime, timedelta
from ..config import get_settings

settings = get_settings()

# Множители XP для разных видов спорта
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
    """Расчет XP на основе формулы геймификации"""
    distance_km = distance_m / 1000.0
    moving_time_min = moving_time_s / 60.0
    
    multiplier = SPORT_XP_MULTIPLIERS.get(str(sport_type).upper(), 2.0)
    
    xp = (distance_km * multiplier) + (elevation_m * 0.1) + (moving_time_min * 0.5)
    return round(xp, 2)

async def fetch_athlete_activities():
    """Получает активности из Intervals.icu через CSV endpoint"""
    
    url = f"{settings.INTERVALS_API_URL}/athlete/0/activities.csv"
    
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    params = {
        "oldest": thirty_days_ago.strftime("%Y-%m-%d")
    }
    
    auth = httpx.BasicAuth(username="API_KEY", password=settings.INTERVALS_API_KEY)
    
    headers = {
        "Accept": "text/csv",
        "User-Agent": "FantasyLeagueApp/1.0"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, auth=auth, headers=headers, params=params, timeout=15.0)
        
        if response.status_code >= 400:
            print(f"❌ ОШИБКА API: {response.status_code}")
            print(f"📄 Ответ сервера: {response.text}")
            return []
        
        # ВАЖНО: используем utf-8-sig для удаления BOM-символа
        csv_content = response.text
        
        # Проверяем и удаляем BOM если есть
        if csv_content.startswith('\ufeff'):
            csv_content = csv_content[1:]
        
        reader = csv.DictReader(io.StringIO(csv_content))
        
        activities = []
        for row in reader:
            activities.append(row)
        
        print(f"✅ Получено {len(activities)} активностей из CSV")
        return activities