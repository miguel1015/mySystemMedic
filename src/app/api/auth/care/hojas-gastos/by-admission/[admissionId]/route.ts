import { proxyToBackend } from "../../_proxy"

export async function GET(req: Request, { params }: { params: { admissionId: string } }) {
  const tipoHoja = new URL(req.url).searchParams.get("tipoHoja")
  const query = tipoHoja ? `?tipoHoja=${encodeURIComponent(tipoHoja)}` : ""
  return proxyToBackend(`/by-admission/${encodeURIComponent(params.admissionId)}${query}`)
}
