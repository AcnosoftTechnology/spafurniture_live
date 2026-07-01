import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  basePath: "/api/auth",
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;
        const ip =
          request?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          request?.headers?.get("x-real-ip") ??
          "unknown";
        const userAgent = request?.headers?.get("user-agent") ?? undefined;

        if (!email || !password) {
          try {
            await prisma.loginActivity.create({
              data: { email, success: false, ip, userAgent },
            });
          } catch {
            /* ignore logging errors */
          }
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.status !== "ACTIVE") {
          try {
            await prisma.loginActivity.create({
              data: { email, userId: user?.id, success: false, ip, userAgent },
            });
          } catch {
            /* ignore */
          }
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          try {
            await prisma.loginActivity.create({
              data: { email, userId: user.id, success: false, ip, userAgent },
            });
          } catch {
            /* ignore */
          }
          return null;
        }

        try {
          await prisma.$transaction([
            prisma.loginActivity.create({
              data: { email, userId: user.id, success: true, ip, userAgent },
            }),
            prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() },
            }),
          ]);
        } catch {
          /* login still succeeds if audit log fails */
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      const publicPaths = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];
      if (publicPaths.some((p) => path.startsWith(p))) return true;
      return !!auth;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
});
