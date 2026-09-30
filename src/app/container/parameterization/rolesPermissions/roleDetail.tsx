"use client"

import { Button, Tabs, Tag, Tooltip } from "antd"
import { EditOutlined } from "@ant-design/icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUserShield } from "@fortawesome/free-solid-svg-icons"
import { TAccessRole } from "@/core/interfaces/parameterization/accessControl"
import PermissionsTab from "./permissionsTab"
import ProfilesTab from "./profilesTab"
import UsersTab from "./usersTab"

interface RoleDetailProps {
  role: TAccessRole
  onEdit: () => void
  onToggleActive: () => void
  onDirtyChange: (dirty: boolean) => void
}

function toggleBlockedReason(role: TAccessRole) {
  if (role.isSystem) return "Es un rol del sistema: no se puede desactivar"
  if (role.isActive && role.userCount > 0)
    return "Tiene usuarios activos: asígnales otro rol antes de desactivarlo"
  return null
}

export default function RoleDetail({ role, onEdit, onToggleActive, onDirtyChange }: RoleDetailProps) {
  const blockedReason = toggleBlockedReason(role)

  return (
    <div className="rp-panel">
      <div className="rp-detail-header">
        <div className="rp-detail-title">
          <div className="rp-detail-avatar" aria-hidden>
            <FontAwesomeIcon icon={faUserShield} />
          </div>
          <div>
            <h4>
              {role.name}{" "}
              {role.hasFullAccess && <Tag color="purple">Acceso total</Tag>}
              {role.isSystem && !role.hasFullAccess && <Tag color="gold">Sistema</Tag>}
              <Tag color={role.isActive ? "green" : "default"}>{role.isActive ? "Activo" : "Inactivo"}</Tag>
            </h4>
            <p>{role.description || "Sin descripción"}</p>
          </div>
        </div>

        <div className="d-flex gap-2">
          <Button icon={<EditOutlined />} onClick={onEdit}>
            Editar
          </Button>
          <Tooltip title={blockedReason}>
            <Button danger={role.isActive} disabled={!!blockedReason} onClick={onToggleActive}>
              {role.isActive ? "Desactivar" : "Activar"}
            </Button>
          </Tooltip>
        </div>
      </div>

      <Tabs
        destroyOnHidden={false}
        items={[
          {
            key: "permissions",
            label: "Vistas y permisos",
            children: <PermissionsTab role={role} onDirtyChange={onDirtyChange} />,
          },
          {
            key: "profiles",
            label: `Perfiles (${role.profileCount})`,
            children: <ProfilesTab role={role} />,
          },
          {
            key: "users",
            label: `Usuarios (${role.userCount})`,
            children: <UsersTab role={role} />,
          },
        ]}
      />
    </div>
  )
}
