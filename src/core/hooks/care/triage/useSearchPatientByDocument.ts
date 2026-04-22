import { ENDPOINTS } from "@/core/api/endpoints"
import { PatientMiniResponse } from "@/core/interfaces/care/types"

export class PatientNotFoundError extends Error {
  constructor(public documentNumber: string) {
    super(
      `No se encontró ningún paciente con el documento "${documentNumber}".`,
    )
    this.name = "PatientNotFoundError"
  }
}

function pick<T = unknown>(
  obj: Record<string, unknown>,
  ...keys: string[]
): T | undefined {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k] as T
  }
  return undefined
}

function normalizePatient(
  raw: unknown,
  fallbackDoc: string,
): PatientMiniResponse {
  const r = (raw ?? {}) as Record<string, unknown>
  return {
    id: pick<number>(r, "id", "Id") ?? 0,
    numeroDocumento:
      pick<string>(r, "numeroDocumento", "NumeroDocumento") ?? fallbackDoc,
    primerNombre: pick<string>(r, "primerNombre", "PrimerNombre") ?? "",
    segundoNombre:
      pick<string>(r, "segundoNombre", "SegundoNombre") ?? null,
    primerApellido:
      pick<string>(r, "primerApellido", "PrimerApellido") ?? "",
    segundoApellido:
      pick<string>(r, "segundoApellido", "SegundoApellido") ?? null,
    fechaNacimiento:
      pick<string>(r, "fechaNacimiento", "FechaNacimiento") ?? null,
    sexo: pick<string>(r, "sexo", "Sexo") ?? null,
  }
}

async function fetchPatientByDocument(doc: string): Promise<PatientMiniResponse> {
  const res = await fetch(ENDPOINTS.PATIENTS.BY_DOCUMENT(doc), {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  })

  const contentType = res.headers.get("content-type") ?? ""
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null)

  if (res.ok) {
    // eslint-disable-next-line no-console
    console.log(
      "[by-document] respuesta cruda del backend:\n" +
        JSON.stringify(data, null, 2),
    )
    const normalized = normalizePatient(data, doc)
    // eslint-disable-next-line no-console
    console.log(
      "[by-document] normalizado (camelCase):\n" +
        JSON.stringify(normalized, null, 2),
    )
    return normalized
  }

  if (res.status === 404) {
    throw new PatientNotFoundError(doc)
  }

  if (res.status === 401) {
    throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.")
  }

  const backendMessage =
    typeof data === "string"
      ? data
      : (data as { error?: string; message?: string; title?: string })?.error ??
        (data as { message?: string })?.message ??
        (data as { title?: string })?.title

  throw new Error(
    backendMessage ||
      "No fue posible buscar al paciente. Intenta nuevamente en unos segundos.",
  )
}

export const patientByDocumentService = {
  getByDocument: fetchPatientByDocument,
}

export function useSearchPatientByDocument() {
  return {
    searchByDocument: fetchPatientByDocument,
  }
}
