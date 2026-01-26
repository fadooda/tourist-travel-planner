"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, hasPermission, type Role } from "@/lib/rbac";

export function DashboardNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const navItems = NAV.filter((item) => hasPermission(role, item.perm));

  return (
    <nav className="px-2 py-3 text-sm">
      {navItems.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "block rounded-xl px-3 py-2",
              active ? "bg-black/10 font-medium" : "hover:bg-black/5",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
