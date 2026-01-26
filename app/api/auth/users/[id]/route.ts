//app/api/auth/users/[id]/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPrismaAuth } from "@/lib/prisma-auth";
import { hasPermission, ROLES, type Role } from "@/lib/rbac";

const prisma = getPrismaAuth();

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const viewerRole = ((session.user as any).role ?? "USER") as Role;
  const viewerId = (session.user as any).id as string;

  const allowed =
    hasPermission(viewerRole, "USERS_DELETE_ANY") ||
    hasPermission(viewerRole, "USERS_DELETE_WITH_TICKET");

  if (!allowed) return new NextResponse("Forbidden", { status: 403 });

  if (params.id === viewerId) {
    return new NextResponse("You cannot delete your own account.", { status: 400 });
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const viewerRole = ((session.user as any).role ?? "USER") as Role;
  const allowed = hasPermission(viewerRole, "USERS_ROLE_EDIT");
  if (!allowed) return new NextResponse("Forbidden", { status: 403 });

  const body = await req.json().catch(() => null);
  const nextRole = body?.role as Role | undefined;

  if (!nextRole || !ROLES.includes(nextRole)) {
    return new NextResponse("Invalid role.", { status: 400 });
  }

  await prisma.user.update({
    where: { id: params.id },
    data: { role: nextRole },
  });

  return NextResponse.json({ ok: true });
}
