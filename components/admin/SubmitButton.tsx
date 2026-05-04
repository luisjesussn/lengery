"use client";

import { useFormStatus } from "react-dom";
import styles from "./submit-button.module.css";

type Props = {
  children: React.ReactNode;
  className?: string;
  pendingLabel?: string;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
};

export default function SubmitButton({
  children,
  className = "",
  pendingLabel,
  variant = "primary",
  disabled,
}: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`${styles.btn} ${styles[variant]} ${className}`}
      aria-busy={pending}
    >
      {pending && <span className={styles.spinner} aria-hidden="true" />}
      <span>{pending && pendingLabel ? pendingLabel : children}</span>
    </button>
  );
}
