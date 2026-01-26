//lib/rbac.ts
// lib/rbac.ts
export const ROLES = [
  "SUPERUSER",
  "ADMIN",
  "FINANCIAL_ADVISER",
  "VENDOR",
  "TOURGUIDE",
  "USER",
] as const;

export type Role = (typeof ROLES)[number];

export type Permission =
  | "DASHBOARD_VIEW"
  | "USERS_VIEW"
  | "USERS_DELETE_ANY"            // superuser
  | "USERS_DELETE_WITH_TICKET"    // admin (conditional)
  | "USERS_ROLE_EDIT"             // ✅ superuser only
  | "APPROVALS_MANAGE"
  | "STATS_VIEW_VENDORS_TOURGUIDES"
  | "FINANCIALS_VIEW_ALL"
  | "VENDOR_DASHBOARD"
  | "TOURGUIDE_DASHBOARD"
  | "USER_TRIPS_VIEW"
  | "PLANNER_USE"
  | "TICKETS_VIEW"
  | "TICKETS_MODERATE";

export const rolePermissions: Record<Role, Permission[]> = {
  SUPERUSER: [
    "DASHBOARD_VIEW",
    "USERS_VIEW",
    "USERS_DELETE_ANY",
    "USERS_ROLE_EDIT",            // ✅ add here
    "APPROVALS_MANAGE",
    "STATS_VIEW_VENDORS_TOURGUIDES",
    "FINANCIALS_VIEW_ALL",
    "TICKETS_VIEW",
    "TICKETS_MODERATE",
    "VENDOR_DASHBOARD",
    "TOURGUIDE_DASHBOARD",
    "USER_TRIPS_VIEW",
    "PLANNER_USE",
  ],
  ADMIN: [
    "DASHBOARD_VIEW",
    "USERS_VIEW",
    "USERS_DELETE_WITH_TICKET",
    "APPROVALS_MANAGE",
    "STATS_VIEW_VENDORS_TOURGUIDES",
    "TICKETS_VIEW",
    "TICKETS_MODERATE",
  ],
  FINANCIAL_ADVISER: ["DASHBOARD_VIEW", "FINANCIALS_VIEW_ALL"],
  VENDOR: ["DASHBOARD_VIEW", "VENDOR_DASHBOARD"],
  TOURGUIDE: ["DASHBOARD_VIEW", "TOURGUIDE_DASHBOARD"],
  USER: ["DASHBOARD_VIEW", "USER_TRIPS_VIEW", "PLANNER_USE"],
};


export function hasPermission(role: Role | undefined, perm: Permission) {
  if (!role) return false;
  return rolePermissions[role]?.includes(perm) ?? false;
}

export type NavItem = { label: string; href: string; perm: Permission };

export const NAV: NavItem[] = [
  // { label: "Overview", href: "/dashboard", perm: "DASHBOARD_VIEW" },

  { label: "Users", href: "/dashboard/users", perm: "USERS_VIEW" },
  { label: "Tour-guide Applicants", href: "/dashboard/approvals", perm: "APPROVALS_MANAGE" },
  { label: "Tickets", href: "/dashboard/tickets", perm: "TICKETS_VIEW" },
  { label: "Vendor/Tourguide Stats", href: "/dashboard/stats", perm: "STATS_VIEW_VENDORS_TOURGUIDES" },

  { label: "Financials", href: "/dashboard/financials", perm: "FINANCIALS_VIEW_ALL" },

  { label: "Vendor Panel", href: "/dashboard/vendor", perm: "VENDOR_DASHBOARD" },
  { label: "Tour-guide Application", href: "/dashboard/tourguide", perm: "TOURGUIDE_DASHBOARD" },

  { label: "My Trips", href: "/dashboard/trips", perm: "USER_TRIPS_VIEW" },
  { label: "Planner", href: "/dashboard/planner", perm: "PLANNER_USE" },
];
