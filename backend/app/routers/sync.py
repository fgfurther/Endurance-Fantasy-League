from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Activity
from ..services.intervals import fetch_athlete_activities, calculate_xp
from ..config import get_settings
from datetime import datetime

router = APIRouter(prefix="/api", tags=["Sync"])
settings = get_settings()


@router.post("/sync")
async def sync_activities(db: Session = Depends(get_db)):
    """Синхронизирует тренировки из Intervals.icu и начисляет XP"""
    try:
        activities_data = await fetch_athlete_activities()
        
        if not activities_data:
            return {"message": "Нет активностей для синхронизации", "synced_count": 0}
        
        user = db.query(User).filter(User.intervals_id == settings.INTERVALS_ATHLETE_ID).first()
        if not user:
            user = User(
                intervals_id=settings.INTERVALS_ATHLETE_ID,
                firstname="Demo",
                lastname="Athlete",
                total_xp=0.0,
                level=1
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        new_xp = 0.0
        synced_count = 0
        seen_ids = set()  # <-- НОВОЕ: Множество для отслеживания ID в текущем цикле
        
        for act in activities_data:
            act = {k.replace('\ufeff', ''): v for k, v in act.items()}
            
            act_id = str(act.get('id', '')).strip()
            if not act_id:
                continue
            
            # 1. Проверяем, не обрабатывали ли мы уже этот ID в этом же цикле (защита от дублей в CSV)
            if act_id in seen_ids:
                print(f"⏭️ Пропуск дубликата в CSV: {act_id}")
                continue
            
            # 2. Проверяем, нет ли уже такой активности в БД
            existing = db.query(Activity).filter(Activity.intervals_activity_id == act_id).first()
            if existing:
                continue
            
            # 3. Добавляем ID в обработанные
            seen_ids.add(act_id)
            
            # === ИЗВЛЕЧЕНИЕ ДАННЫХ ===
            sport_type = str(act.get('type', '') or 'WORKOUT').upper()
            act_name = act.get('name', '') or 'Без названия'
            
            distance_str = act.get('distance', '') or '0'
            try: distance_m = float(distance_str)
            except: distance_m = 0.0
            
            moving_time_str = act.get('moving_time', '') or '0'
            try: moving_time_s = int(float(moving_time_str))
            except: moving_time_s = 0
            
            elevation_str = act.get('total_elevation_gain', '') or '0'
            try: elevation_m = float(elevation_str)
            except: elevation_m = 0.0
            
            training_load_str = act.get('icu_training_load', '') or '0'
            try: training_load = float(training_load_str)
            except: training_load = 0.0
            
            # Получаем intensity factor
            intensity_str = act.get('icu_intensity', '') or '0'
            try:
                intensity = float(intensity_str)
                
                # === ИСПРАВЛЕНИЕ: Если значение > 3, значит это проценты (например, 85.0)
                # Делим на 100, чтобы получить нормальный IF (0.85)
                if intensity > 3.0:
                    intensity = intensity / 100.0
                    
            except:
                intensity = 1.0
            
            # Ограничиваем множитель разумными пределами (0.5 - 2.0)
            intensity_multiplier = round(max(0.5, min(2.0, intensity)), 2)
            
            if training_load > 0:
                base_xp = training_load * 1.5
            else:
                base_xp = calculate_xp(sport_type, distance_m, elevation_m, moving_time_s)
            
            xp_earned = round(base_xp * intensity_multiplier, 2)
            base_xp = round(base_xp, 2)
            
            start_date_str = act.get('start_date_local', '') or act.get('start_date', '')
            try:
                start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00')) if start_date_str else datetime.utcnow()
            except Exception:
                start_date = datetime.utcnow()
            
            # Создаем запись
            new_activity = Activity(
                user_id=user.id,
                intervals_activity_id=act_id,
                name=act_name,
                sport_type=sport_type,
                distance=distance_m,
                moving_time=moving_time_s,
                elevation_gain=elevation_m,
                average_heartrate=0,
                xp_earned=xp_earned,
                base_xp=base_xp,
                intensity_multiplier=intensity_multiplier,
                start_date=start_date
            )
            db.add(new_activity)
            new_xp += xp_earned
            synced_count += 1
            
            distance_km = distance_m / 1000 if distance_m > 0 else 0
            print(f"✅ Synced: {act_name} | {sport_type} | {distance_km:.2f}km | {moving_time_s//60}min | TL:{training_load} | IF:{intensity_multiplier:.2f} | Base:{base_xp} | +{xp_earned} XP")
        
        # ВАЖНО: Коммитим все изменения разом
        db.commit()
        
        # Обновляем пользователя
        if new_xp > 0:
            user.total_xp += new_xp
            user.level = int((user.total_xp / 100) ** 0.5) + 1
            db.commit()
            db.refresh(user)
        
        return {
            "message": "Синхронизация успешна!",
            "synced_count": synced_count,
            "new_xp": round(new_xp, 2),
            "user": {
                "id": user.id,
                "name": f"{user.firstname} {user.lastname}",
                "level": user.level,
                "total_xp": round(user.total_xp, 2)
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка синхронизации: {str(e)}")


@router.get("/user")
async def get_user(db: Session = Depends(get_db)):
    """Получает данные текущего пользователя"""
    user = db.query(User).filter(User.intervals_id == settings.INTERVALS_ATHLETE_ID).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден. Сначала выполните POST /api/sync")
    
    # Получаем последние 10 активностей
    activities = db.query(Activity).filter(Activity.user_id == user.id).order_by(Activity.start_date.desc()).limit(10).all()
    
    return {
        "user": {
            "name": f"{user.firstname} {user.lastname}",
            "level": user.level,
            "total_xp": round(user.total_xp, 2),
            "xp_to_next_level": round(((user.level) ** 2) * 100 - user.total_xp, 2)
        },
        "recent_activities": [
            {
                "name": act.name,
                "sport": act.sport_type,
                "distance_km": round(act.distance / 1000, 2) if act.distance else 0,
                "moving_time_min": act.moving_time // 60 if act.moving_time else 0,
                "xp": act.xp_earned,
                "base_xp": act.base_xp if act.base_xp else 0,
                "intensity_multiplier": act.intensity_multiplier if act.intensity_multiplier else 1.0,
                "date": act.start_date.strftime("%d.%m.%Y") if act.start_date else "Неизвестно"
            }
            for act in activities
        ]
    }


@router.get("/debug/csv-sample")
async def debug_csv_sample():
    """Показывает первые 3 активности из CSV для проверки парсинга"""
    try:
        activities = await fetch_athlete_activities()
        if not activities:
            return {"error": "No activities found"}
        
        sample = []
        for act in activities[:3]:
            act = {k.replace('\ufeff', ''): v for k, v in act.items()}
            sample.append({
                "id": act.get('id'),
                "name": act.get('name'),
                "type": act.get('type'),
                "distance": act.get('distance'),
                "moving_time": act.get('moving_time'),
                "icu_training_load": act.get('icu_training_load'),
                "start_date_local": act.get('start_date_local')
            })
        
        return {
            "total_activities": len(activities),
            "sample": sample
        }
    except Exception as e:
        return {"error": str(e)}