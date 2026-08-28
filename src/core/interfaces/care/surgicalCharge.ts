export const SURGICAL_WAY_TYPES = [
  "Misma especialidad - única vía",
  "Misma especialidad - diferente vía",
  "Diferente especialidad - única vía",
  "Diferente especialidad - diferente vía",
] as const

export type SurgicalWayType = (typeof SURGICAL_WAY_TYPES)[number]
