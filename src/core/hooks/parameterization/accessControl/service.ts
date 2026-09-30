import { ENDPOINTS } from "@/core/api/endpoints"
import { create, updatePut } from "@/core/api/baseService"
import {
  TAccessModuleNode,
  TAccessProfile,
  TAccessRole,
  TAccessUser,
  TChangeUserRole,
  TRolePermissions,
  TSaveAccessProfile,
  TSaveAccessRole,
  TUpdateRolePermissions,
} from "@/core/interfaces/parameterization/accessControl"

const EP = ENDPOINTS.ACCESS_CONTROL

// getAll de baseService descarta el mensaje del backend; aquí se muestra (p. ej. el 403).
async function getJson<T>(endpoint: string): Promise<T> {
  const res = await fetch(endpoint, { method: "GET", credentials: "include" })
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error ?? `GET error: ${res.statusText}`)
  }

  return data as T
}

export const accessControlService = {
  getRoles: () => getJson<TAccessRole[]>(EP.ROLES),
  createRole: (data: TSaveAccessRole) => create<TAccessRole, TSaveAccessRole>(EP.ROLES, data),
  updateRole: (id: number, data: TSaveAccessRole) =>
    updatePut<TAccessRole, TSaveAccessRole>(EP.ROLE(id), data),

  getNavigationTree: () => getJson<TAccessModuleNode[]>(EP.NAVIGATION_TREE),
  getRolePermissions: (roleId: number) => getJson<TRolePermissions>(EP.ROLE_PERMISSIONS(roleId)),
  updateRolePermissions: (roleId: number, data: TUpdateRolePermissions) =>
    updatePut<TRolePermissions, TUpdateRolePermissions>(EP.ROLE_PERMISSIONS(roleId), data),

  getRoleProfiles: (roleId: number) => getJson<TAccessProfile[]>(EP.ROLE_PROFILES(roleId)),
  createProfile: (roleId: number, data: TSaveAccessProfile) =>
    create<TAccessProfile, TSaveAccessProfile>(EP.ROLE_PROFILES(roleId), data),
  updateProfile: (id: number, data: TSaveAccessProfile) =>
    updatePut<TAccessProfile, TSaveAccessProfile>(EP.PROFILE(id), data),

  getRoleUsers: (roleId: number) => getJson<TAccessUser[]>(EP.ROLE_USERS(roleId)),
  changeUserRole: (userId: number, data: TChangeUserRole) =>
    updatePut<TAccessUser, TChangeUserRole>(EP.USER_ROLE(userId), data),
}
