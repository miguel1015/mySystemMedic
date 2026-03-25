"use client"

import { Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js"
import { TTariffs } from "@/core/interfaces/parameterization/types"
import { useAppTheme } from "@/themes/antdTheme"
import { Inbox } from "lucide-react"
import styles from "../dashboard.module.scss"

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  tariffs: TTariffs[]
}

const colorPalette = [
  "#10B981",
  "#0F6F5C",
  "#059669",
  "#34D399",
  "#6EE7B7",
  "#F59E0B",
  "#6366F1",
  "#EC4899",
]

export function TariffDistributionChart({ tariffs }: Props) {
  const { theme } = useAppTheme()
  const isDark = theme === "dark"

  if (tariffs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateIcon}>
          <Inbox size={20} />
        </div>
        <p className={styles.emptyStateText}>No hay tarifarios registrados</p>
      </div>
    )
  }

  const codingGroups = tariffs.reduce<Record<string, number>>((acc, t) => {
    const group = t.codingId || "Sin codigo"
    acc[group] = (acc[group] || 0) + 1
    return acc
  }, {})

  const entries = Object.entries(codingGroups)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  const labels = entries.map(([key]) => key)
  const values = entries.map(([, val]) => val)

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colorPalette.slice(0, labels.length),
        hoverBackgroundColor: colorPalette.slice(0, labels.length).map((c) => c + "DD"),
        borderWidth: 0,
        spacing: 3,
        borderRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "72%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 14,
          usePointStyle: true,
          pointStyleWidth: 8,
          font: { size: 11, family: "inherit" },
          color: isDark ? "#9ca3af" : "#6b7280",
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#1f2937" : "#111827",
        titleFont: { size: 13, weight: "bold" as const },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 4,
        borderColor: isDark ? "#374151" : "transparent",
        borderWidth: isDark ? 1 : 0,
      },
    },
    animation: {
      animateRotate: true,
      duration: 800,
    },
  }

  return (
    <div style={{ maxWidth: "190px", margin: "0 auto" }}>
      <Doughnut data={data} options={options} />
    </div>
  )
}
