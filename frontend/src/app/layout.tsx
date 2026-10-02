import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import DataWarmup from "@/components/DataWarmup";
import DreamDust from "@/components/DreamDust";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fantasy League - Преврати тренировки в игру",
  description: "Геймифицированная платформа для спортсменов на выносливость",
};

// ... импорты
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      {/* ВАЖНО: body НЕ должен иметь bg-gradient, только базовый цвет или transparent */}
      <body className={`${inter.className} bg-[#171a38] text-white antialiased`}> 
        <Header />
        <DreamDust />
        <DataWarmup />
        {/* PageTransition оборачивает только children (контент страниц), а не Header */}
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}