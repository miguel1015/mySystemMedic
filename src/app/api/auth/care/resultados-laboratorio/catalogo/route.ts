import { NextResponse } from "next/server"
import { BACKEND_ENDPOINT, apiFetch, errorResponse, getToken } from "../proxy"

export async function GET(req: Request) {
  try {
    const token = await getToken()
    const { searchParams } = new URL(req.url)
    const data = await apiFetch(`${BACKEND_ENDPOINT}/catalogo?${searchParams}`, token)
    return NextResponse.json(data)
  } catch (e: any) {
    return errorResponse(e)
  }
}
