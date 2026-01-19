"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function UserMenu() {
  const { data } = useSession();
  const user = data?.user;

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/app"
        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm"
      >
        Dashboard
      </Link>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white"
      >
        Sign out
      </button>
    </div>
  );
}
