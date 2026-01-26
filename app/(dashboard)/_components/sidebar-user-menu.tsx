"use client";

import { useEffect, useRef, useState } from "react";
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

function Item({
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
  const cls =
    "flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-800 hover:bg-slate-50";
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

export function SidebarUserMenu({
  name,
  email,
  role,
  borderClass,
}: {
  name?: string | null;
  email?: string | null;
  role?: string;
  borderClass: string; // pass your `border` string from layout
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className={`relative border-t ${borderClass} p-3`}>
      {/* Dropdown (opens upward) */}
      {open && (
        <div className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <Item href="/dashboard/upgrade" icon={<Sparkles className="h-4 w-4" />} label="Upgrade to Pro" />
          <Item href="/dashboard/account" icon={<UserIcon className="h-4 w-4" />} label="Account" />
          <Item href="/dashboard/billing" icon={<CreditCard className="h-4 w-4" />} label="Billing" />
          <Item href="/dashboard/notifications" icon={<Bell className="h-4 w-4" />} label="Notifications" />

          <div className="h-px bg-slate-100" />

          <Item
            icon={<LogOut className="h-4 w-4" />}
            label="Log out"
            onClick={() => signOut({ callbackUrl: "/" })}
          />
        </div>
      )}

      {/* Trigger row */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl px-2 py-2 hover:bg-black/5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 ring-1 ring-black/5">
            <span className="text-xs font-semibold text-slate-700">
              {initials(name, email)}
            </span>
          </div>

          <div className="min-w-0 text-left leading-tight">
            <div className="truncate text-sm font-medium text-slate-900">
              {name ?? "User"}
            </div>
            <div className="truncate text-xs text-slate-600">{email ?? ""}</div>
            {role ? <div className="text-[11px] text-slate-500">Role: {role}</div> : null}
          </div>
        </div>

        <ChevronDown className="h-4 w-4 text-slate-600" />
      </button>
    </div>
  );
}
