import { proxyToBackend } from "../../_backendProxy"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.text()
  return proxyToBackend(`/api/furips/${encodeURIComponent(params.id)}`, { method: "PUT", body })
}
