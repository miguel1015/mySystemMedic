import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "./option"

// Crea los handlers de un proxy catch-all ([[...path]]) hacia un prefijo de MediNexus.
// El token del usuario se agrega en el servidor; el navegador nunca lo maneja.

interface Params {
  path?: string[]
}

type Method = "GET" | "POST" | "PUT"

interface ProxyOptions {
  // Mensaje para 403: el backend responde sin cuerpo cuando el rol no alcanza.
  forbiddenMessage: string
}

function resolveUrl(backendEndpoint: string, req: Request, params: Params) {
  const path = (params.path ?? []).map(encodeURIComponent).join("/")
  const { search } = new URL(req.url)
  return `${backendEndpoint}${path ? `/${path}` : ""}${search}`
}

function errorMessage(status: number, data: any, statusText: string, forbiddenMessage: string) {
  if (status === 403) return forbiddenMessage
  if (typeof data === "string" && data) return data
  if (data?.errors) {
    return Object.values(data.errors as Record<string, string[]>).flat().join(" | ")
  }
  return data?.message || data?.error || data?.title || statusText
}

export function createBackendProxy(backendEndpoint: string, { forbiddenMessage }: ProxyOptions) {
  async function handle(req: Request, params: Params, method: Method) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const body = method === "GET" ? undefined : await req.text()
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${resolveUrl(backendEndpoint, req, params)}`,
        {
          method,
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
            ...(body ? { "Content-Type": "application/json" } : {}),
          },
          body: body || undefined,
          cache: "no-store",
        },
      )

      const contentType = res.headers.get("content-type") ?? ""
      const data = contentType.includes("json")
        ? await res.json().catch(() => null)
        : await res.text().catch(() => null)

      if (!res.ok) {
        return NextResponse.json(
          { error: errorMessage(res.status, data, res.statusText, forbiddenMessage) },
          { status: res.status },
        )
      }

      return NextResponse.json(data)
    } catch {
      return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
  }

  return {
    GET: (req: Request, { params }: { params: Params }) => handle(req, params, "GET"),
    POST: (req: Request, { params }: { params: Params }) => handle(req, params, "POST"),
    PUT: (req: Request, { params }: { params: Params }) => handle(req, params, "PUT"),
  }
}
