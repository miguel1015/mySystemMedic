import { AdmissionNotification } from "@/core/interfaces/care/admissionNotifications"
import { TriagePriority } from "@/core/interfaces/care/types"

// Mismos colores que los botones de prioridad del formulario de triage.
export const TRIAGE_PRIORITY_META: Record<TriagePriority, { name: string; color: string }> = {
  I: { name: "Resucitación", color: "#ff4d4f" },
  II: { name: "Emergencia", color: "#fa8c16" },
  III: { name: "Urgencia", color: "#fadb14" },
  IV: { name: "Menos urgente", color: "#52c41a" },
  V: { name: "No urgente", color: "#1890ff" },
}

export const isPending = (n: AdmissionNotification) => n.status === "PENDIENTE"

export function buildAdmissionUrl(n: AdmissionNotification) {
  const params = new URLSearchParams({
    document: n.documentNumber,
    triageId: String(n.triageId),
  })
  return `/care/admissions/new?${params.toString()}`
}

// "hace 3 min", "hace 2 h", "hace 1 día".
export function timeAgo(iso: string, now: number = Date.now()) {
  const minutes = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60_000))
  if (minutes < 1) return "justo ahora"
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  return `hace ${days} ${days === 1 ? "día" : "días"}`
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Dos tonos cortos para las urgencias. El navegador puede bloquear el audio si el usuario
// aún no ha interactuado con la página; en ese caso simplemente no suena.
export function playUrgentChime() {
  try {
    const AudioCtx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return

    const ctx = new AudioCtx()
    ;[880, 660].forEach((frequency, index) => {
      const start = ctx.currentTime + index * 0.22
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2)
      osc.connect(gain).connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.21)
    })
    setTimeout(() => ctx.close().catch(() => undefined), 800)
  } catch {
    // Sin audio: el modal sigue mostrándose.
  }
}
