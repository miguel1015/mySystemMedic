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
import { TContract } from "@/core/interfaces/parameterization/types"
import { useAppTheme } from "@/themes/antdTheme"
import { Inbox } from "lucide-react"
import styles from "../dashboard.module.scss"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface Props {
  contracts: TContract[]
}

const monthNames = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
]

export function ContractsTimelineChart({ contracts }: Props) {
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

  const monthCounts = new Array(12).fill(0)
  contracts.forEach((c) => {
    if (c.startDate) {
      const date = new Date(c.startDate)
      if (!isNaN(date.getTime())) {
        monthCounts[date.getMonth()]++
      }
    }
  })

  const data = {
    labels: monthNames,
    datasets: [
      {
        label: "Contratos iniciados",
        data: monthCounts,
        backgroundColor: isDark ? "rgba(99, 102, 241, 0.6)" : "rgba(15, 111, 92, 0.75)",
        hoverBackgroundColor: isDark ? "rgba(99, 102, 241, 0.8)" : "rgba(15, 111, 92, 0.9)",
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.55,
        categoryPercentage: 0.7,
      },
    ],
  }

  const gridColor = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)"
  const tickColor = isDark ? "#6b7280" : "#9ca3af"

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? "#1f2937" : "#111827",
        titleFont: { size: 13, weight: "bold" as const },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        borderColor: isDark ? "#374151" : "transparent",
        borderWidth: isDark ? 1 : 0,
        callbacks: {
          label: (ctx: { parsed: { y: number } }) =>
            `${ctx.parsed.y} contrato${ctx.parsed.y !== 1 ? "s" : ""}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: tickColor, font: { size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: tickColor, font: { size: 11 }, stepSize: 1 },
        border: { display: false },
      },
    },
    animation: {
      duration: 800,
      easing: "easeOutQuart" as const,
    },
  }

  return <Bar data={data} options={options} />
}
