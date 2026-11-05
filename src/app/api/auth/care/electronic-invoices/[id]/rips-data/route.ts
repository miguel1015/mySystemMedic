import { proxyToBackend } from "../../../_backendProxy"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { search } = new URL(req.url)
  return proxyToBackend(
    `/api/electronic-invoices/${encodeURIComponent(params.id)}/rips-data${search}`,
  )
}
