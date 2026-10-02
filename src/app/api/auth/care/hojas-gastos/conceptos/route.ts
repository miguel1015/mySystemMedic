import { proxyToBackend } from "../_proxy"

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams
  const query = new URLSearchParams()
  const tipoServicio = params.get("tipoServicio")
  const search = params.get("search")?.trim()
  if (tipoServicio) query.set("tipoServicio", tipoServicio)
  if (search) query.set("search", search)

  return proxyToBackend(`/conceptos?${query.toString()}`)
}
