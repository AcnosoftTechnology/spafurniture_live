import type { UserRole } from "@prisma/client";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  EDITOR: 50,
  MODERATOR: 30,
};

export function hasRole(userRole: UserRole, required: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[required];
}

export function canManageUsers(role: UserRole): boolean {
  return hasRole(role, "ADMIN");
}

export function canPublish(role: UserRole): boolean {
  return hasRole(role, "EDITOR");
}

export const ADMIN_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "EDITOR", "MODERATOR"];
