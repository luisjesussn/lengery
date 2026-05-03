import type { Product, Image, Variant } from "@prisma/client";

export type ProductWithRelations = Product & {
  images: Image[];
  variants: Variant[];
};

export type Currency = "USD" | "ARS";
