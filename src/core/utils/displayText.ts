// Formato de PRESENTACIÓN para textos que llegan en mayúsculas desde la base de datos
// ("DAVID JOSE JIMENEZ SALTARIN", "NUEVA EPS S.A", "HOSPITALIZACION").
// Solo cambia cómo se ve en pantalla: filtros, búsquedas, orden, formularios e
// impresiones siguen usando el valor original.

const LOCALE = "es-CO"

// Partículas que van en minúscula dentro de un nombre ("Luis de la Hoz").
const PARTICLES = new Set(["de", "del", "la", "las", "los", "y", "e", "van", "von"])

// Siglas de instituciones de salud y formas societarias que se mantienen en mayúsculas.
const ACRONYMS = new Set([
  "eps", "ips", "ese", "arl", "soat", "adres", "sas", "sa", "nit", "ltda", "ccf", "fosyga",
])

const capitalize = (w: string) => w.charAt(0).toLocaleUpperCase(LOCALE) + w.slice(1)

const words = (text: string) => text.trim().toLocaleLowerCase(LOCALE).split(/\s+/).filter(Boolean)

/** "DAVID JOSE JIMENEZ SALTARIN" -> "David Jose Jimenez Saltarin"; "LUIS DE LA HOZ" -> "Luis de la Hoz". */
export function formatPersonName(name?: string | null): string {
  if (!name) return ""
  return words(name)
    // Respeta los nombres compuestos con guion: "ANA-MARIA" -> "Ana-Maria".
    .map((w, i) => (i > 0 && PARTICLES.has(w) ? w : w.split("-").map(capitalize).join("-")))
    .join(" ")
}

/** "NUEVA EPS S.A" -> "Nueva EPS S.A"; "LA EQUIDAD SEGUROS DE VIDA" -> "La Equidad Seguros de Vida". */
export function formatInstitutionName(name?: string | null): string {
  if (!name) return ""
  return words(name)
    .map((w, i) => {
      const bare = w.replace(/[^\p{L}]/gu, "")
      if (w.includes(".") || ACRONYMS.has(bare)) return w.toLocaleUpperCase(LOCALE)
      if (i > 0 && PARTICLES.has(w)) return w
      return capitalize(w)
    })
    .join(" ")
}

// Tildes de los valores de catálogo más comunes, que la base guarda sin tilde.
const CATALOG_ACCENTS: Record<string, string> = {
  hospitalizacion: "hospitalización",
  cirugia: "cirugía",
  urgencia: "urgencia",
  odontologia: "odontología",
  atencion: "atención",
  domiciliaria: "domiciliaria",
}

// Clave estable de un ámbito de atención, sin mayúsculas, tildes ni plural:
// "URGENCIAS", "Urgencia" y "urgencias" -> "urgencia".
export function careScopeKey(value?: string | null): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/s$/, "")
}

const CARE_SCOPE_COLORS: Record<string, string> = {
  triage: "gold",
  urgencia: "red",
  hospitalizacion: "blue",
  "consulta externa": "green",
  cirugia: "purple",
}

/** Color de etiqueta (antd Tag) para un ámbito, venga como venga escrito. */
export const careScopeColor = (value?: string | null) =>
  CARE_SCOPE_COLORS[careScopeKey(value)] ?? "default"

/** Etiquetas de catálogo en tipo oración: "HOSPITALIZACION" -> "Hospitalización". */
export function formatCatalogLabel(label?: string | null): string {
  if (!label) return ""
  return words(label)
    .map((w, i) => {
      const accented = CATALOG_ACCENTS[w] ?? w
      return i === 0 ? capitalize(accented) : accented
    })
    .join(" ")
}
