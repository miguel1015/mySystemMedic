import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../option"

const BACKEND_ENDPOINT = "/api/subjetivo-hcinicial"

async function getSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.accessToken) {
    throw { status: 401, message: "Unauthorized" }
  }
  return session
}

async function apiFetch(url: string, token: string, options: RequestInit = {}) {
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
    let message = res.statusText
    if (typeof data === "string") {
      message = data
    } else if (data?.errors && typeof data.errors === "object") {
      const details = Object.values(data.errors as Record<string, string[]>).flat().filter(Boolean)
      if (details.length > 0) message = details.join(" ")
    } else {
      message = data?.title || data?.message || data?.error || res.statusText
    }
    throw { status: res.status, message }
  }

  return data
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    const body = await req.json()

    const data = await apiFetch(BACKEND_ENDPOINT, session.user.accessToken!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Server error" },
      { status: e.status ?? 500 },
    )
  }
}
