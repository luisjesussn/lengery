import "server-only";
import { cache } from "react";
import { prisma } from "./db";

export const SETTING_KEYS = {
  HEADER_LOGO_URL: "header_logo_url",
  HERO_IMAGE_URL: "hero_image_url",
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

export const getSetting = cache(async (key: SettingKey): Promise<string | null> => {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row?.value ?? null;
});

export async function setSetting(key: SettingKey, value: string): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function deleteSetting(key: SettingKey): Promise<void> {
  await prisma.siteSetting.delete({ where: { key } }).catch(() => {});
}
