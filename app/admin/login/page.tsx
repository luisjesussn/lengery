import { redirect } from "next/navigation";
import { getCurrentUser, safeRedirectPath } from "@/lib/auth";
import LoginForm from "./LoginForm";
import styles from "./login.module.css";

type SearchParams = Promise<{ from?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { from } = await searchParams;
  const safeFrom = safeRedirectPath(from);
  const user = await getCurrentUser();
  if (user) redirect(safeFrom);

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Admin</h1>
        <p className={styles.lead}>Acceso restringido</p>
        <LoginForm from={safeFrom} />
      </div>
    </div>
  );
}
