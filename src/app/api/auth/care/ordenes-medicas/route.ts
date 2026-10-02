import { proxyToBackend } from "./_proxy"

export async function POST(req: Request) {
  const body = await req.text()
  return proxyToBackend("", { method: "POST", body })
}
