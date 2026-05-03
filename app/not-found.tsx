import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "2rem",
      }}
    >
      <h1>Página no encontrada</h1>
      <p style={{ color: "var(--color-muted)" }}>El producto o página que buscás no existe.</p>
      <Link
        href="/"
        style={{
          padding: "0.75rem 1.5rem",
          background: "var(--color-fg)",
          color: "var(--color-bg)",
          borderRadius: "var(--radius-sm)",
        }}
      >
        Volver al inicio
      </Link>
    </div>
  );
}
