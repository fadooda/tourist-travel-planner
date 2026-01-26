import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Bell } from "lucide-react";
import type { Role } from "@/lib/rbac";
import { SidebarUserMenu } from "./_components/sidebar-user-menu";
import { DashboardNav } from "./_components/dashboard-nav";
import { DashboardUserMenu } from "./_components/user-menu";

const SIDEBAR_W = "w-72";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");

  const role = ((session.user as any).role ?? "USER") as Role;

  const panelBg = "bg-red-50/80";
  const border = "border-red-200/70";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* TOP BAR */}
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 h-16 backdrop-blur-md",
          "border-b",
          panelBg,
          border,
        ].join(" ")}
      >
        <div className="flex h-full">
          {/* LEFT HEADER BLOCK */}
          <div className={`${SIDEBAR_W} flex items-center gap-3 px-4 border-r ${border}`}>
            <div className="relative h-10 w-40 rounded-md bg-white/60 ring-1 ring-black/5">
              <Image
                src="/discover-egypt-logo.svg"
                alt="Logo"
                fill
                className="object-contain p-1"
                priority
              />
            </div>

            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/60 ring-1 ring-black/5 hover:bg-white/80"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-slate-700" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </button>
          </div>

          {/* MAIN HEADER AREA */}
          <div className="flex flex-1 items-center justify-between px-6">
            <div className="leading-tight">
              <div className="text-lg font-semibold text-slate-900">Tour Admin</div>
              <div className="text-xs text-slate-600">{String(role)}</div>
            </div>

            {/* ✅ User dropdown menu */}
            <DashboardUserMenu
              name={session.user.name}
              email={session.user.email}
              role={String(role)}
            />
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside
        className={[
          "fixed left-0 top-16 z-40",
          "h-[calc(100vh-4rem)]",
          SIDEBAR_W,
          "border-r backdrop-blur-md",
          panelBg,
          border,
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          <DashboardNav role={role} />

          {/* FOOTER / bottom-left menu */}
        <div className="mt-auto">
          <SidebarUserMenu
            name={session.user.name}
            email={session.user.email}
            role={String(role)}
            borderClass={border}
          />
        </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="pt-16 pl-72">
        <div className="min-h-[calc(100vh-4rem)] p-6">{children}</div>
      </main>
    </div>
  );
}
