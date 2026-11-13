"use client"

import { useEffect, useState } from "react"

// Etapas de una carga según el tiempo que lleva: "hidden" evita el parpadeo cuando la
// respuesta es rápida, "slow" y "verySlow" permiten avisar al usuario (el backend gratuito
// puede tardar hasta un minuto en despertar).
export type LoadingStage = "hidden" | "visible" | "slow" | "verySlow"

export function useElapsedStage(delays = { show: 250, slow: 3_000, verySlow: 10_000 }) {
  const [stage, setStage] = useState<LoadingStage>("hidden")

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage("visible"), delays.show),
      setTimeout(() => setStage("slow"), delays.slow),
      setTimeout(() => setStage("verySlow"), delays.verySlow),
    ]
    return () => timers.forEach(clearTimeout)
  }, [delays.show, delays.slow, delays.verySlow])

  return stage
}

export const SLOW_MESSAGES: Record<"slow" | "verySlow", string> = {
  slow: "Esto está tardando un poco más de lo normal…",
  verySlow: "Conectando con el servidor. La primera carga del día puede tardar hasta un minuto.",
}
