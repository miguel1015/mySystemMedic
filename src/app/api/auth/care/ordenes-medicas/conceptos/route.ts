import { proxyToBackend } from "../_proxy"

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams
  const query = new URLSearchParams()
  const search = params.get("search")?.trim()
  const tipoOrden = params.get("tipoOrden")?.trim()
  if (search) query.set("search", search)
  if (tipoOrden) query.set("tipoOrden", tipoOrden)

  return proxyToBackend(`/conceptos?${query.toString()}`)
}
