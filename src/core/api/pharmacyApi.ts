// Cliente del módulo de farmacia. Pasa por el proxy /api/auth/pharmacy, que agrega el
// token en el servidor, y devuelve el mensaje del backend cuando la operación falla
// (p. ej. "El lote X solo tiene 5 disponibles").

const BASE = "/api/auth/pharmacy"

type Params = Record<string, string | number | boolean | null | undefined>

function buildUrl(path: string, params?: Params) {
  const url = new URL(`${BASE}${path}`, window.location.origin)
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.append(key, String(value))
  })
  return url.toString()
}

function messageOf(data: unknown, fallback: string) {
  if (typeof data === "string" && data) return data
  if (data && typeof data === "object") {
    const err = data as Record<string, unknown>
    if (typeof err.error === "string") return err.error
    if (typeof err.title === "string") return err.title
  }
  return fallback
}

async function request<T>(method: string, path: string, body?: unknown, params?: Params): Promise<T> {
  const res = await fetch(buildUrl(path, params), {
    method,
    credentials: "include",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(messageOf(data, "No se pudo completar la operación."))
  return data as T
}

export const pharmacyApi = {
  get: <T>(path: string, params?: Params) => request<T>("GET", path, undefined, params),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  del: (path: string) => request<unknown>("DELETE", path),
}
