import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../option"

// Auxiliares compartidos por las rutas de resultados de laboratorio.

export const BACKEND_ENDPOINT = "/api/resultados-laboratorio"

export async function getToken() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.accessToken) {
    throw { status: 401, message: "Unauthorized" }
  }
  return session.user.accessToken
}

async function backendFetch(url: string, token: string, options: RequestInit = {}) {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })
}

async function throwIfError(res: Response) {
  if (res.ok) return

  const contentType = res.headers.get("content-type") ?? ""
  const data = contentType.includes("json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null)

  let message = res.statusText
  if (typeof data === "string" && data) {
    message = data
  } else if (data?.errors && typeof data.errors === "object") {
    const details = Object.values(data.errors as Record<string, string[]>).flat().filter(Boolean)
    if (details.length > 0) message = details.join(" ")
  } else {
    message = data?.title || data?.message || data?.error || res.statusText
  }
  throw { status: res.status, message }
}

export async function apiFetch(url: string, token: string, options: RequestInit = {}) {
  const res = await backendFetch(url, token, options)
  await throwIfError(res)

  const contentType = res.headers.get("content-type") ?? ""
  return contentType.includes("json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null)
}

// Reenvía un archivo del backend (Excel) conservando su tipo y nombre de descarga.
export async function fileResponse(url: string, token: string) {
  const res = await backendFetch(url, token)
  await throwIfError(res)

  const headers = new Headers()
  for (const name of ["content-type", "content-disposition", "content-length"]) {
    const value = res.headers.get(name)
    if (value) headers.set(name, value)
  }
  return new NextResponse(res.body, { status: 200, headers })
}

export function errorResponse(e: any) {
  return NextResponse.json(
    { error: e?.message ?? "Server error" },
    { status: e?.status ?? 500 },
  )
}
