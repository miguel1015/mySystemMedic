// Parámetros de la sesión. Deben coincidir con la sección "Jwt" de MediNexus
// (IdleMinutes, MaxSessionHours); el backend es quien los hace cumplir.

function readNumber(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Minutos sin interacción del usuario antes de cerrar la sesión. */
export const SESSION_IDLE_MINUTES = readNumber(process.env.NEXT_PUBLIC_SESSION_IDLE_MINUTES, 30);

/** Tope absoluto de la sesión desde el login, aunque haya actividad. */
export const SESSION_MAX_HOURS = readNumber(process.env.NEXT_PUBLIC_SESSION_MAX_HOURS, 12);

/** Se renueva el access token cuando le quedan menos de estos milisegundos. */
export const REFRESH_BEFORE_MS = 5 * 60 * 1000;

/** Segundos de aviso antes de cerrar por inactividad. */
export const IDLE_WARNING_SECONDS = 60;

export type SessionEndReason = "idle" | "expired";
