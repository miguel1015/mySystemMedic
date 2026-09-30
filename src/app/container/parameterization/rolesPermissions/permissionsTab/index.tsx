"use client"

import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { Alert, Button, Empty, Input, Skeleton } from "antd"
import { SearchOutlined } from "@ant-design/icons"
import {
  useNavigationTree,
  useRolePermissions,
} from "@/core/hooks/parameterization/accessControl/useAccessControl"
import { useUpdateRolePermissions } from "@/core/hooks/parameterization/accessControl/useAccessControlMutations"
import { TAccessRole } from "@/core/interfaces/parameterization/accessControl"
import ModuleCard from "./moduleCard"
import {
  filterTree,
  sameSelection,
  Selection,
  selectionFromPermissions,
  selectionToRequest,
  toggleKeys,
  treeViewKeys,
  ViewKey,
} from "./permissionsState"

interface PermissionsTabProps {
  role: TAccessRole
  onDirtyChange: (dirty: boolean) => void
}

export default function PermissionsTab({ role, onDirtyChange }: PermissionsTabProps) {
  const tree = useNavigationTree()
  const permissions = useRolePermissions(role.id)
  const updatePermissions = useUpdateRolePermissions()

  const [search, setSearch] = useState("")
  const [draft, setDraft] = useState<Selection | null>(null)

  const allKeys = useMemo(() => treeViewKeys(tree.data ?? []), [tree.data])
  const visibleTree = useMemo(() => filterTree(tree.data ?? [], search), [tree.data, search])
  const visibleKeys = useMemo(() => treeViewKeys(visibleTree), [visibleTree])

  // El SuperAdmin ve todo aunque no tenga filas de permisos: se muestra todo marcado.
  const saved = useMemo<Selection | null>(() => {
    if (!permissions.data) return null
    return permissions.data.hasFullAccess ? new Set(allKeys) : selectionFromPermissions(permissions.data)
  }, [permissions.data, allKeys])

  // Al cargar (o tras guardar) el borrador parte de lo que hay en el servidor.
  useEffect(() => {
    setDraft(saved)
  }, [saved])

  const readOnly = role.hasFullAccess
  const dirty = !!draft && !!saved && !sameSelection(draft, saved)

  useEffect(() => {
    onDirtyChange(dirty)
  }, [dirty, onDirtyChange])

  useEffect(() => () => onDirtyChange(false), [onDirtyChange])

  // Avisa si se intenta cerrar o recargar la pestaña con cambios sin guardar.
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  if (tree.isLoading || permissions.isLoading || !draft) {
    if (tree.error || permissions.error) {
      return (
        <Alert
          type="error"
          showIcon
          title="No se pudieron cargar los permisos"
          description={((tree.error ?? permissions.error) as Error).message}
          action={
            <Button
              onClick={() => {
                tree.refetch()
                permissions.refetch()
              }}
            >
              Reintentar
            </Button>
          }
        />
      )
    }
    return <Skeleton active paragraph={{ rows: 8 }} />
  }

  const toggle = (keys: ViewKey[], checked: boolean) =>
    setDraft((current) => (current ? toggleKeys(current, keys, checked) : current))

  const save = () => {
    updatePermissions.mutate(
      { roleId: role.id, data: selectionToRequest(draft) },
      {
        onSuccess: () => toast.success(`Permisos de «${role.name}» guardados`),
        onError: (err: Error) => toast.error(err.message),
      },
    )
  }

  const selectedCount = allKeys.filter((key) => draft.has(key)).length

  return (
    <div>
      {readOnly ? (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          title="Este rol tiene acceso total"
          description="Ve todas las vistas, incluidas las que se agreguen en el futuro. Sus permisos no se editan."
        />
      ) : (
        !role.isActive && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            title="Este rol está inactivo"
            description="Puedes preparar sus permisos; no se podrá asignar a usuarios hasta activarlo."
          />
        )
      )}

      <div className="rp-toolbar">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Buscar vista..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        {!readOnly && (
          <>
            <Button onClick={() => toggle(visibleKeys, true)} disabled={visibleKeys.length === 0}>
              {search ? "Marcar resultados" : "Marcar todo"}
            </Button>
            <Button onClick={() => toggle(visibleKeys, false)} disabled={visibleKeys.length === 0}>
              {search ? "Desmarcar resultados" : "Desmarcar todo"}
            </Button>
          </>
        )}
        <span className="rp-counter">
          <strong>{selectedCount}</strong> de {allKeys.length} vistas permitidas
        </span>
      </div>

      {visibleTree.length === 0 ? (
        <Empty description={search ? "Ninguna vista coincide con la búsqueda" : "No hay vistas registradas"} />
      ) : (
        <div className="row g-3">
          {visibleTree.map((module) => (
            <div key={module.id} className="col-12 col-xl-6">
              <ModuleCard module={module} selection={draft} readOnly={readOnly} onToggle={toggle} />
            </div>
          ))}
        </div>
      )}

      {dirty && (
        <div className="rp-savebar">
          <span>
            Tienes cambios sin guardar en los permisos de <strong>{role.name}</strong>.
          </span>
          <div className="d-flex gap-2">
            <Button onClick={() => setDraft(saved)} disabled={updatePermissions.isPending}>
              Descartar
            </Button>
            <Button type="primary" onClick={save} loading={updatePermissions.isPending}>
              Guardar permisos
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
