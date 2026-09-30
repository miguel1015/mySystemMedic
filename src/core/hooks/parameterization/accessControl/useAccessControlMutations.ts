import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  TChangeUserRole,
  TSaveAccessProfile,
  TSaveAccessRole,
  TUpdateRolePermissions,
} from "@/core/interfaces/parameterization/accessControl"
import { accessControlService } from "./service"
import { accessControlKeys } from "./useAccessControl"

// Catálogos que usa el formulario de Usuarios; cambian cuando se editan roles o perfiles.
const USER_ROLES_KEY = ["user-roles"]
const USER_PROFILES_KEY = ["user-profiles"]
const USERS_KEY = ["users"]

export function useSaveAccessRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: TSaveAccessRole }) =>
      id ? accessControlService.updateRole(id, data) : accessControlService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessControlKeys.roles() })
      queryClient.invalidateQueries({ queryKey: USER_ROLES_KEY })
    },
  })
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roleId, data }: { roleId: number; data: TUpdateRolePermissions }) =>
      accessControlService.updateRolePermissions(roleId, data),
    onSuccess: (permissions) => {
      queryClient.setQueryData(accessControlKeys.permissions(permissions.roleId), permissions)
    },
  })
}

export function useSaveAccessProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roleId, id, data }: { roleId: number; id?: number; data: TSaveAccessProfile }) =>
      id ? accessControlService.updateProfile(id, data) : accessControlService.createProfile(roleId, data),
    onSuccess: (_profile, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: accessControlKeys.profiles(roleId) })
      queryClient.invalidateQueries({ queryKey: accessControlKeys.roles() })
      queryClient.invalidateQueries({ queryKey: USER_PROFILES_KEY })
    },
  })
}

export function useChangeUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; fromRoleId: number; data: TChangeUserRole }) =>
      accessControlService.changeUserRole(userId, data),
    onSuccess: (_user, { fromRoleId, data }) => {
      for (const roleId of [fromRoleId, data.userRoleId]) {
        queryClient.invalidateQueries({ queryKey: accessControlKeys.users(roleId) })
        queryClient.invalidateQueries({ queryKey: accessControlKeys.profiles(roleId) })
      }
      queryClient.invalidateQueries({ queryKey: accessControlKeys.roles() })
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
    },
  })
}
