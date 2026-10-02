import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../option"

// Reenvía la petición al backend con el token de la sesión y traduce los errores
// (ProblemDetails, texto plano o JSON) a { error } con el mismo código HTTP.
export async function proxyToBackend(backendPath: string, init: RequestInit = {}) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${backendPath}`, {
      ...init,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers || {}),
      },
    })

    const contentType = res.headers.get("content-type") ?? ""
    const data = contentType.includes("json")
      ? await res.json().catch(() => null)
      : await res.text().catch(() => null)

    if (!res.ok) {
      let message = res.statusText
      if (typeof data === "string" && data) {
        message = data
      } else if (data?.errors && typeof data.errors === "object") {
        const details = Object.values(data.errors as Record<string, string[]>).flat().filter(Boolean)
        if (details.length > 0) message = details.join(" ")
      } else {
        message = data?.title || data?.message || data?.error || res.statusText
      }
      return NextResponse.json({ error: message }, { status: res.status })
    }

    if (res.status === 204 || data === null || data === "") {
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 },
    )
  }
}
