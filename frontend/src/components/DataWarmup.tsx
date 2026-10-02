"use client";
import { useEffect } from "react";
import { warmup } from "@/lib/apiCache";
export default function DataWarmup() {
  useEffect(() => { warmup(); }, []);
  return null;
}