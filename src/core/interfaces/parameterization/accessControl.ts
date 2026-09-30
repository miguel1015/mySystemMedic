// Contratos de /api/access-control (MediNexus.Api.Contracts.Users.AccessControl).

export interface TAccessRole {
  id: number
  name: string
  description?: string | null
  isActive: boolean
  isSystem: boolean
  hasFullAccess: boolean
  userCount: number
  profileCount: number
}

export interface TSaveAccessRole {
  name: string
  description?: string | null
  isActive: boolean
}

export interface TAccessSubMenuNode {
  id: number
  name: string
  route: string
  icon?: string | null
}

export interface TAccessMenuNode {
  id: number
  name: string
  route?: string | null
  icon?: string | null
  subMenus: TAccessSubMenuNode[]
}

export interface TAccessModuleNode {
  id: number
  name: string
  menus: TAccessMenuNode[]
}

// menuIds solo incluye menús sin submenús; un menú con submenús se muestra si el rol
// tiene al menos uno de ellos.
export interface TRolePermissions {
  roleId: number
  hasFullAccess: boolean
  menuIds: number[]
  subMenuIds: number[]
}

export interface TUpdateRolePermissions {
  menuIds: number[]
  subMenuIds: number[]
}

export interface TAccessProfile {
  id: number
  name: string
  description?: string | null
  isActive: boolean
  userRoleId: number
  userCount: number
}

export interface TSaveAccessProfile {
  name: string
  description?: string | null
  isActive: boolean
}

export interface TAccessUser {
  id: number
  fullName: string
  email: string
  userProfileId: number
  userProfileName?: string | null
  userStatusName?: string | null
  isActive: boolean
}

export interface TChangeUserRole {
  userRoleId: number
  userProfileId: number
}

// /api/navigation/me/access
export interface TNavigationAccess {
  hasFullAccess: boolean
  protectedRoutes: string[]
  allowedRoutes: string[]
}
