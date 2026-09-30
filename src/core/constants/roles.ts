// Roles del sistema: deben coincidir con MediNexus.Domain.Users.SystemRoles del backend.
export const SYSTEM_ROLES = {
  SUPER_ADMIN: "SuperAdmin",
  ADMIN: "Admin",
} as const

export const isSuperAdminRole = (roleName?: string | null) =>
  roleName === SYSTEM_ROLES.SUPER_ADMIN

export const isAdministratorRole = (roleName?: string | null) =>
  roleName === SYSTEM_ROLES.SUPER_ADMIN || roleName === SYSTEM_ROLES.ADMIN
