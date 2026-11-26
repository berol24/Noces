"use client";

import { useEffect } from "react";
import { wedding } from "@/wedding.config";
import { applyTheme } from "@/lib/theme";

export function ThemeSync() {
  useEffect(() => {
    if (!wedding.showThemePicker) return;
    const saved = sessionStorage.getItem("noces-theme");
    if (saved) applyTheme(saved);
  }, []);

  return null;
}
