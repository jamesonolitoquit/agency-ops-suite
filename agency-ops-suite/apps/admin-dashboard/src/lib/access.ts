export type AccessRole = "admin" | "operator";

export type AccessContext = {
  email: string | null;
  role: AccessRole | null;
  hasAccess: boolean;
};

function normalizeEmail(email?: string) {
  return email?.trim().toLowerCase() || "";
}

export function isDevAuthBypassEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.DEV_AUTH_BYPASS === "true";
}

export function getDevBypassEmail() {
  return process.env.DEV_AUTH_BYPASS_EMAIL?.trim() || "dev-bypass@local.test";
}

function parseRoleAllowlist() {
  const raw = process.env.ADMIN_ROLE_ALLOWLIST?.trim() ?? "";

  if (!raw) {
    return new Map<string, AccessRole>();
  }

  return raw.split(",").reduce((allowlist, entry) => {
    const [rawEmail, rawRole] = entry.split(":").map((value) => value.trim());

    if (!rawEmail) {
      return allowlist;
    }

    const role = rawRole === "operator" ? "operator" : "admin";
    allowlist.set(normalizeEmail(rawEmail), role);
    return allowlist;
  }, new Map<string, AccessRole>());
}

function parseLegacyAllowlist() {
  const raw = process.env.ADMIN_EMAIL_ALLOWLIST ?? "";

  return raw
    .split(",")
    .map((entry) => normalizeEmail(entry))
    .filter(Boolean);
}

export function resolveAccessContext(email?: string, devAuthBypassEnabled = false): AccessContext {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return { email: null, role: null, hasAccess: false };
  }

  if (devAuthBypassEnabled) {
    return { email: normalizedEmail, role: "admin", hasAccess: true };
  }

  const roleAllowlist = parseRoleAllowlist();
  const legacyAllowlist = parseLegacyAllowlist();

  if (roleAllowlist.size === 0 && legacyAllowlist.length === 0) {
    return { email: normalizedEmail, role: null, hasAccess: false };
  }

  if (roleAllowlist.has(normalizedEmail)) {
    return { email: normalizedEmail, role: roleAllowlist.get(normalizedEmail) ?? "admin", hasAccess: true };
  }

  if (legacyAllowlist.includes(normalizedEmail)) {
    return { email: normalizedEmail, role: "admin", hasAccess: true };
  }

  return { email: normalizedEmail, role: null, hasAccess: false };
}