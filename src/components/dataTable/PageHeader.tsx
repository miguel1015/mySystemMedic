"use client"

import { ReactNode } from "react"
import styles from "./dataTable.module.scss"

interface Props {
  icon?: ReactNode
  title: string
  // Línea de contexto bajo el título: "19 pacientes registrados"
  subtitle?: ReactNode
  actions?: ReactNode
}

/** Encabezado de una vista de listado: título, contexto y la acción principal. */
export default function PageHeader({ icon, title, subtitle, actions }: Props) {
  return (
    <header className={styles.pageHeader}>
      <div className={styles.pageHeading}>
        {icon && (
          <span className={styles.pageIcon} aria-hidden>
            {icon}
          </span>
        )}
        <div>
          <h1 className={styles.pageTitle}>{title}</h1>
          {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
        </div>
      </div>
      {actions && <div className={styles.pageActions}>{actions}</div>}
    </header>
  )
}
