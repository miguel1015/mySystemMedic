import { NextResponse } from "next/server"
import { BACKEND_ENDPOINT, apiFetch, errorResponse, getToken } from "../proxy"

export async function POST(req: Request) {
  try {
    const token = await getToken()
    const { searchParams } = new URL(req.url)
    // Se reenvía el formulario tal cual; fetch arma de nuevo el multipart con su boundary.
    const form = await req.formData()

    const data = await apiFetch(`${BACKEND_ENDPOINT}/importar?${searchParams}`, token, {
      method: "POST",
      body: form,
    })

    return NextResponse.json(data)
  } catch (e: any) {
    return errorResponse(e)
  }
}
