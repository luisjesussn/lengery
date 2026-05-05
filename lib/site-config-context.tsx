"use client";

import { createContext, useContext, ReactNode } from "react";
import type { SiteConfig } from "./settings";

const SiteConfigContext = createContext<SiteConfig | null>(null);

export function SiteConfigProvider({
  children,
  config,
}: {
  children: ReactNode;
  config: SiteConfig;
}) {
  return (
    <SiteConfigContext.Provider value={config}>{children}</SiteConfigContext.Provider>
  );
}

export function useSiteConfig(): SiteConfig {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) throw new Error("useSiteConfig must be used inside SiteConfigProvider");
  return ctx;
}
