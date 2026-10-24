import { proxyToBackend } from "../../../_backendProxy"

interface Params {
  id: string
}

// Avisa a los admisionistas que el triage quedó pendiente de admisión.
export async function POST(_req: Request, { params }: { params: Params }) {
  return proxyToBackend(`/api/triage/${encodeURIComponent(params.id)}/notify-admission`, {
    method: "POST",
  })
}
