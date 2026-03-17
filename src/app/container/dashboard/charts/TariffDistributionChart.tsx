"use client"

import { Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js"
import { TTariffs } from "@/core/interfaces/parameterization/types"

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  tariffs: TTariffs[]
}

export function TariffDistributionChart({ tariffs }: Props) {
  const codingGroups = tariffs.reduce<Record<string, number>>((acc, t) => {
    const group = t.codingId || "Sin código"
    acc[group] = (acc[group] || 0) + 1
    return acc
  }, {})

  const entries = Object.entries(codingGroups)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  const labels = entries.map(([key]) => key)
  const values = entries.map(([, val]) => val)

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

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colorPalette.slice(0, labels.length),
        hoverBackgroundColor: colorPalette.slice(0, labels.length).map((c) => c + "CC"),
        borderWidth: 0,
        spacing: 4,
        borderRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "65%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 12,
          font: {
            size: 12,
            family: "inherit",
          },
          color: "#374151",
        },
      },
      tooltip: {
        backgroundColor: "rgba(16, 185, 129, 0.95)",
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
      duration: 1400,
    },
  }

  if (tariffs.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: "#9CA3AF" }}>
        No hay tarifarios registrados
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "360px", margin: "0 auto" }}>
      <Doughnut data={data} options={options} />
    </div>
  )
}
