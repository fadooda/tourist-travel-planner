//lib/auth.ts
import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
import { getPrismaAuth } from "@/lib/prisma-auth";

const prisma = getPrismaAuth();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role, // ✅ IMPORTANT
        };
      },
    }),
  ],
  // lib/auth.ts (only the callbacks section shown)
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign-in
      if (user) {
        const id = (user as any).id as string | undefined;
        token.sub = id ?? token.sub;
        (token as any).role = (user as any).role;
        return token;
      }

      // ✅ Always re-sync role from DB (prevents "stale role" 403)
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });
        if (dbUser?.role) (token as any).role = dbUser.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
  },
  pages: { signIn: "/auth/login" },
};

export function getSession() {
  return getServerSession(authOptions);
}
