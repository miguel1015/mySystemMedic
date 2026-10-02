import { proxyToBackend } from "../../_proxy"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.text()
  return proxyToBackend(`/${encodeURIComponent(params.id)}/cantidad`, { method: "PUT", body })
}
