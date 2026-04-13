import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../option";

const BACKEND_ENDPOINT = "/api/patients";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${BACKEND_ENDPOINT}`,
      {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      },
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Error fetching patients" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log(
      "📤 [POST /patients] Body enviado al backend:",
      JSON.stringify(body, null, 2),
    );

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${BACKEND_ENDPOINT}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify(body),
      },
    );

    console.log("📥 [POST /patients] Status del backend:", res.status);

    const contentType = res.headers.get("content-type") || "";
    const backendResponse = contentType.includes("application/json")
      ? await res.json().catch(() => null)
      : await res.text().catch(() => null);

    console.log(
      "📥 [POST /patients] Respuesta del backend:",
      JSON.stringify(backendResponse, null, 2),
    );

    if (!res.ok) {
      const errorMessage =
        typeof backendResponse === "string"
          ? backendResponse
          : backendResponse?.title ||
            backendResponse?.message ||
            JSON.stringify(backendResponse);

      return NextResponse.json({ error: errorMessage }, { status: res.status });
    }

    return NextResponse.json(backendResponse);
  } catch (error) {
    console.error("❌ [POST /patients] Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
