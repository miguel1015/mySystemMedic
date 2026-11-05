"use client"

import { CSSProperties, ReactNode } from "react"
import { Button, Dropdown, Tooltip } from "antd"
import type { MenuProps } from "antd"
import { EditOutlined, MoreOutlined } from "@ant-design/icons"
import styles from "./dataTable.module.scss"

// Tonos para los avatares. El tono sale del nombre, así cada persona conserva su color
// en todas las pantallas. Los colores finales (claro/oscuro) se calculan en CSS.
const HUES = [160, 200, 230, 265, 320, 15, 40]

function hueFor(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return HUES[h % HUES.length]
}

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  const first = parts[0][0]
  // Primer nombre + primer apellido cuando hay 3 o más palabras ("Luis Jose Garcia Perez" -> LG).
  const second = parts.length >= 3 ? parts[parts.length - 2][0] : parts[1]?.[0] ?? ""
  return (first + second).toLocaleUpperCase("es-CO")
}

export function Avatar({ name, size = 34 }: { name: string; size?: number }) {
  return (
    <span
      className={styles.avatar}
      style={{ "--hue": hueFor(name), width: size, height: size, fontSize: size * 0.38 } as CSSProperties}
      aria-hidden
    >
      {initialsOf(name)}
    </span>
  )
}

/** Celda de persona: avatar + nombre en negrita + una línea secundaria (p. ej. documento). */
export function PersonCell({ name, detail }: { name: string; detail?: ReactNode }) {
  return (
    <span className={styles.person}>
      <Avatar name={name} />
      <span className={styles.personText}>
        <span className={styles.personName}>{name}</span>
        {detail && <span className={styles.personDetail}>{detail}</span>}
      </span>
    </span>
  )
}

/** "CC" + "1952654" -> "CC 1.952.654". Solo agrega puntos a documentos numéricos. */
export function formatDocument(type?: string | null, number?: string | null) {
  const n = (number ?? "").trim()
  const pretty = /^\d+$/.test(n) ? Number(n).toLocaleString("es-CO") : n
  return [type, pretty].filter(Boolean).join(" ")
}

export interface RowMenuItem {
  key: string
  label: string
  icon?: ReactNode
  danger?: boolean
  onClick: () => void
}

/**
 * Acciones de fila: editar como ícono (la acción frecuente) y el resto en un menú "⋯".
 * Se atenúan en reposo y se iluminan al pasar por la fila (ver CSS).
 */
export function RowActions({
  onEdit,
  editLabel = "Editar",
  items = [],
  subject,
}: {
  onEdit?: () => void
  editLabel?: string
  items?: RowMenuItem[]
  // Para lectores de pantalla: "Editar a Luis Jose Garcia Perez"
  subject?: string
}) {
  const menu: MenuProps = {
    items: items.map((i) => ({ key: i.key, label: i.label, icon: i.icon, danger: i.danger })),
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
            icon={<EditOutlined />}
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
