import { NextResponse } from "next/server"
import { BACKEND_ENDPOINT, apiFetch, errorResponse, getToken } from "./proxy"

export async function POST(req: Request) {
  try {
    const token = await getToken()
    const body = await req.json()

    const data = await apiFetch(BACKEND_ENDPOINT, token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    return NextResponse.json(data)
  } catch (e: any) {
    return errorResponse(e)
  }
}
