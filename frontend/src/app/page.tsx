"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Trophy, Users, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen gradient-bg">
      <div className="container mx-auto px-3 py-12 sm:px-4 sm:py-16 md:py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6 md:space-y-8"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block"
            >
              <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-500/20 border border-indigo-500/50 rounded-full text-indigo-300 text-xs sm:text-sm font-medium">
                🎮 Геймификация спорта
              </span>
            </motion.div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Fantasy League
            </h1>
            
            <p className="text-xl md:text-3xl text-gray-300 font-light">
              для спортсменов на выносливость
            </p>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Преврати свои тренировки в увлекательную игру. 
            Получай XP, соревнуйся с друзьями, достигай новых уровней.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link href="/dashboard">
              <button className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-base sm:text-lg rounded-xl transition-all duration-300 transform hover:scale-105 animate-pulse-glow cursor-pointer">
                Синхронизируй данные
              </button>
            </Link>
            <p className="text-xs sm:text-sm text-gray-500 mt-4">
              Бесплатно • Без рекламы • Без спама
            </p>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mt-12 md:mt-20"
        >
          {[
            {
              icon: Zap,
              title: "Зарабатывай XP",
              description: "Каждая тренировка приносит опыт и приближает к новому уровню",
              color: "from-yellow-500 to-orange-500"
            },
            {
              icon: Trophy,
              title: "Глобальный рейтинг",
              description: "Соревнуйся с тысячами атлетов со всего мира",
              color: "from-indigo-500 to-purple-500"
            },
            {
              icon: Users,
              title: "Сражайся с друзьями",
              description: "Создавай приватные лиги и выясни, кто круче",
              color: "from-green-500 to-emerald-500"
            },
            {
              icon: TrendingUp,
              title: "Отслеживай прогресс",
              description: "Детальная аналитика формы, усталости и восстановления",
              color: "from-pink-500 to-rose-500"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-6 hover:bg-white/10 transition-all duration-300"
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 md:mb-4`}>
                <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-12 md:mt-20 text-center"
        >
          <div className="grid grid-cols-3 gap-2 md:gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-2xl sm:text-4xl font-bold text-indigo-400">1000+</div>
              <div className="text-gray-400 text-xs sm:text-sm mt-2">Атлетов</div>
            </div>
            <div>
              <div className="text-2xl sm:text-4xl font-bold text-purple-400">50K+</div>
              <div className="text-gray-400 text-xs sm:text-sm mt-2">Тренировок</div>
            </div>
            <div>
              <div className="text-2xl sm:text-4xl font-bold text-pink-400">1M+</div>
              <div className="text-gray-400 text-xs sm:text-sm mt-2">Километров</div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}