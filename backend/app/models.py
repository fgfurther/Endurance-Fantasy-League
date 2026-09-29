from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    intervals_id = Column(String, unique=True, index=True, nullable=False)  # например "i12345"
    email = Column(String, unique=True, index=True)
    firstname = Column(String)
    lastname = Column(String)
    profile_picture = Column(String)
    
    # API key (в продакшене шифровать!)
    api_key = Column(String)
    
    # Game data
    total_xp = Column(Float, default=0)
    level = Column(Integer, default=1)
    
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    activities = relationship("Activity", back_populates="user")
    
    __table_args__ = (
        Index('idx_users_total_xp', 'total_xp'),
    )


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    intervals_activity_id = Column(String, unique=True, index=True, nullable=False)

    sleep_multiplier = Column(Float, default=1.0)  # множитель от продолжительности сна
    sleep_secs = Column(Integer, nullable=True)    # сколько спали в эту ночь (для UI)
    
    # Activity data (из Intervals.icu)
    name = Column(String)
    sport_type = Column(String)  # RIDE, RUN, SWIM, etc.
    distance = Column(Float)  # meters
    moving_time = Column(Integer)  # seconds
    elapsed_time = Column(Integer)  # seconds
    elevation_gain = Column(Float)  # meters
    
    # Средняя/макс мощность и пульс
    average_speed = Column(Float)  # m/s
    max_speed = Column(Float)  # m/s
    average_heartrate = Column(Float)  # bpm
    max_heartrate = Column(Float)  # bpm
    average_watts = Column(Float)  # мощность (для вело)
    normalized_power = Column(Float)  # NP (для вело)
    
    # Тренировочная нагрузка (из Intervals)
    training_load = Column(Float)  # TRIMP / TSS
    intensity = Column(Float)  # IF (Intensity Factor)
    
    # Calculated game data (ВСЁ ДОЛЖНО БЫТЬ ЗДЕСЬ!)
    xp_earned = Column(Float, default=0)
    base_xp = Column(Float, default=0)  # <-- ПЕРЕНЕСЛИ СЮДА
    intensity_multiplier = Column(Float, default=1.0)  # <-- ПЕРЕНЕСЛИ СЮДА
    
    start_date = Column(DateTime)
    start_date_local = Column(DateTime)
    
    # Indoor/outdoor
    indoor = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="activities")
    
    __table_args__ = (
        Index('idx_activities_user_date', 'user_id', 'start_date'),
        Index('idx_activities_intervals_id', 'intervals_activity_id'),
    )



class Wellness(Base):
    __tablename__ = "wellness"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(String, nullable=False, index=True)  # YYYY-MM-DD из Intervals (поле id)

    sleep_secs = Column(Integer, nullable=True)
    sleep_score = Column(Float, nullable=True)
    sleep_quality = Column(Integer, nullable=True)
    avg_sleeping_hr = Column(Float, nullable=True)
    resting_hr = Column(Integer, nullable=True)
    hrv = Column(Float, nullable=True)
    fatigue = Column(Integer, nullable=True)
    soreness = Column(Integer, nullable=True)
    stress = Column(Integer, nullable=True)
    mood = Column(Integer, nullable=True)
    readiness = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)
    ctl = Column(Float, nullable=True)
    atl = Column(Float, nullable=True)

    # XP за сон (если начисляем)
    sleep_xp = Column(Float, default=0.0)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="wellness_records")

    __table_args__ = (
        Index("idx_wellness_user_date", "user_id", "date", unique=True),
    )