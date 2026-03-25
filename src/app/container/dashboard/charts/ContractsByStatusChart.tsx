"use client"

import { Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js"
import { TContract } from "@/core/interfaces/parameterization/types"
import { useAppTheme } from "@/themes/antdTheme"
import { Inbox } from "lucide-react"
import styles from "../dashboard.module.scss"

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  contracts: TContract[]
}

const colorPalette = [
  "#0F6F5C",
  "#6366F1",
  "#F59E0B",
  "#EF4444",
  "#10B981",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
]

export function ContractsByStatusChart({ contracts }: Props) {
  const { theme } = useAppTheme()
  const isDark = theme === "dark"

  if (contracts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateIcon}>
          <Inbox size={20} />
        </div>
        <p className={styles.emptyStateText}>No hay contratos registrados</p>
      </div>
    )
  }

  const statusCounts = contracts.reduce<Record<string, number>>((acc, c) => {
    const status = c.status || "Sin estado"
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const labels = Object.keys(statusCounts)
  const values = Object.values(statusCounts)
  const backgroundColors = labels.map((_, i) => colorPalette[i % colorPalette.length])

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: backgroundColors.map((c) => c + "DD"),
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
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8,
          font: { size: 12, family: "inherit" },
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
