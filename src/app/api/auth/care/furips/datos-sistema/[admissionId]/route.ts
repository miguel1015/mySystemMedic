import { proxyToBackend } from "../../../_backendProxy"

export async function GET(req: Request, { params }: { params: { admissionId: string } }) {
  const { searchParams } = new URL(req.url)
  return proxyToBackend(
    `/api/furips/datos-sistema/${encodeURIComponent(params.admissionId)}?${searchParams}`,
  )
}
