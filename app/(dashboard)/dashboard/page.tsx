// app/(dashboard)/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AppEntry() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");

  const role = (session.user as any).role;

  if (role === "FINANCIAL_ADVISER") redirect("/dashboard/financials");
  if (role === "SUPERUSER" || role === "ADMIN") redirect("/dashboard");
  // USER / VENDOR / TOURGUIDE can go to their default:
  redirect("/dashboard/trips");
}
