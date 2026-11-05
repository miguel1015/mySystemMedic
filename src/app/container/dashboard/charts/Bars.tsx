"use client"

import { CSSProperties, ReactNode } from "react"
import { Tooltip } from "antd"
import { formatNumber } from "../utils"
import styles from "../dashboard.module.scss"

interface HBarsProps {
  items: { label: string; value: number }[]
  color: string
  // ["admisión", "admisiones"]
  unit: [string, string]
}

// Barras horizontales de una sola serie: etiqueta a la izquierda, valor en la punta.
// Crecen desde la base al mostrarse la vista (la key del padre reinicia la animación).
export function HBars({ items, color, unit }: HBarsProps) {
  const max = Math.max(...items.map((i) => i.value), 1)

  return (
    <ul className={styles.hbars}>
      {items.map((item, i) => (
        <li key={item.label} className={styles.hbar}>
          <span className={styles.hbarHead}>
            <span className={styles.hbarLabel}>{item.label}</span>
            <span className={styles.hbarValue}>{formatNumber(item.value)}</span>
          </span>
          <Tooltip title={`${item.label}: ${formatNumber(item.value)} ${item.value === 1 ? unit[0] : unit[1]}`}>
            <span
              className={`${styles.hbarFill} ${item.value === 0 ? styles.hbarZero : ""}`}
              style={
                {
                  width: `${(item.value / max) * 100}%`,
                  background: color,
                  "--delay": `${i * 70}ms`,
                } as CSSProperties
              }
            />
          </Tooltip>
        </li>
      ))}
    </ul>
  )
}

interface SegmentedProps {
  segments: { label: string; value: number; color: string; icon: ReactNode }[]
  unit: [string, string]
}

// Un total dividido en partes (p. ej. estado ante la DIAN). La leyenda lleva icono,
// texto y conteo: el estado nunca depende solo del color.
export function SegmentedBar({ segments, unit }: SegmentedProps) {
  const total = segments.reduce((acc, s) => acc + s.value, 0)
  const visible = segments.filter((s) => s.value > 0)

  return (
    <div>
      <div className={styles.segmented} aria-hidden>
        {visible.map((s, i) => (
          <Tooltip key={s.label} title={`${s.label}: ${formatNumber(s.value)}`}>
            <span
              className={styles.segment}
              style={{ flexGrow: s.value, background: s.color, "--delay": `${i * 90}ms` } as CSSProperties}
            />
          </Tooltip>
        ))}
      </div>
      <ul className={styles.segLegend}>
        {segments.map((s) => (
          <li key={s.label} className={styles.segItem}>
            <span className={styles.segIcon} style={{ color: s.color }} aria-hidden>
              {s.icon}
            </span>
            <span className={styles.segLabel}>{s.label}</span>
            <span className={styles.segValue}>
              {formatNumber(s.value)}
              <span className={styles.segPct}>
                {total > 0 ? ` (${Math.round((s.value / total) * 100)} %)` : ""}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p className={styles.srOnly}>
        {`${formatNumber(total)} ${total === 1 ? unit[0] : unit[1]} en total.`}
      </p>
    </div>
  )
}
