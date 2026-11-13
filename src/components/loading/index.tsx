"use client"

import { Hospital, Stethoscope, HeartPulse } from "lucide-react"
import { SLOW_MESSAGES, useElapsedStage } from "@/core/hooks/useElapsedStage"
import { styles, keyframes } from "./styles"

type LoadingProps = {
  active?: boolean;
};

const ICONS = [Hospital, Stethoscope, HeartPulse]

export default function Loading({ active = true }: LoadingProps) {
  if (!active) return null
  return <LoadingOverlay />
}

// Carga inicial de pantalla completa. Si se demora, avisa de que el servidor está
// despertando para que no parezca que la aplicación se colgó.
function LoadingOverlay() {
  const stage = useElapsedStage()
  const message =
    stage === "slow" || stage === "verySlow" ? SLOW_MESSAGES[stage] : "Cargando…"

  return (
    <div style={styles.overlay} role="status" aria-live="polite" aria-busy="true">
      <style>{keyframes}</style>
      <div style={styles.spinnerWrapper} aria-hidden="true">
        <div style={styles.spinner} />
        {ICONS.map((Icon, i) => (
          <div
            key={i}
            style={{ ...styles.icon, animationDelay: `${i}s` }}
          >
            <Icon size={24} style={{ color: "var(--theme-primary, #0F6F5C)" }} strokeWidth={2} />
          </div>
        ))}
      </div>
      <p style={styles.message}>{message}</p>
    </div>
  )
}
