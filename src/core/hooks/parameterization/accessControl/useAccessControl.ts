import { useQuery } from "@tanstack/react-query"
import { accessControlService } from "./service"

export const accessControlKeys = {
  all: ["access-control"] as const,
  roles: () => [...accessControlKeys.all, "roles"] as const,
  tree: () => [...accessControlKeys.all, "navigation-tree"] as const,
  permissions: (roleId: number) => [...accessControlKeys.all, "permissions", roleId] as const,
  profiles: (roleId: number) => [...accessControlKeys.all, "profiles", roleId] as const,
  users: (roleId: number) => [...accessControlKeys.all, "users", roleId] as const,
}

export function useAccessRoles() {
  return useQuery({
    queryKey: accessControlKeys.roles(),
    queryFn: accessControlService.getRoles,
    retry: false,
  })
}

export function useNavigationTree() {
  return useQuery({
    queryKey: accessControlKeys.tree(),
    queryFn: accessControlService.getNavigationTree,
    retry: false,
  })
}

export function useRolePermissions(roleId?: number) {
  return useQuery({
    queryKey: accessControlKeys.permissions(roleId ?? 0),
    queryFn: () => accessControlService.getRolePermissions(roleId!),
    enabled: !!roleId,
    retry: false,
  })
}

export function useRoleProfiles(roleId?: number) {
  return useQuery({
    queryKey: accessControlKeys.profiles(roleId ?? 0),
    queryFn: () => accessControlService.getRoleProfiles(roleId!),
    enabled: !!roleId,
    retry: false,
  })
}

export function useRoleUsers(roleId?: number) {
  return useQuery({
    queryKey: accessControlKeys.users(roleId ?? 0),
    queryFn: () => accessControlService.getRoleUsers(roleId!),
    enabled: !!roleId,
    retry: false,
  })
}
