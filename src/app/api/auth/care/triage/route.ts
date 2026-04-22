import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../option"

const BACKEND_ENDPOINT = "/api/triage"

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
  const data = contentType.includes("application/json")
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

export async function GET() {
  try {
    const session = await getSession()
    const data = await apiFetch(BACKEND_ENDPOINT, session.user.accessToken!)
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Server error" },
      { status: e.status ?? 500 },
    )
  }
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
