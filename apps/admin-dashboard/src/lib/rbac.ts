export const ROLES = ["admin", "operator", "finance", "manager", "viewer"] as const;

export type Role = (typeof ROLES)[number];

export type Permission = string;

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ["*"],
  operator: [
    "dashboard.read",
    "clients.read",
    "clients.write",
    "contracts.read",
    "contracts.write",
    "leads.read",
    "leads.write",
    "tasks.read",
    "tasks.write",
    "provisioning.read",
    "provisioning.write",
    "reports.read",
    "notes.read",
    "notes.write",
    "requests.read",
    "requests.write",
    "maintenance.read",
    "maintenance.write",
  ],
  finance: [
    "dashboard.read",
    "billing.read",
    "billing.write",
    "contracts.read",
    "clients.read",
    "reports.read",
    "reports.finance",
  ],
  manager: [
    "dashboard.read",
    "clients.read",
    "contracts.read",
    "billing.read",
    "reports.read",
    "tasks.read",
    "leads.read",
    "audit.read",
    "maintenance.read",
    "requests.read",
    "provisioning.read",
  ],
  viewer: [
    "dashboard.read",
    "clients.read",
    "contracts.read",
    "billing.read",
    "reports.read",
    "audit.read",
    "qa.read",
  ],
};

const ROLE_LOOKUP = new Set<Role>(ROLES);

const PATH_RULES: Array<{ test: (pathname: string) => boolean; permission: Permission }> = [
  { test: (pathname: any) => pathname === "/" || pathname.startsWith("/dashboard"), permission: "dashboard.read" },
  { test: (pathname: any) => pathname.startsWith("/clients"), permission: "clients.read" },
  { test: (pathname: any) => pathname.startsWith("/billing"), permission: "billing.read" },
  { test: (pathname: any) => pathname.startsWith("/leads"), permission: "leads.read" },
  { test: (pathname: any) => pathname.startsWith("/content"), permission: "notes.read" },
  { test: (pathname: any) => pathname.startsWith("/reports"), permission: "reports.read" },
  { test: (pathname: any) => pathname.startsWith("/provisioning"), permission: "provisioning.read" },
  { test: (pathname: any) => pathname.startsWith("/deployment-checklist"), permission: "qa.read" },
  { test: (pathname: any) => pathname.startsWith("/tasks"), permission: "tasks.read" },
  { test: (pathname: any) => pathname.startsWith("/assets"), permission: "maintenance.read" },
  { test: (pathname: any) => pathname.startsWith("/domains"), permission: "maintenance.read" },
  { test: (pathname: any) => pathname.startsWith("/audit-logs"), permission: "audit.read" },
  { test: (pathname: any) => pathname.startsWith("/requests"), permission: "requests.read" },
  { test: (pathname: any) => pathname.startsWith("/maintenance"), permission: "maintenance.read" },
  { test: (pathname: any) => pathname.startsWith("/security"), permission: "security.read" },
  { test: (pathname: any) => pathname.startsWith("/admin/contracts/new"), permission: "contracts.write" },
  { test: (pathname: any) => pathname.startsWith("/admin/invoices/new"), permission: "billing.write" },
  { test: (pathname: any) => pathname.startsWith("/admin/contracts"), permission: "contracts.read" },
  { test: (pathname: any) => pathname.startsWith("/admin/invoices"), permission: "billing.read" },
  { test: (pathname: any) => pathname.startsWith("/admin"), permission: "admin.access" },
];

export function normalizeRole(role: unknown): Role | null {
  if (typeof role !== "string") {
    return null;
  }

  const normalized = role.trim().toLowerCase();
  return ROLE_LOOKUP.has(normalized as Role) ? (normalized as Role) : null;
}

export function getRolePermissions(role: Role | null | undefined): Permission[] {
  if (!role) {
    return [];
  }

  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) {
    return false;
  }

  const permissions = getRolePermissions(role);
  return permissions.includes("*") || permissions.includes(permission);
}

export function canAccessPath(role: Role | null | undefined, pathname: string): boolean {
  const match = PATH_RULES.find((item: any) => item.test(pathname));

  if (!match) {
    return true;
  }

  return hasPermission(role, match.permission);
}

export function getPathPermission(pathname: string): Permission | null {
  return PATH_RULES.find((item: any) => item.test(pathname))?.permission ?? null;
}

export function getUserRoleFromMetadata(
  user: { user_metadata?: Record<string, unknown> | null; app_metadata?: Record<string, unknown> | null } | null | undefined
): Role | null {
  return normalizeRole(user?.user_metadata?.role ?? user?.app_metadata?.role);
}
