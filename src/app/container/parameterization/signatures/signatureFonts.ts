import { Allura, Dancing_Script, Great_Vibes, Mrs_Saint_Delafield } from "next/font/google"

// Fuentes caligráficas para la firma escrita. Solo se descargan en esta vista.
const allura = Allura({ weight: "400", subsets: ["latin"], display: "swap", preload: false })
const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"], display: "swap", preload: false })
const delafield = Mrs_Saint_Delafield({ weight: "400", subsets: ["latin"], display: "swap", preload: false })
const dancing = Dancing_Script({ weight: "500", subsets: ["latin"], display: "swap", preload: false })

export interface SignatureFont {
  key: string
  label: string
  // Valor de CSS font-family (nombre interno de next/font + respaldo).
  family: string
}

export const SIGNATURE_FONTS: SignatureFont[] = [
  { key: "delafield", label: "Rápida", family: delafield.style.fontFamily },
  { key: "allura", label: "Clásica", family: allura.style.fontFamily },
  { key: "greatVibes", label: "Elegante", family: greatVibes.style.fontFamily },
  { key: "dancing", label: "Legible", family: dancing.style.fontFamily },
]
