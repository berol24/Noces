"use client";

import { createContext, useContext, type ReactNode } from "react";
import { wedding, type WeddingConfig } from "@/wedding.config";

const WeddingContext = createContext<WeddingConfig>(wedding);

export function WeddingProvider({
  value,
  children,
}: {
  value: WeddingConfig;
  children: ReactNode;
}) {
  return <WeddingContext.Provider value={value}>{children}</WeddingContext.Provider>;
}

export function useWedding() {
  return useContext(WeddingContext);
}
