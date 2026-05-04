import { getCurrentUser } from "@/lib/auth";
import { logoutAction, logoutAllAction } from "../actions";
import AdminShell from "@/components/admin/AdminShell";

export default async function AuthedAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <AdminShell
      user={user ? { name: user.name, email: user.email } : null}
      logoutAction={logoutAction}
      logoutAllAction={logoutAllAction}
    >
      {children}
    </AdminShell>
  );
}
