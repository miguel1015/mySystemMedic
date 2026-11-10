import { proxyToBackend } from "../../../_proxy"

interface Params {
  params: { itemId: string }
}

export async function POST(_req: Request, { params }: Params) {
  return proxyToBackend(`/items/${encodeURIComponent(params.itemId)}/suspender`, { method: "POST" })
}
