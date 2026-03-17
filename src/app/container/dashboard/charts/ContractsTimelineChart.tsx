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

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface Props {
  contracts: TContract[]
}

const monthNames = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
]

export function ContractsTimelineChart({ contracts }: Props) {
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
        backgroundColor: (ctx: { dataIndex: number }) => {
          const canvas = document.createElement("canvas")
          const chartCtx = canvas.getContext("2d")
          if (!chartCtx) return "#0F6F5C"
          const gradient = chartCtx.createLinearGradient(0, 0, 0, 300)
          gradient.addColorStop(0, "#0F6F5C")
          gradient.addColorStop(1, "#1a9e7e88")
          return gradient
        },
        borderRadius: 8,
        borderSkipped: false,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(31, 61, 54, 0.95)",
        titleFont: { size: 14, weight: "bold" as const },
        bodyFont: { size: 13 },
        padding: 14,
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          label: (ctx: { parsed: { y: number } }) =>
            `${ctx.parsed.y} contrato${ctx.parsed.y !== 1 ? "s" : ""}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#9CA3AF",
          font: { size: 12 },
        },
        border: { display: false },
      },
      y: {
        grid: {
          color: "rgba(15, 111, 92, 0.06)",
        },
        ticks: {
          color: "#9CA3AF",
          font: { size: 12 },
          stepSize: 1,
        },
        border: { display: false },
      },
    },
    animation: {
      duration: 1400,
      easing: "easeOutQuart" as const,
    },
  }

  if (contracts.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: "#9CA3AF" }}>
        No hay contratos registrados
      </div>
    )
  }

  return <Bar data={data} options={options} />
}
