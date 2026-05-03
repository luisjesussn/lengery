import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";
import styles from "./login.module.css";

type SearchParams = Promise<{ from?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { from } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(from ?? "/admin");

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Admin</h1>
        <p className={styles.lead}>Acceso restringido</p>
        <LoginForm from={from ?? "/admin"} />
      </div>
    </div>
  );
}
