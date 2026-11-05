import { proxyToBackend } from "../../../_backendProxy"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return proxyToBackend(`/api/electronic-invoices/${encodeURIComponent(params.id)}/pdf`)
}
