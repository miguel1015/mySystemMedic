import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../option";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify(body),
      }
    );

    // Leer el contenido según content-type
    const contentType = res.headers.get("content-type") || "";
    let backendResponse;

    if (contentType.includes("application/json")) {
      backendResponse = await res.json().catch(() => null);
    } else {
      backendResponse = await res.text().catch(() => null);
    }
    // Si el back devuelve error
    if (!res.ok) {
      return NextResponse.json(
        { error: backendResponse || "Unknown error" },
        { status: res.status }
      );
    }

    return NextResponse.json(backendResponse);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
