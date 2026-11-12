"use client"

import { ReactNode } from "react"
import { Button, Dropdown, Tooltip } from "antd"
import type { MenuProps } from "antd"
import { EditOutlined, MoreOutlined } from "@ant-design/icons"
import styles from "./dataTable.module.scss"

/** Celda de persona: nombre en negrita + una línea secundaria (p. ej. documento). */
export function PersonCell({ name, detail }: { name: string; detail?: ReactNode }) {
  return (
    <span className={styles.personText}>
      <span className={styles.personName}>{name}</span>
      {detail && <span className={styles.personDetail}>{detail}</span>}
    </span>
  )
}

/** "CC" + "1952654" -> "CC 1.952.654". Solo agrega puntos a documentos numéricos. */
export function formatDocument(type?: string | null, number?: string | null) {
  const n = (number ?? "").trim()
  const pretty = /^\d+$/.test(n) ? Number(n).toLocaleString("es-CO") : n
  return [type, pretty].filter(Boolean).join(" ")
}

const cop = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/** 125000 -> "$ 125.000"; sin valor -> "—". */
export function formatCOP(value?: number | null, empty = "—") {
  return value === null || value === undefined || Number.isNaN(value) ? empty : cop.format(value)
}

export interface RowMenuItem {
  key: string
  label: string
  icon?: ReactNode
  danger?: boolean
  // Visible pero no disponible para esta fila (p. ej. editar una admisión cerrada).
  disabled?: boolean
  // Línea separadora antes del ítem (p. ej. para apartar la acción peligrosa).
  dividerBefore?: boolean
  onClick: () => void
}

/**
 * Acciones de fila: editar como ícono (la acción frecuente) y el resto en un menú "⋯".
 * Se atenúan en reposo y se iluminan al pasar por la fila (ver CSS).
 */
export function RowActions({
  onEdit,
  editLabel = "Editar",
  editIcon = <EditOutlined />,
  items = [],
  subject,
}: {
  onEdit?: () => void
  editLabel?: string
  // Ícono de la acción principal (por defecto el lápiz de editar; p. ej. un PDF para "Ver PDF").
  editIcon?: ReactNode
  items?: RowMenuItem[]
  // Para lectores de pantalla: "Editar a Luis Jose Garcia Perez"
  subject?: string
}) {
  const menu: MenuProps = {
    items: items.flatMap((i) => [
      ...(i.dividerBefore ? [{ type: "divider" as const, key: `${i.key}-divider` }] : []),
      { key: i.key, label: i.label, icon: i.icon, danger: i.danger, disabled: i.disabled },
    ]),
    onClick: ({ key, domEvent }) => {
      domEvent.stopPropagation()
      items.find((i) => i.key === key)?.onClick()
    },
  }

  return (
    <span className={styles.actions} onClick={(e) => e.stopPropagation()}>
      {onEdit && (
        <Tooltip title={editLabel}>
          <Button
            type="text"
            icon={editIcon}
            onClick={onEdit}
            aria-label={subject ? `${editLabel} a ${subject}` : editLabel}
          />
        </Tooltip>
      )}
      {items.length > 0 && (
        <Dropdown menu={menu} trigger={["click"]} placement="bottomRight">
          <Button
            type="text"
            icon={<MoreOutlined />}
            aria-label={subject ? `Más acciones para ${subject}` : "Más acciones"}
          />
        </Dropdown>
      )}
    </span>
  )
}
