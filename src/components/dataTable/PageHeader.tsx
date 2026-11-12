"use client"

import { ReactNode } from "react"
import styles from "./dataTable.module.scss"

interface Props {
  icon?: ReactNode
  title: ReactNode
  // Etiqueta junto al título (estado de la admisión, etc.).
  badge?: ReactNode
  // Línea de contexto bajo el título: "19 pacientes registrados"
  subtitle?: ReactNode
  actions?: ReactNode
}

/** Encabezado de una vista de listado: título, contexto y la acción principal. */
export default function PageHeader({ icon, title, badge, subtitle, actions }: Props) {
  return (
    <header className={styles.pageHeader}>
      <div className={styles.pageHeading}>
        {icon && (
          <span className={styles.pageIcon} aria-hidden>
            {icon}
          </span>
        )}
        <div>
          <div className={styles.pageTitleRow}>
            <h1 className={styles.pageTitle}>{title}</h1>
            {badge}
          </div>
          {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
        </div>
      </div>
      {actions && <div className={styles.pageActions}>{actions}</div>}
    </header>
  )
}
