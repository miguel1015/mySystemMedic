import { proxyToBackend } from "../../_proxy"

export async function GET(_req: Request, { params }: { params: { itemId: string } }) {
  return proxyToBackend(`/item/${encodeURIComponent(params.itemId)}`)
}
