"use client";

import { useState } from "react";
import SubmitButton from "@/components/admin/SubmitButton";
import type { NavLink } from "@/lib/settings";
import styles from "./settings.module.css";

type Props = {
  current: NavLink[];
  action: (formData: FormData) => Promise<void>;
};

export default function NavLinksForm({ current, action }: Props) {
  const [links, setLinks] = useState<NavLink[]>(
    current.length ? current : [{ label: "", href: "" }]
  );

  function update(i: number, patch: Partial<NavLink>) {
    setLinks((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function remove(i: number) {
    setLinks((prev) => prev.filter((_, idx) => idx !== i));
  }
  function add() {
    setLinks((prev) => [...prev, { label: "", href: "" }]);
  }
  function move(i: number, dir: -1 | 1) {
    setLinks((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  return (
    <form action={action} className={styles.textForm}>
      {links.map((link, i) => (
        <div key={i} className={styles.navRow}>
          <input
            type="text"
            name="nav_label"
            value={link.label}
            onChange={(e) => update(i, { label: e.target.value })}
            placeholder="Etiqueta (ej: Catálogo)"
            className={styles.input}
          />
          <input
            type="text"
            name="nav_href"
            value={link.href}
            onChange={(e) => update(i, { href: e.target.value })}
            placeholder="Ruta (ej: /productos)"
            className={styles.input}
          />
          <div className={styles.navBtns}>
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className={styles.iconBtn}
              aria-label="Subir"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === links.length - 1}
              className={styles.iconBtn}
              aria-label="Bajar"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => remove(i)}
              className={styles.removeBtn}
              aria-label="Quitar"
            >
              Quitar
            </button>
          </div>
        </div>
      ))}

      <div className={styles.formRow}>
        <button type="button" onClick={add} className={styles.addBtn}>
          + Agregar enlace
        </button>
        <SubmitButton pendingLabel="Guardando...">Guardar navegación</SubmitButton>
      </div>
    </form>
  );
}
