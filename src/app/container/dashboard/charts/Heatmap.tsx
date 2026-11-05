"use client"

import { CSSProperties } from "react"
import { Tooltip } from "antd"
import { useAppTheme } from "@/themes/antdTheme"
import { formatNumber } from "../utils"
import styles from "../dashboard.module.scss"

// Rampa secuencial de un solo tono (esmeralda de marca), de claro a oscuro. En modo
// oscuro se invierte la luminosidad: más dato = más claro sobre la superficie oscura.
const RAMP = {
  light: ["#d6efe6", "#9fd8c3", "#5fbf9c", "#2a9a75", "#0f6f5c"],
  dark: ["#163f35", "#1d5e4d", "#258068", "#35a585", "#5fd3ad"],
}

interface Props {
  rows: string[] // etiquetas de fila (días)
  cols: string[] // etiquetas de columna (franjas)
  values: number[][] // values[fila][columna]
  describe: (row: number, col: number, value: number) => string
}

// Mapa de calor día × franja horaria. Los cuadros aparecen en una ola diagonal al
// mostrarse la vista; la key del padre reinicia la animación.
export function Heatmap({ rows, cols, values, describe }: Props) {
  const { theme } = useAppTheme()
  const ramp = theme === "dark" ? RAMP.dark : RAMP.light
  const max = Math.max(1, ...values.flat())

  const colorFor = (v: number) => {
    if (v === 0) return undefined
    const step = Math.min(ramp.length - 1, Math.ceil((v / max) * ramp.length) - 1)
    return ramp[Math.max(0, step)]
  }

  return (
    <div className={styles.heatmap}>
      <div
        className={styles.heatGrid}
        style={{ gridTemplateColumns: `auto repeat(${cols.length}, minmax(0, 1fr))` } as CSSProperties}
        role="img"
        aria-label="Mapa de calor de triages por día y franja horaria"
      >
        {rows.map((row, r) => (
          <div key={row} className={styles.heatRow}>
            <span className={styles.heatRowLabel}>{row}</span>
            {cols.map((col, c) => {
              const v = values[r][c]
              return (
                <Tooltip key={col} title={describe(r, c, v)} mouseEnterDelay={0.05}>
                  <span
                    className={styles.heatCell}
                    style={
                      {
                        background: colorFor(v),
                        "--delay": `${(r + c) * 28}ms`,
                      } as CSSProperties
                    }
                  />
                </Tooltip>
              )
            })}
          </div>
        ))}
        <div className={styles.heatRow}>
          <span />
          {cols.map((col, c) => (
            <span key={col} className={styles.heatColLabel}>
              {c % 2 === 0 ? col : ""}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.heatLegend} aria-hidden>
        <span>Menos</span>
        <span className={styles.heatCell} data-static />
        {ramp.map((c) => (
          <span key={c} className={styles.heatCell} data-static style={{ background: c }} />
        ))}
        <span>Más (hasta {formatNumber(max)})</span>
      </div>

      {/* El srOnly va en un div: una tabla ignora el alto de 1 px y estiraría la página. */}
      <div className={styles.srOnly}>
      <table>
        <caption>Triages por día y franja horaria</caption>
        <thead>
          <tr>
            <th scope="col">Día</th>
            {cols.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={row}>
              <th scope="row">{row}</th>
              {cols.map((c, ci) => (
                <td key={c}>{values[r][ci]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}
