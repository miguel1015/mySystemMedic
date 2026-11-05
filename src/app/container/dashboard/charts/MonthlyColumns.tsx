"use client"

import { useMemo } from "react"
import { Bar } from "react-chartjs-2"
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
  type ScriptableContext,
  type TooltipItem,
} from "chart.js"
import { useAppTheme } from "@/themes/antdTheme"
import { cssVar, formatNumber } from "../utils"
import styles from "../dashboard.module.scss"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

export interface ColumnSeries {
  label: string
  color: string
  values: number[]
}

interface Props {
  months: { short: string; long: string }[]
  series: ColumnSeries[]
  // Unidad para el tooltip y la tabla: ["triage", "triages"]
  unit: [string, string]
  ariaLabel: string
  height?: number
}

// Columnas por mes (una serie o apiladas). Specs de la skill dataviz: barra ≤ 24 px, 4 px
// redondeados solo en el extremo de datos, 2 px de superficie entre segmentos apilados,
// grilla de 1 px recesiva y texto con tokens, nunca con el color de la serie.
export function MonthlyColumns({ months, series, unit, ariaLabel, height = 240 }: Props) {
  const { theme } = useAppTheme()
  const isDark = theme === "dark"
  const stacked = series.length > 1

  const { data, options } = useMemo(() => {
    const surface = cssVar("--dash-surface", isDark ? "#11151a" : "#ffffff")
    const textSecondary = cssVar("--dash-text-secondary", isDark ? "#9aa8a3" : "#5b6b66")
    const grid = cssVar("--dash-border-subtle", isDark ? "#1a2027" : "#eef2f1")
    const plural = (n: number) => `${formatNumber(n)} ${n === 1 ? unit[0] : unit[1]}`

    // Solo el segmento superior de cada columna lleva las esquinas redondeadas.
    const topIndex = (dataIndex: number) => {
      for (let s = series.length - 1; s >= 0; s--) if (series[s].values[dataIndex] > 0) return s
      return -1
    }

    return {
      data: {
        labels: months.map((m) => m.short),
        datasets: series.map((s, si) => ({
          label: s.label,
          data: s.values,
          backgroundColor: s.color,
          hoverBackgroundColor: s.color,
          borderColor: surface,
          borderWidth: stacked ? { top: 2 } : 0,
          borderSkipped: "bottom" as const,
          borderRadius: (ctx: ScriptableContext<"bar">) =>
            topIndex(ctx.dataIndex) === si
              ? { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }
              : 0,
          maxBarThickness: 24,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900, easing: "easeOutQuart" as const },
        interaction: { mode: "index" as const, intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? "#1b2128" : "#0f1f1b",
            borderColor: isDark ? "#2a333c" : "transparent",
            borderWidth: isDark ? 1 : 0,
            padding: 12,
            cornerRadius: 10,
            boxPadding: 4,
            usePointStyle: true,
            titleFont: { weight: "bold" as const },
            filter: (item: TooltipItem<"bar">) => stacked ? (item.raw as number) > 0 : true,
            callbacks: {
              title: (items: TooltipItem<"bar">[]) => {
                const m = months[items[0]?.dataIndex ?? 0]?.long ?? ""
                return m.charAt(0).toUpperCase() + m.slice(1)
              },
              label: (item: TooltipItem<"bar">) =>
                stacked ? ` ${item.dataset.label}: ${formatNumber(item.raw as number)}` : ` ${plural(item.raw as number)}`,
              footer: (items: TooltipItem<"bar">[]) => {
                if (!stacked) return ""
                const total = series.reduce((acc, s) => acc + s.values[items[0]?.dataIndex ?? 0], 0)
                return `Total: ${plural(total)}`
              },
            },
          },
        },
        scales: {
          x: {
            stacked,
            grid: { display: false },
            border: { display: false },
            ticks: { color: textSecondary, font: { size: 12 } },
          },
          y: {
            stacked,
            beginAtZero: true,
            grid: { color: grid },
            border: { display: false },
            ticks: { color: textSecondary, font: { size: 12 }, precision: 0, maxTicksLimit: 5 },
          },
        },
      },
    }
  }, [months, series, unit, isDark, stacked])

  return (
    <>
      <div style={{ height }} role="img" aria-label={ariaLabel}>
        <Bar data={data} options={options} />
      </div>
      {/* El srOnly va en un div: una tabla ignora el alto de 1 px y estiraría la página. */}
      <div className={styles.srOnly}>
      <table>
        <caption>{ariaLabel}</caption>
        <thead>
          <tr>
            <th scope="col">Mes</th>
            {series.map((s) => (
              <th key={s.label} scope="col">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {months.map((m, i) => (
            <tr key={m.long}>
              <th scope="row">{m.long}</th>
              {series.map((s) => (
                <td key={s.label}>{s.values[i]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  )
}
