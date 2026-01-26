import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPrismaAuth } from "@/lib/prisma-auth";
import { hasPermission, ROLES, type Role } from "@/lib/rbac";

const prisma = getPrismaAuth();

type Ctx = { params: Promise<{ id: string }> }; // ✅ Next 16

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params; // ✅ unwrap params
  const viewerRole = ((session.user as any).role ?? "USER") as Role;
  const viewerId = (session.user as any).id as string;

  const canDelete =
    hasPermission(viewerRole, "USERS_DELETE_ANY") ||
    hasPermission(viewerRole, "USERS_DELETE_WITH_TICKET");

  if (!canDelete) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  if (id === viewerId) {
    return NextResponse.json(
      { error: "You cannot delete your own account." },
      { status: 400 }
    );
  }

  try {
    // ✅ safer delete (avoids FK issues with NextAuth tables)
    await prisma.$transaction([
      prisma.session.deleteMany({ where: { userId: id } }),
      prisma.account.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Delete failed", detail: e?.message ?? String(e) },
      { status: 409 }
    );
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params; // ✅ unwrap params
  if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  const viewerRole = ((session.user as any).role ?? "USER") as Role;
  const viewerId = (session.user as any).id as string;

  // ✅ Only SUPERUSER can edit roles (matches what you asked)
  if (viewerRole !== "SUPERUSER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (id === viewerId) {
    return NextResponse.json(
      { error: "You cannot change your own role." },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => null);
  const nextRole = body?.role as Role | undefined;

  if (!nextRole || !ROLES.includes(nextRole)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id },
    data: { role: nextRole },
  });

  return NextResponse.json({ ok: true });
}
