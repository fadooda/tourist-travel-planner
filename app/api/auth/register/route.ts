import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getPrismaAuth } from "@/lib/prisma-auth";

export async function POST(req: Request) {
  const prisma = getPrismaAuth();
  const body = await req.json();

  const email = String(body.email || "").toLowerCase().trim();
  const password = String(body.password || "");
  const name = String(body.name || "").trim();

  if (!email || password.length < 6) {
    return NextResponse.json(
      { error: "Invalid email or password (min 6 chars)." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { email, name: name || null, passwordHash },
  });

  return NextResponse.json({ ok: true });
}
