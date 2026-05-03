"use client";

import { useState } from "react";
import { loginAction } from "../actions";
import styles from "./login.module.css";

export default function LoginForm({ from }: { from: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const res = await loginAction(formData);
    if (res?.error) {
      setError(res.error);
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className={styles.form}>
      <input type="hidden" name="from" value={from} />
      <label className={styles.field}>
        <span className={styles.label}>Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className={styles.input}
        />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Password</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className={styles.input}
        />
      </label>
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" disabled={pending} className={styles.btn}>
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
