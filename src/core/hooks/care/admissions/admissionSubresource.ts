// Peticiones de los registros únicos de una admisión (acompañante, remisión): el 404
// significa "aún no se ha registrado", y los errores traen el mensaje del backend.

const errorMessage = (data: unknown, fallback: string) =>
  (data as { error?: string } | null)?.error ?? fallback

export async function getOrNull<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { credentials: "include" })
  if (res.status === 404) return null
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(errorMessage(data, res.statusText))
  }
  return (await res.json()) as T
}

export async function putJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(errorMessage(data, res.statusText))
  return data as T
}
