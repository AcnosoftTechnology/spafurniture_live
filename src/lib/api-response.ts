export function jsonOk<T>(data: T, meta?: Record<string, unknown>) {
  return Response.json({ data, meta });
}

export function jsonError(code: string, message: string, status = 400) {
  return Response.json({ error: { code, message } }, { status });
}

export async function requireAdminSession() {
  const { auth } = await import("@/lib/auth/config");
  const session = await auth();
  if (!session?.user?.id) {
    return { session: null, error: jsonError("UNAUTHORIZED", "Authentication required", 401) };
  }
  return { session, error: null };
}

export async function requireAdminRole(required: import("@prisma/client").UserRole) {
  const { hasRole } = await import("@/lib/auth/rbac");
  const { session, error } = await requireAdminSession();
  if (error) return { session: null, error };
  if (!session.user.role || !hasRole(session.user.role, required)) {
    return { session: null, error: jsonError("FORBIDDEN", "Insufficient permissions", 403) };
  }
  return { session, error: null };
}
