import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../option";

const TYPE_TO_ENDPOINT: Record<string, string> = {
  insurers: "/api/insurers",
  tariffs: "/api/tariff-schedules",
  contracts: "/api/contracts",
  "contract-details": "/api/contract-details",
  medicines: "/api/medicines",
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "insurers";

    if (!TYPE_TO_ENDPOINT[type]) {
      return NextResponse.json(
        {
          error: "Invalid type parameter",
          received: type,
          validTypes: Object.keys(TYPE_TO_ENDPOINT),
        },
        { status: 400 },
      );
    }

    const body = await req.json();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${TYPE_TO_ENDPOINT[type]}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify(body),
      },
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
        { status: res.status },
      );
    }

    return NextResponse.json(backendResponse);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
