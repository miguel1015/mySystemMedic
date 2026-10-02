import { proxyToBackend } from "../_proxy"

interface Params {
  params: { id: string }
}

export async function GET(_req: Request, { params }: Params) {
  return proxyToBackend(`/${encodeURIComponent(params.id)}`)
}

export async function PUT(req: Request, { params }: Params) {
  const body = await req.text()
  return proxyToBackend(`/${encodeURIComponent(params.id)}`, { method: "PUT", body })
}

export async function DELETE(_req: Request, { params }: Params) {
  return proxyToBackend(`/${encodeURIComponent(params.id)}`, { method: "DELETE" })
}
