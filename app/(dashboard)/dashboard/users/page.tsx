import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPrismaAuth } from "@/lib/prisma-auth";
import { ROLES, type Role } from "@/lib/rbac";
import { UsersTable } from "./_components/users-table";

const prisma = getPrismaAuth();

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");

  const viewerRole = ((session.user as any).role ?? "USER") as Role;
  const viewerId = (session.user as any).id as string;

  const sp = await searchParams; // ✅ Next 16
  const q = (sp.q ?? "").trim();

  const roleParam = (sp.role ?? "").trim();
  const roleFilter = ROLES.includes(roleParam as any) ? (roleParam as Role) : "";

  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const where = {
    AND: [
      roleFilter ? { role: roleFilter } : {},
      q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {},
    ],
  };

  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  ]);

  const users = rows.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(), // ✅ send string to client component
  }));

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-semibold">Users</div>
        <div className="text-sm text-slate-600">All registered users ({total})</div>
      </div>

      <form className="flex flex-col gap-3 md:flex-row md:items-end" method="GET">
        <div className="flex-1">
          <label className="text-sm text-slate-600">Search</label>
          <input
            name="q"
            defaultValue={q}
            placeholder="name or email..."
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2"
          />
        </div>

        <div className="w-full md:w-56">
          <label className="text-sm text-slate-600">Role</label>
          <select
            name="role"
            defaultValue={roleFilter}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2"
          >
            <option value="">All</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <button className="h-10 rounded-xl bg-slate-900 px-4 text-white">Apply</button>
      </form>

      <UsersTable users={users} viewerRole={viewerRole} viewerId={viewerId} />

      <div className="flex items-center justify-between pt-2 text-sm text-slate-600">
        <div>
          Page {page} of {totalPages}
        </div>

        <div className="flex gap-2">
          <a
            className={[
              "rounded-xl border px-3 py-2",
              page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-white",
            ].join(" ")}
            href={`?q=${encodeURIComponent(q)}&role=${encodeURIComponent(roleFilter)}&page=${page - 1}`}
          >
            Prev
          </a>
          <a
            className={[
              "rounded-xl border px-3 py-2",
              page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-white",
            ].join(" ")}
            href={`?q=${encodeURIComponent(q)}&role=${encodeURIComponent(roleFilter)}&page=${page + 1}`}
          >
            Next
          </a>
        </div>
      </div>
    </div>
  );
}
