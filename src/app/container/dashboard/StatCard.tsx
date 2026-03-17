"use client"

import { motion, useMotionValue, useTransform } from "framer-motion"
import { CSSProperties, useEffect, useState } from "react"

const s = (style: CSSProperties) => style

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: number
  subtitle: string
  color: string
  gradient: string
  delay: number
}

function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    if (start === end) return

    const increment = end / (duration * 60)
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setDisplay(end)
        clearInterval(timer)
      } else {
        setDisplay(Math.floor(current))
      }
    }, 1000 / 60)

    return () => clearInterval(timer)
  }, [value, duration])

  return <>{display.toLocaleString()}</>
}

export function StatCard({ icon, title, value, subtitle, color, gradient, delay }: StatCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const cardStyle: CSSProperties = {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.6)",
    boxShadow: isHovered
      ? `0 20px 60px ${color}22, 0 8px 24px rgba(0,0,0,0.06)`
      : "0 8px 32px rgba(15, 111, 92, 0.06)",
    padding: "28px",
    position: "relative",
    overflow: "hidden",
    cursor: "default",
    transition: "box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
  }

  const decorStyle: CSSProperties = {
    position: "absolute",
    top: "-20px",
    right: "-20px",
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: gradient,
    opacity: 0.08,
    transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s",
    transform: isHovered ? "scale(1.8)" : "scale(1)",
  }

  const iconContainerStyle: CSSProperties = {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: gradient,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    marginBottom: "16px",
    boxShadow: `0 4px 16px ${color}33`,
  }

  return (
    <motion.div
      style={cardStyle}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={decorStyle} />
      <div style={iconContainerStyle}>{icon}</div>
      <div style={{ fontSize: "13px", fontWeight: 500, color: "#6B7280", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {title}
      </div>
      <div style={{ fontSize: "36px", fontWeight: 700, color: "#1F3D36", lineHeight: 1.2, marginBottom: "4px" }}>
        <AnimatedCounter value={value} />
      </div>
      <div style={{ fontSize: "13px", color: "#9CA3AF" }}>
        {subtitle}
      </div>
    </motion.div>
  )
}
