"use client";

import { ReactNode } from "react";
import SubmitButton from "./SubmitButton";

type Props = {
  action: (formData: FormData) => Promise<void> | void;
  hidden?: Record<string, string>;
  confirmMessage: string;
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
  fullWidth?: boolean;
};

export default function DeleteForm({
  action,
  hidden = {},
  confirmMessage,
  children,
  pendingLabel = "Eliminando...",
  className = "",
  fullWidth = false,
}: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
      className={className}
      style={fullWidth ? { width: "100%" } : undefined}
    >
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <SubmitButton
        variant="danger"
        pendingLabel={pendingLabel}
        className={fullWidth ? "fullWidth" : ""}
      >
        {children}
      </SubmitButton>
    </form>
  );
}
