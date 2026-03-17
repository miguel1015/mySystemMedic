"use client"

import { Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js"
import { TContract } from "@/core/interfaces/parameterization/types"

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  contracts: TContract[]
}

export function ContractsByStatusChart({ contracts }: Props) {
  const statusCounts = contracts.reduce<Record<string, number>>((acc, c) => {
    const status = c.status || "Sin estado"
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const labels = Object.keys(statusCounts)
  const values = Object.values(statusCounts)

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

  const backgroundColors = labels.map((_, i) => colorPalette[i % colorPalette.length])
  const hoverColors = labels.map((_, i) => colorPalette[i % colorPalette.length] + "CC")

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: hoverColors,
        borderWidth: 0,
        spacing: 4,
        borderRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyleWidth: 12,
          font: {
            size: 13,
            family: "inherit",
          },
          color: "#374151",
        },
      },
      tooltip: {
        backgroundColor: "rgba(31, 61, 54, 0.95)",
        titleFont: { size: 14, weight: "bold" as const },
        bodyFont: { size: 13 },
        padding: 14,
        cornerRadius: 12,
        displayColors: true,
        boxPadding: 6,
      },
    },
    animation: {
      animateRotate: true,
      duration: 1200,
    },
  }

  if (contracts.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: "#9CA3AF" }}>
        No hay contratos registrados
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "360px", margin: "0 auto" }}>
      <Doughnut data={data} options={options} />
    </div>
  )
}
