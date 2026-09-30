"use client"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { Alert, Button } from "antd"
import Select from "@/components/select"
import {
  useAccessRoles,
  useRoleProfiles,
} from "@/core/hooks/parameterization/accessControl/useAccessControl"
import { useChangeUserRole } from "@/core/hooks/parameterization/accessControl/useAccessControlMutations"
import { TAccessRole, TAccessUser } from "@/core/interfaces/parameterization/accessControl"

const selectField = (message: string) => z.number({ required_error: message, invalid_type_error: message })

const changeRoleSchema = z.object({
  roleId: selectField("Selecciona un rol"),
  profileId: selectField("Selecciona un perfil"),
})

type TChangeRoleForm = z.infer<typeof changeRoleSchema>

interface ChangeRoleFormProps {
  user: TAccessUser
  currentRole: TAccessRole
  onDone: () => void
}

export default function ChangeRoleForm({ user, currentRole, onDone }: ChangeRoleFormProps) {
  const changeRole = useChangeUserRole()
  const { data: roles = [] } = useAccessRoles()

  const { control, handleSubmit, setValue } = useForm<TChangeRoleForm>({
    resolver: zodResolver(changeRoleSchema),
    defaultValues: { roleId: currentRole.id, profileId: user.userProfileId },
  })

  const [roleId, profileId] = useWatch({ control, name: ["roleId", "profileId"] })
  const { data: profiles = [], isLoading: loadingProfiles } = useRoleProfiles(roleId || undefined)

  const roleOptions = roles
    .filter((role) => role.isActive)
    .map((role) => ({ value: role.id, label: role.name }))

  const profileOptions = profiles
    .filter((profile) => profile.isActive)
    .map((profile) => ({ value: profile.id, label: profile.name }))

  const unchanged = roleId === currentRole.id && profileId === user.userProfileId
  const roleWithoutProfiles = !!roleId && !loadingProfiles && profileOptions.length === 0

  const onSubmit = (data: TChangeRoleForm) => {
    changeRole.mutate(
      {
        userId: user.id,
        fromRoleId: currentRole.id,
        data: { userRoleId: data.roleId, userProfileId: data.profileId },
      },
      {
        onSuccess: () => {
          toast.success(`Se actualizó el rol de ${user.fullName}`)
          onDone()
        },
        onError: (err: Error) => toast.error(err.message),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p className="mb-3">
        <strong>{user.fullName}</strong>
        <span className="rp-cell-secondary">{user.email}</span>
      </p>

      <Select
        name="roleId"
        label="Rol"
        placeholder="Selecciona un rol"
        options={roleOptions}
        control={control}
        // Fuera del modal: dentro, el cuerpo no tiene alto suficiente y la lista tapa el campo.
        getPopupContainer={() => document.body}
        // El perfil depende del rol: al cambiarlo se vuelve a elegir. Select usa null como
        // "sin valor" (igual que al limpiarlo) y el esquema lo rechaza al guardar.
        onChange={() => setValue("profileId", null as unknown as number)}
      />
      <Select
        name="profileId"
        label="Perfil"
        placeholder={roleId ? "Selecciona un perfil" : "Primero selecciona un rol"}
        options={profileOptions}
        control={control}
        getPopupContainer={() => document.body}
        disabled={!roleId || loadingProfiles}
        loading={loadingProfiles}
      />

      {roleWithoutProfiles && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          title="Este rol no tiene perfiles activos. Créale uno en la pestaña «Perfiles»."
        />
      )}

      <p className="rp-cell-secondary mb-3">
        El menú del usuario cambia al recargar la página; los permisos de administración se
        actualizan cuando vuelva a iniciar sesión.
      </p>

      <div className="d-flex justify-content-end gap-2">
        <Button onClick={onDone} disabled={changeRole.isPending}>
          Cancelar
        </Button>
        <Button type="primary" htmlType="submit" loading={changeRole.isPending} disabled={unchanged}>
          Guardar
        </Button>
      </div>
    </form>
  )
}
