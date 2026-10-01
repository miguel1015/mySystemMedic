import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../option"

// Helpers compartidos por las rutas de /api/auth/care/electronic-invoices/[id]/*.
export const BACKEND_ENDPOINT = "/api/electronic-invoices"

export async function getAccessToken(): Promise<string> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.accessToken) {
    throw { status: 401, message: "Unauthorized" }
  }
  return session.user.accessToken
}

export async function apiFetch(url: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })

  const contentType = res.headers.get("content-type") ?? ""
  const data = contentType.includes("json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null)

  if (!res.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.title || data?.message || data?.error || res.statusText
    throw { status: res.status, message }
  }

  return data
}

export function errorResponse(e: any) {
  return NextResponse.json(
    { error: e?.message ?? "Server error" },
    { status: e?.status ?? 500 },
  )
}
