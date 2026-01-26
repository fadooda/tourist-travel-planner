//app/(dashboard)/_components/user-menu.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import {
  Bell,
  ChevronDown,
  CreditCard,
  LogOut,
  Sparkles,
  User as UserIcon,
} from "lucide-react";

function initials(name?: string | null, email?: string | null) {
  const base = (name ?? "").trim() || (email ?? "").split("@")[0] || "U";
  const parts = base.split(/\s+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "U") + (parts[1]?.[0] ?? "");
  return letters.toUpperCase().slice(0, 2);
}

function MenuLink({
  href,
  icon,
  label,
  onClick,
}: {
  href?: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  const cls = "flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50";
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        <span className="text-slate-700">{icon}</span>
        <span>{label}</span>
      </button>
    );
  }
  return (
    <a href={href} className={cls}>
      <span className="text-slate-700">{icon}</span>
      <span>{label}</span>
    </a>
  );
}

export function DashboardUserMenu({
  name,
  email,
  role,
}: {
  name?: string | null;
  email?: string | null;
  role: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const initialsText = useMemo(() => initials(name, email), [name, email]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-xl px-2 py-1 hover:bg-black/5"
      >
        <div className="hidden text-right leading-tight sm:block">
          <div className="text-sm font-medium text-slate-900">{name ?? "User"}</div>
          <div className="text-xs text-slate-600">{email ?? ""}</div>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 ring-1 ring-black/5">
          <span className="text-xs font-semibold text-slate-700">{initialsText}</span>
        </div>

        <ChevronDown className="h-4 w-4 text-slate-600" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="px-4 py-3">
            <div className="text-sm font-medium">{name ?? "User"}</div>
            <div className="text-xs text-slate-600">{email}</div>
            <div className="mt-1 text-[11px] text-slate-500">Role: {role}</div>
          </div>

          <div className="h-px bg-slate-100" />

          <MenuLink href="/dashboard/billing" icon={<Sparkles className="h-4 w-4" />} label="Upgrade to Pro" />
          <MenuLink href="/dashboard/account" icon={<UserIcon className="h-4 w-4" />} label="Account" />
          <MenuLink href="/dashboard/billing" icon={<CreditCard className="h-4 w-4" />} label="Billing" />
          <MenuLink href="/dashboard/notifications" icon={<Bell className="h-4 w-4" />} label="Notifications" />

          <div className="h-px bg-slate-100" />

          <MenuLink
            icon={<LogOut className="h-4 w-4" />}
            label="Log out"
            onClick={() => signOut({ callbackUrl: "/" })}
          />
        </div>
      )}
    </div>
  );
}
