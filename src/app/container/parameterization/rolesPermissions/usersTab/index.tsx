"use client"

import { useMemo, useState } from "react"
import { Alert, Button, Input, Table, Tag, Tooltip } from "antd"
import type { ColumnsType } from "antd/es/table"
import { SearchOutlined } from "@ant-design/icons"
import Modal from "@/components/modal"
import { useAuthSession } from "@/core/hooks/authentication/useAuthSession"
import { useRoleUsers } from "@/core/hooks/parameterization/accessControl/useAccessControl"
import { TAccessRole, TAccessUser } from "@/core/interfaces/parameterization/accessControl"
import { normalizeText } from "../permissionsTab/permissionsState"
import ChangeRoleForm from "./changeRoleForm"

const STATUS_COLORS: Record<string, string> = {
  Activo: "green",
  Inactivo: "default",
  Bloqueado: "red",
}

export default function UsersTab({ role }: { role: TAccessRole }) {
  const { data: users = [], isLoading, error, refetch } = useRoleUsers(role.id)
  const { data: session } = useAuthSession()
  const currentUserId = Number(session?.user?.id)

  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<TAccessUser | null>(null)

  const filteredUsers = useMemo(() => {
    const term = normalizeText(search)
    if (!term) return users
    return users.filter((user) =>
      [user.fullName, user.email, user.userProfileName ?? ""].some((field) =>
        normalizeText(field).includes(term),
      ),
    )
  }, [users, search])

  const columns: ColumnsType<TAccessUser> = [
    {
      title: "Usuario",
      dataIndex: "fullName",
      render: (fullName: string, user) => (
        <>
          <strong>{fullName}</strong>
          {user.id === currentUserId && <Tag style={{ marginLeft: 6 }}>Tú</Tag>}
          <span className="rp-cell-secondary">{user.email}</span>
        </>
      ),
    },
    {
      title: "Perfil",
      dataIndex: "userProfileName",
    },
    {
      title: "Estado",
      dataIndex: "userStatusName",
      width: 120,
      render: (status?: string | null) =>
        status ? <Tag color={STATUS_COLORS[status] ?? "blue"}>{status}</Tag> : null,
    },
    {
      title: "Acciones",
      width: 150,
      render: (_, user) => {
        const isSelf = user.id === currentUserId
        return (
          <Tooltip title={isSelf ? "No puedes cambiar tu propio rol" : null}>
            <Button size="small" disabled={isSelf} onClick={() => setEditing(user)}>
              Cambiar rol
            </Button>
          </Tooltip>
        )
      },
    },
  ]

  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        title="No se pudieron cargar los usuarios"
        description={(error as Error).message}
        action={<Button onClick={() => refetch()}>Reintentar</Button>}
      />
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Buscar por nombre, correo o perfil..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <span className="rp-cell-secondary">
          Para crear usuarios o editar sus datos usa Parametrización › Usuarios.
        </span>
      </div>

      <Table<TAccessUser>
        rowKey="id"
        columns={columns}
        dataSource={filteredUsers}
        loading={isLoading}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: search ? "Ningún usuario coincide" : "Este rol no tiene usuarios" }}
      />

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Cambiar rol del usuario" size="md">
        {editing && (
          <ChangeRoleForm
            key={editing.id}
            user={editing}
            currentRole={role}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  )
}
