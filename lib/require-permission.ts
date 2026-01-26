//lib/require-permission.ts
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { hasPermission, type Permission, type Role } from "@/lib/rbac";

export async function requirePermission(perm: Permission) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const role = session.user.role as Role | undefined;
  if (!hasPermission(role, perm)) redirect("/dashboard");

  return { session, role };
}
