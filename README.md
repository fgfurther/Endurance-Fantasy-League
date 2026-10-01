# 🏆 Endurance Fantasy League

> **Преврати свои тренировки в увлекательную игру.**  
> Геймифицированная платформа для спортсменов на выносливость, которая превращает данные из Strava, Garmin и Wahoo в систему прогрессии, уровни и соревнования.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker)

---

## 🚀 О проекте ![сайт](https://endurance-fantasy-league.vercel.app/)

Спортсмены накапливают тысячи километров, но часто теряют мотивацию из-за рутины. **Endurance Fantasy League** решает эту проблему, добавляя RPG-механики к реальным тренировочным данным. 

Платформа автоматически забирает данные через **Intervals.icu API**, анализирует тренировочную нагрузку (Training Load) и интенсивность (Intensity Factor), и конвертирует их в справедливую систему опыта (XP).

---

## ✨ Ключевые возможности (MVP v1.0)

- 🔄 **Бесшовная синхронизация:** Поддержка данных из Strava, Garmin, Wahoo и других источников через агрегатор Intervals.icu.
- 🧠 **Умный расчет XP:** Опыт начисляется не просто за километры, а с учетом реальной физиологической нагрузки и интенсивности тренировки.
- 📊 **Интерактивный дашборд:** Красивый UI с темной темой, анимациями и детальными tooltip-подсказками при наведении на каждую тренировку.
- 🏆 **Система уровней:** Прогрессия персонажа на основе накопленного опыта.
- 🛡️ **Безопасность:** Архитектура с разделением на Frontend и Backend, использование переменных окружения для защиты API-ключей.

---

## 🧮 "Секретный соус": Формула геймификации

Система поощряет **качество** тренировок, а не только их количество. 

1. **Базовый XP:** `Training Load × 1.5`
2. **Множитель интенсивности (IF):** Ограничен диапазоном `0.5x` (восстановление) – `2.0x` (максимальная нагрузка).
3. **Итоговый XP:** `Базовый XP × Множитель интенсивности`
4. **Уровень атлета:** `Level = floor(sqrt(Total XP / 100)) + 1`

*Пример: Легкая 2-часовая поездка (IF 0.6) даст меньше XP, чем часовая жесткая интервальная работа (IF 1.2).*

---

## 🛠 Технологический стек

| Категория | Технологии |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy, Pydantic, HTTPX |
| **База данных** | PostgreSQL 16, Redis (для кэширования) |
| **DevOps** | Docker, Docker Compose |
| **Внешние API** | Intervals.icu (агрегатор данных о тренировках) |

---

## 🚀 Быстрый старт (Локальная разработка)

### 1. Клонируйте репозиторий
```bash
git clone https://github.com/fgfurther/Endurance-Fantasy-League.git
cd Endurance-Fantasy-League
