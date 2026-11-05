"use client"

import Link from "next/link"
import { ReactNode } from "react"
import { Alert, Button, Skeleton } from "antd"
import { useIsSlow } from "../utils"
import styles from "../dashboard.module.scss"

interface PanelProps {
  title: string
  // Enlace al módulo completo (p. ej. "Ver todas")
  link?: { href: string; label: string }
  className?: string
  children: ReactNode
}

export function Panel({ title, link, className, children }: PanelProps) {
  return (
    <section className={`${styles.panel} ${className ?? ""}`} aria-label={title}>
      <header className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>{title}</h2>
        {link && (
          <Link href={link.href} className={styles.panelLink}>
            {link.label}
          </Link>
        )}
      </header>
      {children}
    </section>
  )
}

interface QueryStateProps {
  isLoading: boolean
  isError: boolean
  isFetching: boolean
  refetch: () => void
  what: string
  rows?: number
  children: ReactNode
}

// Carga, error y contenido de una sección. Un error nunca se muestra como "0" ni como
// "no hay registros": se dice qué falló y se ofrece reintentar.
export function QueryState({ isLoading, isError, isFetching, refetch, what, rows = 3, children }: QueryStateProps) {
  const slow = useIsSlow(isLoading)

  if (isLoading) {
    return (
      <div aria-busy="true">
        <Skeleton active title={false} paragraph={{ rows }} />
        {slow && (
          <p className={styles.slowNote} role="status">
            El servidor está iniciando. La primera carga del día puede tardar hasta un minuto.
          </p>
        )}
      </div>
    )
  }

  if (isError) {
    return (
      <Alert
        type="warning"
        showIcon
        message={`No se pudieron cargar ${what}`}
        description="Revisa tu conexión e inténtalo de nuevo."
        action={
          <Button size="small" onClick={() => refetch()} loading={isFetching}>
            Reintentar
          </Button>
        }
      />
    )
  }

  return <>{children}</>
}
