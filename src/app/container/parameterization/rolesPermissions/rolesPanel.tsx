"use client"

import { useMemo, useState } from "react"
import { Button, Empty, Input, Tag } from "antd"
import { PlusOutlined, SearchOutlined } from "@ant-design/icons"
import { TAccessRole } from "@/core/interfaces/parameterization/accessControl"
import { normalizeText } from "./permissionsTab/permissionsState"

// Orden: acceso total, roles del sistema, activos y al final los inactivos.
export function sortRoles(roles: TAccessRole[]) {
  const rank = (role: TAccessRole) =>
    role.hasFullAccess ? 0 : role.isSystem ? 1 : role.isActive ? 2 : 3
  return [...roles].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, "es"))
}

interface RolesPanelProps {
  roles: TAccessRole[]
  selectedId?: number
  onSelect: (role: TAccessRole) => void
  onCreate: () => void
}

export default function RolesPanel({ roles, selectedId, onSelect, onCreate }: RolesPanelProps) {
  const [search, setSearch] = useState("")

  const visibleRoles = useMemo(() => {
    const term = normalizeText(search)
    return term ? roles.filter((role) => normalizeText(role.name).includes(term)) : roles
  }, [roles, search])

  return (
    <div className="rp-panel">
      <div className="d-flex justify-content-between align-items-center gap-2">
        <strong>Roles ({roles.length})</strong>
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
          Nuevo rol
        </Button>
      </div>

      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder="Buscar rol..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginTop: 12 }}
      />

      <div className="rp-roles-list" role="listbox" aria-label="Roles">
        {visibleRoles.length === 0 && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Ningún rol coincide" />
        )}

        {visibleRoles.map((role) => {
          const selected = role.id === selectedId
          return (
            <button
              key={role.id}
              type="button"
              role="option"
              aria-selected={selected}
              className={`rp-role-item${selected ? " is-selected" : ""}${role.isActive ? "" : " is-inactive"}`}
              onClick={() => onSelect(role)}
            >
              <div className="rp-role-name">
                {role.name}
                {role.hasFullAccess && <Tag color="purple">Acceso total</Tag>}
                {role.isSystem && !role.hasFullAccess && <Tag color="gold">Sistema</Tag>}
                {!role.isActive && <Tag>Inactivo</Tag>}
              </div>
              {role.description && <div className="rp-role-description">{role.description}</div>}
              <div className="rp-role-meta">
                <span>
                  {role.userCount} {role.userCount === 1 ? "usuario" : "usuarios"}
                </span>
                <span>
                  {role.profileCount} {role.profileCount === 1 ? "perfil" : "perfiles"}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
