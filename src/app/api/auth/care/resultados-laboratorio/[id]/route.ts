import { NextResponse } from "next/server"
import { BACKEND_ENDPOINT, apiFetch, errorResponse, getToken } from "../proxy"

interface Params {
  id: string
}

export async function GET(_req: Request, { params }: { params: Params }) {
  try {
    const token = await getToken()
    const data = await apiFetch(`${BACKEND_ENDPOINT}/${params.id}`, token)
    return NextResponse.json(data)
  } catch (e: any) {
    return errorResponse(e)
  }
}

export async function PUT(req: Request, { params }: { params: Params }) {
  try {
    const token = await getToken()
    const body = await req.json()

    const data = await apiFetch(`${BACKEND_ENDPOINT}/${params.id}`, token, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    return NextResponse.json(data)
  } catch (e: any) {
    return errorResponse(e)
  }
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  try {
    const token = await getToken()
    await apiFetch(`${BACKEND_ENDPOINT}/${params.id}`, token, { method: "DELETE" })
    return NextResponse.json({ ok: true, message: "Deleted successfully" })
  } catch (e: any) {
    return errorResponse(e)
  }
}
