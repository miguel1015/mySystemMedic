import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../option"

// Proxy de Parametrización > Facturación electrónica hacia MediNexus
// (/api/electronic-invoicing/settings/...). MediNexus es quien habla con el servicio de
// Facturación Electrónica; el navegador nunca recibe sus credenciales.
const BACKEND_ENDPOINT = "/api/electronic-invoicing/settings"

interface Params {
  path?: string[]
}

async function getSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.accessToken) {
    throw { status: 401, message: "Unauthorized" }
  }
  return session
}

function resolveUrl(req: Request, params: Params) {
  const path = (params.path ?? []).map(encodeURIComponent).join("/")
  const { search } = new URL(req.url)
  return `${BACKEND_ENDPOINT}${path ? `/${path}` : ""}${search}`
}

async function apiFetch(url: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    cache: "no-store",
  })

  const contentType = res.headers.get("content-type") ?? ""
  const data = contentType.includes("json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null)

  if (!res.ok) {
    const message =
      res.status === 403
        ? "Solo un administrador puede modificar la facturación electrónica."
        : typeof data === "string" && data
          ? data
          : data?.errors
            ? Object.values(data.errors as Record<string, string[]>).flat().join(" | ")
            : data?.title || data?.message || data?.error || res.statusText
    throw { status: res.status, message }
  }

  return data
}

async function handle(req: Request, params: Params, method: "GET" | "POST" | "PUT") {
  try {
    const session = await getSession()
    const body = method === "GET" ? undefined : await req.text()
    const data = await apiFetch(resolveUrl(req, params), session.user.accessToken!, {
      method,
      ...(body ? { body, headers: { "Content-Type": "application/json" } } : {}),
    })
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Server error" },
      { status: e.status ?? 500 },
    )
  }
}

export async function GET(req: Request, { params }: { params: Params }) {
  return handle(req, params, "GET")
}

export async function POST(req: Request, { params }: { params: Params }) {
  return handle(req, params, "POST")
}

export async function PUT(req: Request, { params }: { params: Params }) {
  return handle(req, params, "PUT")
}
