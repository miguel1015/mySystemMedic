"use client"

import { Skeleton } from "antd"
import { SLOW_MESSAGES, useElapsedStage } from "@/core/hooks/useElapsedStage"
import styles from "./pageLoading.module.scss"

type PageLoadingProps = {
  // Texto para lectores de pantalla y para el aviso cuando la carga se demora.
  label?: string
}

// Carga del área de contenido: un esqueleto con la forma de una vista (encabezado,
// tarjetas y panel) en lugar de un spinner suelto. Aparece tras un breve retardo para no
// parpadear y, si tarda, explica qué está pasando.
export default function PageLoading({ label = "Cargando la vista" }: PageLoadingProps) {
  const stage = useElapsedStage()
  const slowMessage = stage === "slow" || stage === "verySlow" ? SLOW_MESSAGES[stage] : null

  return (
    <div
      className={styles.root}
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-visible={stage !== "hidden"}
    >
      <span className={styles.srOnly}>{slowMessage ?? label}</span>

      <div className={styles.header}>
        <Skeleton.Input active size="large" className={styles.title} />
        <Skeleton.Input active size="small" className={styles.subtitle} />
      </div>

      <div className={styles.cards}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={styles.panel}>
            <Skeleton active title={false} paragraph={{ rows: 2, width: ["60%", "40%"] }} />
          </div>
        ))}
      </div>

      <div className={styles.panel}>
        <Skeleton active paragraph={{ rows: 5 }} />
      </div>

      {slowMessage && (
        <p className={styles.notice} aria-hidden="true">
          {slowMessage}
        </p>
      )}
    </div>
  )
}
