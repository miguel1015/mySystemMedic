// Tipografías que el usuario puede elegir para el texto (Configuraciones del menú).
// Los títulos mantienen Bricolage Grotesque. Cada fuente se carga con next/font en
// src/app/layout.tsx (variables --font-atkinson, --font-plex, --font-source) y solo se
// descarga cuando se usa.

export type FontKey = "manrope" | "atkinson" | "plex" | "source"

export interface FontOption {
  key: FontKey
  label: string
  hint: string
  // Valor de --font-body. null = la predeterminada (la define next/font en <html>).
  family: string | null
}

const FALLBACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

export const FONT_OPTIONS: FontOption[] = [
  { key: "manrope", label: "Manrope", hint: "Predeterminada", family: null },
  {
    key: "atkinson",
    label: "Atkinson",
    hint: "Máxima legibilidad",
    family: `var(--font-atkinson), ${FALLBACK}`,
  },
  { key: "plex", label: "IBM Plex", hint: "Técnica y sobria", family: `var(--font-plex), ${FALLBACK}` },
  { key: "source", label: "Source", hint: "Compacta, para tablas", family: `var(--font-source), ${FALLBACK}` },
]

export const DEFAULT_FONT: FontKey = "manrope"
export const FONT_STORAGE_KEY = "fontFamily"

export const isFontKey = (v: string | null): v is FontKey => FONT_OPTIONS.some((f) => f.key === v)

// Aplica la fuente cambiando --font-body en <html>. Todo el sistema (body y el tema de
// antd) ya lee esa variable, así que no hay que tocar ninguna pantalla.
export function applyFont(key: FontKey) {
  const option = FONT_OPTIONS.find((f) => f.key === key)
  const root = document.documentElement
  // Antes del primer cambio se guarda la predeterminada (Manrope de next/font) en
  // --font-body-default: la muestra "Aa" de Manrope la sigue necesitando.
  if (!root.style.getPropertyValue("--font-body-default")) {
    const original = getComputedStyle(root).getPropertyValue("--font-body").trim()
    if (original) root.style.setProperty("--font-body-default", original)
  }
  if (!option?.family) root.style.removeProperty("--font-body")
  else root.style.setProperty("--font-body", option.family)
}
