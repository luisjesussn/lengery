import { createProductAction } from "../../../actions";
import styles from "../../../admin.module.css";

export default function NewProductPage() {
  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Nuevo producto</h1>
      </header>

      <form action={createProductAction} className={styles.form}>
        <label className={styles.span2}>
          <span>Nombre</span>
          <input type="text" name="name" required />
        </label>

        <label>
          <span>Categoría</span>
          <input type="text" name="category" required placeholder="Ej: Paq 1 - Base SHEIN" />
        </label>

        <label>
          <span>Costo USD</span>
          <input type="number" name="costUSD" step="0.01" min="0" required />
        </label>

        <label>
          <span>Margen (0.0 a 1.0)</span>
          <input type="number" name="marginPct" step="0.05" min="0" max="3" defaultValue="0.8" required />
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
          <button type="submit" className={styles.btn}>
            Crear
          </button>
        </div>
      </form>
    </div>
  );
}
