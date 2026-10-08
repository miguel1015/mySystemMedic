import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../option"

// Médicos activos con su documento (GET api/users/professionals). A diferencia de la lista
// completa de usuarios, la puede consultar cualquier usuario autenticado.
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/professionals`, {
      headers: { Authorization: `Bearer ${session.user.accessToken}` },
    })

    if (!res.ok) {
      return NextResponse.json({ error: "Error fetching professionals" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
