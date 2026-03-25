"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import styles from "./dashboard.module.scss"

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: number
  subtitle: string
  color: string
  gradient: string
  delay: number
}

function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (value === 0) return
    const totalFrames = duration * 60
    const increment = value / totalFrames
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplay(value)
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
  return (
    <motion.div
      className={styles.statCard}
      style={{ "--card-accent": color } as React.CSSProperties}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
    >
      <div className={styles.statCardHeader}>
        <div
          className={styles.statCardIcon}
          style={{ background: gradient }}
        >
          {icon}
        </div>
        <span className={styles.statCardBadge}>{subtitle}</span>
      </div>
      <div className={styles.statCardValue}>
        <AnimatedCounter value={value} />
      </div>
      <div className={styles.statCardLabel}>{title}</div>
    </motion.div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className={styles.skeletonCard}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div className={styles.skeletonIcon} />
        <div className={styles.skeleton} style={{ width: 50, height: 16, borderRadius: 16 }} />
      </div>
      <div className={styles.skeletonValue} />
      <div className={styles.skeletonLineShort} />
    </div>
  )
}
