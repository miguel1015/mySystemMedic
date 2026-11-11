export const SURGICAL_WAY_TYPES = [
  "Misma especialidad - única vía",
  "Misma especialidad - diferente vía",
  "Misma especialidad - única vía - incruento",
  "Misma especialidad - diferente vía - incruento",
  "Diferente especialidad - única vía",
  "Diferente especialidad - diferente vía",
] as const

export type SurgicalWayType = (typeof SURGICAL_WAY_TYPES)[number]
