"use client"

import { useCallback, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { Alert, Button, Skeleton } from "antd"
import { Container } from "@/components/container"
import Modal from "@/components/modal"
import ModalConfirm from "@/components/modalConfirmation.tsx"
import Title from "@/components/title"
import { useAccessRoles } from "@/core/hooks/parameterization/accessControl/useAccessControl"
import { useSaveAccessRole } from "@/core/hooks/parameterization/accessControl/useAccessControlMutations"
import { TAccessRole } from "@/core/interfaces/parameterization/accessControl"
import RoleDetail from "./roleDetail"
import RoleForm from "./roleForm"
import RolesPanel, { sortRoles } from "./rolesPanel"
import "./rolesPermissions.css"

type RoleFormState = { open: false } | { open: true; role: TAccessRole | null }

export default function RolesPermissionsContainer() {
  const { data, isLoading, error, refetch, isFetching } = useAccessRoles()
  const saveRole = useSaveAccessRole()

  const [selectedId, setSelectedId] = useState<number>()
  const [roleForm, setRoleForm] = useState<RoleFormState>({ open: false })
  const [toToggle, setToToggle] = useState<TAccessRole | null>(null)
  const [hasUnsavedPermissions, setHasUnsavedPermissions] = useState(false)
  const [pendingRole, setPendingRole] = useState<TAccessRole | null>(null)

  const roles = useMemo(() => sortRoles(data ?? []), [data])
  // Si no hay selección (o el rol ya no existe) se muestra el primero.
  const selectedRole = roles.find((role) => role.id === selectedId) ?? roles[0]

  const handleDirtyChange = useCallback((dirty: boolean) => setHasUnsavedPermissions(dirty), [])

  // Cambiar de rol con permisos sin guardar pide confirmación para no perderlos.
  const selectRole = (role: TAccessRole) => {
    if (role.id === selectedRole?.id) return
    if (hasUnsavedPermissions) {
      setPendingRole(role)
      return
    }
    setSelectedId(role.id)
  }

  const confirmToggle = () => {
    if (!toToggle) return
    const activate = !toToggle.isActive
    saveRole.mutate(
      {
        id: toToggle.id,
        data: { name: toToggle.name, description: toToggle.description, isActive: activate },
      },
      {
        onSuccess: () => toast.success(`Rol «${toToggle.name}» ${activate ? "activado" : "desactivado"}`),
        onError: (err: Error) => toast.error(err.message),
        onSettled: () => setToToggle(null),
      },
    )
  }

  const header = (
    <>
      <Title children="Roles y permisos" level={3} />
      <p className="rp-subtitle">
        Crea roles, define qué vistas puede ver cada uno y organiza sus perfiles y usuarios.
      </p>
    </>
  )

  if (isLoading) {
    return (
      <Container>
        {header}
        <Skeleton active paragraph={{ rows: 10 }} />
      </Container>
    )
  }

  if (error || !data) {
    return (
      <Container>
        {header}
        <Alert
          type="error"
          showIcon
          title="No se pudieron cargar los roles"
          description={(error as Error | null)?.message}
          action={
            <Button onClick={() => refetch()} loading={isFetching}>
              Reintentar
            </Button>
          }
        />
      </Container>
    )
  }

  return (
    <Container fluid>
      {header}

      <div className="row g-3">
        <div className="col-12 col-lg-4 col-xxl-3">
          <RolesPanel
            roles={roles}
            selectedId={selectedRole?.id}
            onSelect={selectRole}
            onCreate={() => setRoleForm({ open: true, role: null })}
          />
        </div>

        <div className="col-12 col-lg-8 col-xxl-9">
          {selectedRole ? (
            <RoleDetail
              key={selectedRole.id}
              role={selectedRole}
              onEdit={() => setRoleForm({ open: true, role: selectedRole })}
              onToggleActive={() => setToToggle(selectedRole)}
              onDirtyChange={handleDirtyChange}
            />
          ) : (
            <div className="rp-panel">Crea el primer rol para empezar.</div>
          )}
        </div>
      </div>

      <Modal
        open={roleForm.open}
        onClose={() => setRoleForm({ open: false })}
        title={roleForm.open && roleForm.role ? "Editar rol" : "Nuevo rol"}
        size="md"
      >
        {roleForm.open && (
          <RoleForm
            role={roleForm.role}
            onDone={(saved) => {
              setRoleForm({ open: false })
              // Un rol recién creado queda seleccionado para asignarle sus vistas.
              if (saved && !roleForm.role && !hasUnsavedPermissions) setSelectedId(saved.id)
            }}
          />
        )}
      </Modal>

      <ModalConfirm
        open={!!toToggle}
        onClose={() => setToToggle(null)}
        onConfirm={confirmToggle}
        loading={saveRole.isPending}
        title={toToggle?.isActive ? "Desactivar rol" : "Activar rol"}
        subtitle={
          toToggle?.isActive
            ? `«${toToggle?.name}» no se podrá asignar a nuevos usuarios.`
            : `«${toToggle?.name}» volverá a estar disponible para asignar.`
        }
      />

      <ModalConfirm
        open={!!pendingRole}
        onClose={() => setPendingRole(null)}
        onConfirm={() => {
          if (pendingRole) setSelectedId(pendingRole.id)
          setHasUnsavedPermissions(false)
          setPendingRole(null)
        }}
        title="Descartar cambios"
        subtitle={`Hay permisos sin guardar en «${selectedRole?.name}». Si cambias de rol se perderán.`}
        confirmText="Descartar y continuar"
      />
    </Container>
  )
}
