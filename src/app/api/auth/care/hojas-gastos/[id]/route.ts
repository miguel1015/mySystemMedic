import { proxyToBackend } from "../_proxy"

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  return proxyToBackend(`/${encodeURIComponent(params.id)}`, { method: "DELETE" })
}
