import { notFound } from "next/navigation";
import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";
import { prisma } from "@/lib/db";
import styles from "./detail.module.css";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: `${product.name} — Intima`,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: true,
    },
  });

  if (!product || !product.active) notFound();

  return (
    <div className={`container ${styles.layout}`}>
      <ProductGallery images={product.images} alt={product.name} />
      <ProductInfo product={product} />
    </div>
  );
}
