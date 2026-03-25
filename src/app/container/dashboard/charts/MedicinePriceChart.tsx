"use client"

import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js"
import { TMedicine } from "@/core/interfaces/parameterization/types"
import { useAppTheme } from "@/themes/antdTheme"
import { Inbox } from "lucide-react"
import styles from "../dashboard.module.scss"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface Props {
  medicines: TMedicine[]
}

export function MedicinePriceChart({ medicines }: Props) {
  const { theme } = useAppTheme()
  const isDark = theme === "dark"

  if (medicines.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateIcon}>
          <Inbox size={20} />
        </div>
        <p className={styles.emptyStateText}>No hay medicamentos registrados</p>
      </div>
    )
  }

  const sorted = [...medicines]
    .filter((m) => m.price > 0)
    .sort((a, b) => b.price - a.price)
    .slice(0, 10)

  const labels = sorted.map((m) =>
    m.name.length > 22 ? m.name.substring(0, 22) + "..." : m.name
  )
  const values = sorted.map((m) => m.price)

  const barColor = isDark ? "rgba(129, 140, 248, 0.6)" : "rgba(99, 102, 241, 0.7)"
  const barHoverColor = isDark ? "rgba(129, 140, 248, 0.8)" : "rgba(99, 102, 241, 0.9)"
  const gridColor = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)"
  const tickColor = isDark ? "#6b7280" : "#9ca3af"
  const labelColor = isDark ? "#9ca3af" : "#6b7280"

  const data = {
    labels,
    datasets: [
      {
        label: "Precio",
        data: values,
        backgroundColor: barColor,
        hoverBackgroundColor: barHoverColor,
        borderRadius: 4,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? "#1f2937" : "#111827",
        titleFont: { size: 12, weight: "bold" as const },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        borderColor: isDark ? "#374151" : "transparent",
        borderWidth: isDark ? 1 : 0,
        callbacks: {
          label: (ctx: { parsed: { x: number } }) =>
            `$${ctx.parsed.x.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: {
          color: tickColor,
          font: { size: 11 },
          callback: (value: string | number) =>
            `$${Number(value).toLocaleString()}`,
        },
        border: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: { color: labelColor, font: { size: 11 } },
        border: { display: false },
      },
    },
    animation: {
      duration: 800,
      easing: "easeOutQuart" as const,
    },
  }

  return (
    <div style={{ height: "160px" }}>
      <Bar data={data} options={options} />
    </div>
  )
}
