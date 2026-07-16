import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../option"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    const backendUrl = search
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/anesthesiatypes?search=${encodeURIComponent(search)}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/anesthesiatypes`

    const res = await fetch(backendUrl, {
      headers: { Authorization: `Bearer ${session.user.accessToken}` },
    })

    if (!res.ok) {
      return NextResponse.json({ error: "Error fetching anesthesia types" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
