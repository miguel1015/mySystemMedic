"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { Alert, Button, Space, Table, Tag, Tooltip } from "antd"
import type { ColumnsType } from "antd/es/table"
import { PlusOutlined } from "@ant-design/icons"
import Modal from "@/components/modal"
import ModalConfirm from "@/components/modalConfirmation.tsx"
import { useRoleProfiles } from "@/core/hooks/parameterization/accessControl/useAccessControl"
import { useSaveAccessProfile } from "@/core/hooks/parameterization/accessControl/useAccessControlMutations"
import { TAccessProfile, TAccessRole } from "@/core/interfaces/parameterization/accessControl"
import ProfileForm from "./profileForm"

export default function ProfilesTab({ role }: { role: TAccessRole }) {
  const { data: profiles = [], isLoading, error, refetch } = useRoleProfiles(role.id)
  const saveProfile = useSaveAccessProfile()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<TAccessProfile | null>(null)
  const [toToggle, setToToggle] = useState<TAccessProfile | null>(null)

  const openForm = (profile: TAccessProfile | null) => {
    setEditing(profile)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditing(null)
  }

  const confirmToggle = () => {
    if (!toToggle) return
    const activate = !toToggle.isActive
    saveProfile.mutate(
      {
        roleId: role.id,
        id: toToggle.id,
        data: { name: toToggle.name, description: toToggle.description, isActive: activate },
      },
      {
        onSuccess: () => toast.success(`Perfil «${toToggle.name}» ${activate ? "activado" : "desactivado"}`),
        onError: (err: Error) => toast.error(err.message),
        onSettled: () => setToToggle(null),
      },
    )
  }

  const columns: ColumnsType<TAccessProfile> = [
    {
      title: "Perfil",
      dataIndex: "name",
      render: (name: string, profile) => (
        <>
          <strong>{name}</strong>
          {profile.description && <span className="rp-cell-secondary">{profile.description}</span>}
        </>
      ),
    },
    {
      title: "Usuarios activos",
      dataIndex: "userCount",
      width: 150,
      align: "center",
    },
    {
      title: "Estado",
      dataIndex: "isActive",
      width: 110,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "default"}>{isActive ? "Activo" : "Inactivo"}</Tag>
      ),
    },
    {
      title: "Acciones",
      width: 200,
      render: (_, profile) => {
        const blockedReason =
          profile.isActive && profile.userCount > 0
            ? "Tiene usuarios activos: asígnales otro perfil antes de desactivarlo"
            : null

        return (
          <Space>
            <Button size="small" onClick={() => openForm(profile)}>
              Editar
            </Button>
            <Tooltip title={blockedReason}>
              <Button
                size="small"
                danger={profile.isActive}
                disabled={!!blockedReason}
                onClick={() => setToToggle(profile)}
              >
                {profile.isActive ? "Desactivar" : "Activar"}
              </Button>
            </Tooltip>
          </Space>
        )
      },
    },
  ]

  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        title="No se pudieron cargar los perfiles"
        description={(error as Error).message}
        action={<Button onClick={() => refetch()}>Reintentar</Button>}
      />
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <span className="rp-cell-secondary">
          Los perfiles son los cargos dentro del rol (por ejemplo, Médico general o Enfermero).
        </span>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm(null)}>
          Nuevo perfil
        </Button>
      </div>

      <Table<TAccessProfile>
        rowKey="id"
        columns={columns}
        dataSource={profiles}
        loading={isLoading}
        pagination={false}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "Este rol aún no tiene perfiles" }}
      />

      <Modal open={formOpen} onClose={closeForm} title={editing ? "Editar perfil" : "Nuevo perfil"} size="md">
        <ProfileForm role={role} profile={editing} onDone={closeForm} />
      </Modal>

      <ModalConfirm
        open={!!toToggle}
        onClose={() => setToToggle(null)}
        onConfirm={confirmToggle}
        loading={saveProfile.isPending}
        title={toToggle?.isActive ? "Desactivar perfil" : "Activar perfil"}
        subtitle={
          toToggle?.isActive
            ? `«${toToggle?.name}» dejará de estar disponible al crear o editar usuarios.`
            : `«${toToggle?.name}» volverá a estar disponible para asignar a usuarios.`
        }
      />
    </div>
  )
}
