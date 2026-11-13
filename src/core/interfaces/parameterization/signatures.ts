// Biblioteca de firmas (Parametrización > Firmas).
export type SignatureKind = "drawn" | "typed" | "uploaded"

export interface SignatureTemplate {
  id: number
  name: string
  kind: SignatureKind
  // data URL (PNG recortado y con fondo transparente)
  imageData: string
  width: number
  height: number
  createdByName: string | null
  createdAt: string
  updatedAt: string
}

export interface SignatureImage {
  kind: SignatureKind
  imageData: string
  width: number
  height: number
}

export interface SignatureTemplateCreate extends SignatureImage {
  name: string
}

export interface SignatureTemplateUpdate extends Partial<SignatureImage> {
  name: string
}
