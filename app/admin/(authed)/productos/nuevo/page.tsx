import Link from "next/link";
import { createProductAction } from "../../../actions";
import SubmitButton from "@/components/admin/SubmitButton";
import styles from "../../../admin.module.css";

export default function NewProductPage() {
  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Nuevo producto</h1>
          <p className={styles.crumb}>
            <Link href="/admin">← Productos</Link>
          </p>
        </div>
      </header>

      <form action={createProductAction} className={styles.form}>
        <label className={styles.span2}>
          <span>Nombre</span>
          <input type="text" name="name" required />
        </label>

        <label>
          <span>Categoría</span>
          <input type="text" name="category" required placeholder="Ej: Paq 1 - Base" />
        </label>

        <label>
          <span>Precio USD</span>
          <input type="number" name="costUSD" step="0.01" min="0" required />
        </label>

        <div className={`${styles.checkboxRow} ${styles.span2}`}>
          <label>
            <input type="checkbox" name="featured" />
            <span>Destacado</span>
          </label>
          <label>
            <input type="checkbox" name="active" defaultChecked />
            <span>Activo</span>
          </label>
        </div>

        <label className={styles.span2}>
          <span>Descripción</span>
          <textarea name="description" rows={4} />
        </label>

        <div className={styles.formActions}>
          <SubmitButton pendingLabel="Creando...">Crear producto</SubmitButton>
        </div>
      </form>
    </div>
  );
}
