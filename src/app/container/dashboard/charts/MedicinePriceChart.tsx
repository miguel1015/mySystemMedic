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

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface Props {
  medicines: TMedicine[]
}

export function MedicinePriceChart({ medicines }: Props) {
  const sorted = [...medicines]
    .filter((m) => m.price > 0)
    .sort((a, b) => b.price - a.price)
    .slice(0, 10)

  const labels = sorted.map((m) =>
    m.name.length > 20 ? m.name.substring(0, 20) + "..." : m.name
  )
  const values = sorted.map((m) => m.price)

  const gradientColors = sorted.map((_, i) => {
    const ratio = i / Math.max(sorted.length - 1, 1)
    const r = Math.round(99 + (139 - 99) * ratio)
    const g = Math.round(102 + (92 - 102) * ratio)
    const b = Math.round(241 + (246 - 241) * ratio)
    return `rgb(${r}, ${g}, ${b})`
  })

  const data = {
    labels,
    datasets: [
      {
        label: "Precio",
        data: values,
        backgroundColor: gradientColors,
        borderRadius: 8,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    indexAxis: "y" as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(99, 102, 241, 0.95)",
        titleFont: { size: 13, weight: "bold" as const },
        bodyFont: { size: 13 },
        padding: 14,
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          label: (ctx: { parsed: { x: number } }) =>
            `$${ctx.parsed.x.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(99, 102, 241, 0.06)",
        },
        ticks: {
          color: "#9CA3AF",
          font: { size: 12 },
          callback: (value: string | number) =>
            `$${Number(value).toLocaleString()}`,
        },
        border: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: "#6B7280",
          font: { size: 11 },
        },
        border: { display: false },
      },
    },
    animation: {
      duration: 1400,
      easing: "easeOutQuart" as const,
    },
  }

  if (medicines.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: "#9CA3AF" }}>
        No hay medicamentos registrados
      </div>
    )
  }

  return <Bar data={data} options={options} />
}
