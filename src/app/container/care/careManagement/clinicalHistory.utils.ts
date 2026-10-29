import type {
  EvolucionEspecialistaResponse,
  EvolucionResponse,
} from "@/core/interfaces/care/hciInicial"
import type { ClinicalRecordType } from "@/core/interfaces/care/clinicalHistory"

export type EvolutionEntry =
  | { tipo: "Evolucion"; data: EvolucionResponse }
  | { tipo: "EvolucionEspecialista"; data: EvolucionEspecialistaResponse }

export interface SpecialtyGroup {
  key: string
  nombre: string
  entries: EvolutionEntry[]
}

export const RECORD_TYPE_LABEL: Record<ClinicalRecordType, string> = {
  Evolucion: "Evolución",
  EvolucionEspecialista: "Evolución de especialista",
}

// Las evoluciones anteriores a las especialidades: las generales son de Medicina
// General y las de especialista quedan agrupadas aparte hasta que se editen.
const MEDICINA_GENERAL = { key: "1", nombre: "MEDICINA GENERAL" }
const SIN_ESPECIALIDAD = { key: "sin-especialidad", nombre: "ESPECIALISTA (SIN ESPECIALIDAD)" }

const sortKey = (entry: EvolutionEntry) =>
  `${entry.data.fechaEvolucion}T${entry.data.horaEvolucion ?? ""}`

// Evoluciones agrupadas por la especialidad que las generó, cada grupo en orden
// cronológico. Medicina General va primero y el resto en orden alfabético.
export function groupBySpecialty(
  evoluciones: EvolucionResponse[],
  evolucionEspecialistas: EvolucionEspecialistaResponse[],
): SpecialtyGroup[] {
  const entries: EvolutionEntry[] = [
    ...evoluciones.map((data): EvolutionEntry => ({ tipo: "Evolucion", data })),
    ...evolucionEspecialistas.map((data): EvolutionEntry => ({ tipo: "EvolucionEspecialista", data })),
  ]

  const groups = new Map<string, SpecialtyGroup>()
  for (const entry of entries) {
    const { especialidadId, especialidadNombre } = entry.data
    const fallback = entry.tipo === "Evolucion" ? MEDICINA_GENERAL : SIN_ESPECIALIDAD
    const key = especialidadId ? String(especialidadId) : fallback.key
    const nombre = especialidadNombre ?? fallback.nombre
    const group = groups.get(key) ?? { key, nombre, entries: [] }
    group.entries.push(entry)
    groups.set(key, group)
  }

  return [...groups.values()]
    .map((g) => ({ ...g, entries: g.entries.sort((a, b) => sortKey(a).localeCompare(sortKey(b))) }))
    .sort((a, b) => {
      if (a.key === MEDICINA_GENERAL.key) return -1
      if (b.key === MEDICINA_GENERAL.key) return 1
      return a.nombre.localeCompare(b.nombre)
    })
}
