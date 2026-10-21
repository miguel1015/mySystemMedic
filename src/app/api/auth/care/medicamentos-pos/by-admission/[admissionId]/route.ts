import { proxyToBackend } from "../../_proxy"

export async function GET(_req: Request, { params }: { params: { admissionId: string } }) {
  return proxyToBackend(`/by-admission/${encodeURIComponent(params.admissionId)}`)
}
