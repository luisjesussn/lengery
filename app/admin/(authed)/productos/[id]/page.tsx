import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  updateProductAction,
  deleteProductAction,
  addVariantAction,
  updateVariantAction,
  deleteVariantAction,
  uploadImageAction,
  updateImageAction,
  deleteImageAction,
} from "../../../actions";
import SubmitButton from "@/components/admin/SubmitButton";
import DeleteForm from "@/components/admin/DeleteForm";
import ImageUploadForm from "@/components/admin/ImageUploadForm";
import styles from "../../../admin.module.css";

type Params = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
    },
  });
  if (!product) notFound();

  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>{product.name}</h1>
          <p className={styles.crumb}>
            <Link href="/admin">← Productos</Link>
            <span className={styles.crumbSep}>·</span>
            <span className={styles.crumbMuted}>slug: {product.slug}</span>
          </p>
        </div>
        <DeleteForm
          action={deleteProductAction}
          hidden={{ id: product.id }}
          confirmMessage={`¿Eliminar "${product.name}"? Se borran todas sus variantes e imágenes. Acción irreversible.`}
          pendingLabel="Eliminando..."
        >
          Eliminar producto
        </DeleteForm>
      </header>

      <form action={updateProductAction} className={styles.form}>
        <input type="hidden" name="id" value={product.id} />

        <label className={styles.span2}>
          <span>Nombre</span>
          <input type="text" name="name" defaultValue={product.name} required />
        </label>

        <label>
          <span>Categoría</span>
          <input type="text" name="category" defaultValue={product.category} required />
        </label>

        <label>
          <span>Precio USD</span>
          <input
            type="number"
            name="costUSD"
            step="0.01"
            defaultValue={product.costUSD}
            required
          />
        </label>

        <div className={`${styles.checkboxRow} ${styles.span2}`}>
          <label>
            <input type="checkbox" name="featured" defaultChecked={product.featured} />
            <span>Destacado</span>
          </label>
          <label>
            <input type="checkbox" name="active" defaultChecked={product.active} />
            <span>Activo</span>
          </label>
        </div>

        <label className={styles.span2}>
          <span>Descripción</span>
          <textarea name="description" rows={4} defaultValue={product.description ?? ""} />
        </label>

        <div className={styles.formActions}>
          <SubmitButton pendingLabel="Guardando...">Guardar cambios</SubmitButton>
        </div>
      </form>

      <section className={styles.section}>
        <header className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Variantes ({product.variants.length})</h2>
        </header>

        <form action={addVariantAction} className={styles.inlineForm}>
          <input type="hidden" name="productId" value={product.id} />
          <input type="text" name="size" placeholder="Talle (S, M, 8(L)...)" required />
          <input type="text" name="color" placeholder="Color (opcional)" />
          <input type="number" name="stock" placeholder="Stock" defaultValue="1" min="0" />
          <SubmitButton pendingLabel="Agregando...">+ Agregar</SubmitButton>
        </form>

        {product.variants.length === 0 ? (
          <p className={styles.empty}>Sin variantes. Agregá la primera arriba ↑</p>
        ) : (
          <table className={styles.table} style={{ marginTop: "1rem" }}>
            <thead>
              <tr>
                <th>Talle</th>
                <th>Color</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {product.variants.map((v) => (
                <tr key={v.id}>
                  <td>{v.size}</td>
                  <td>{v.color ?? "—"}</td>
                  <td>
                    <form action={updateVariantAction} className={styles.inlineForm}>
                      <input type="hidden" name="id" value={v.id} />
                      <input type="hidden" name="productId" value={product.id} />
                      <input
                        type="number"
                        name="stock"
                        defaultValue={v.stock}
                        min="0"
                        style={{ width: 80 }}
                      />
                      <SubmitButton variant="ghost" pendingLabel="...">
                        Guardar
                      </SubmitButton>
                    </form>
                  </td>
                  <td>
                    <DeleteForm
                      action={deleteVariantAction}
                      hidden={{ id: v.id, productId: product.id }}
                      confirmMessage={`¿Eliminar variante ${v.size}${v.color ? ` ${v.color}` : ""}?`}
                    >
                      Eliminar
                    </DeleteForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Imágenes ({product.images.length})</h2>
        </header>

        <ImageUploadForm action={uploadImageAction} productId={product.id} />

        {product.images.length === 0 ? (
          <p className={styles.empty}>Sin imágenes. Subí la primera arriba ↑</p>
        ) : (
          <div className={styles.imageGrid}>
            {product.images.map((img) => (
              <div key={img.id} className={styles.imageCard}>
                <img src={img.url} alt={img.alt ?? ""} />
                <form action={updateImageAction} className={styles.inlineForm}>
                  <input type="hidden" name="id" value={img.id} />
                  <input type="hidden" name="productId" value={product.id} />
                  <input
                    type="text"
                    name="color"
                    defaultValue={img.color ?? ""}
                    placeholder="Color"
                  />
                  <input
                    type="number"
                    name="order"
                    defaultValue={img.order}
                    min="0"
                    style={{ width: 60 }}
                  />
                  <SubmitButton variant="ghost" pendingLabel="...">
                    Guardar
                  </SubmitButton>
                </form>
                <DeleteForm
                  action={deleteImageAction}
                  hidden={{ id: img.id, productId: product.id }}
                  confirmMessage="¿Eliminar esta imagen? También se borra del Storage."
                  fullWidth
                >
                  Eliminar
                </DeleteForm>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
