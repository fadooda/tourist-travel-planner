"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ROLES, hasPermission, type Role } from "@/lib/rbac";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: string; // keep it string for client component safety
};

export function UsersTable({
  users,
  viewerRole,
  viewerId,
}: {
  users: UserRow[];
  viewerRole: Role;
  viewerId: string;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const canDelete =
    hasPermission(viewerRole, "USERS_DELETE_ANY") ||
    hasPermission(viewerRole, "USERS_DELETE_WITH_TICKET");

  const canEditRole = hasPermission(viewerRole, "USERS_ROLE_EDIT");

  async function api<T>(url: string, init: RequestInit): Promise<T> {
    setMsg(null);
    const res = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    });

    const ct = res.headers.get("content-type") ?? "";
    const payload = ct.includes("application/json")
      ? await res.json().catch(() => null)
      : await res.text().catch(() => "");

    if (!res.ok) {
      // avoid dumping HTML error pages into your UI
      if (typeof payload === "string" && payload.includes("<!DOCTYPE")) {
        throw new Error(`Request failed (${res.status})`);
      }
      const err =
        typeof payload === "string"
          ? payload
          : payload?.error ?? `Request failed (${res.status})`;
      throw new Error(err);
    }

    return payload as T;
  }

  async function updateRole(userId: string, role: Role) {
    try {
      setPendingId(userId);
      await api(`/api/dashboard/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      startTransition(() => router.refresh());
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to update role");
    } finally {
      setPendingId(null);
    }
  }

  async function removeUser(userId: string) {
    if (!confirm("Remove this user?")) return;

    try {
      setPendingId(userId);
      await api(`/api/dashboard/users/${userId}`, { method: "DELETE" });
      startTransition(() => router.refresh());
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to remove user");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-3">
      {msg && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {msg}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => {
              const isSelf = u.id === viewerId;
              const disabled = pendingId === u.id;

              return (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{u.name ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{u.email}</td>

                  <td className="px-4 py-3">
                    {canEditRole ? (
                      <select
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                        value={u.role}
                        disabled={disabled || isSelf}
                        onChange={(e) => updateRole(u.id, e.target.value as Role)}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-flex rounded-xl border border-slate-200 bg-white px-3 py-2">
                        {u.role}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      className={[
                        "rounded-xl border px-4 py-2",
                        !canDelete || isSelf
                          ? "pointer-events-none opacity-40"
                          : "hover:bg-slate-50",
                      ].join(" ")}
                      disabled={disabled || !canDelete || isSelf}
                      onClick={() => removeUser(u.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
