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
          <p style={{ color: "var(--color-muted)", fontSize: "0.85rem" }}>
            <Link href="/admin">← Volver</Link> · slug: {product.slug}
          </p>
        </div>
        <form action={deleteProductAction}>
          <input type="hidden" name="id" value={product.id} />
          <button
            type="submit"
            className={`${styles.btn} ${styles.btnDanger}`}
            formNoValidate
          >
            Eliminar producto
          </button>
        </form>
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
          <span>Costo USD</span>
          <input
            type="number"
            name="costUSD"
            step="0.01"
            defaultValue={product.costUSD}
            required
          />
        </label>

        <label>
          <span>Margen</span>
          <input
            type="number"
            name="marginPct"
            step="0.05"
            defaultValue={product.marginPct}
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
          <button type="submit" className={styles.btn}>
            Guardar cambios
          </button>
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
          <button type="submit" className={styles.btn}>+ Agregar</button>
        </form>

        {product.variants.length === 0 ? (
          <p className={styles.empty}>Sin variantes</p>
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
                      <button type="submit" className={`${styles.btn} ${styles.btnGhost}`}>
                        Guardar
                      </button>
                    </form>
                  </td>
                  <td>
                    <form action={deleteVariantAction}>
                      <input type="hidden" name="id" value={v.id} />
                      <input type="hidden" name="productId" value={product.id} />
                      <button
                        type="submit"
                        className={`${styles.btn} ${styles.btnDanger}`}
                      >
                        Eliminar
                      </button>
                    </form>
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

        <form
          action={uploadImageAction}
          className={styles.inlineForm}
          encType="multipart/form-data"
        >
          <input type="hidden" name="productId" value={product.id} />
          <input type="file" name="file" accept="image/*" required />
          <input type="text" name="color" placeholder="Color (opcional)" />
          <button type="submit" className={styles.btn}>Subir</button>
        </form>

        {product.images.length === 0 ? (
          <p className={styles.empty}>Sin imágenes</p>
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
                  <button type="submit" className={`${styles.btn} ${styles.btnGhost}`}>
                    Guardar
                  </button>
                </form>
                <form action={deleteImageAction}>
                  <input type="hidden" name="id" value={img.id} />
                  <input type="hidden" name="productId" value={product.id} />
                  <button
                    type="submit"
                    className={`${styles.btn} ${styles.btnDanger}`}
                    style={{ width: "100%" }}
                  >
                    Eliminar
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
