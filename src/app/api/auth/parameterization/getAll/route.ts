import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../option";

const TYPE_TO_ENDPOINT: Record<string, string> = {
  tariffs: "/api/tariffs",
  "benefit-plans": "/api/benefit-plans",
  contracts: "/api/contracts",
  "contracts-by-insurer": "/api/contracts/by-insurer",
  "contract-details": "/api/contract-details",
  tariffdetails: "/api/tariffdetails",
  medicines: "/api/medicines",
  "medical-devices": "/api/medical-devices",
  "contract-catalogs": "/api/contracts/catalogs",
};

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "tariffs";

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

    const insurerId = searchParams.get("insurerId");
    const endpoint =
      type === "contracts-by-insurer"
        ? `${TYPE_TO_ENDPOINT[type]}/${insurerId}`
        : TYPE_TO_ENDPOINT[type];

    if (type === "contracts-by-insurer" && !insurerId) {
      return NextResponse.json(
        { error: "insurerId parameter is required" },
        { status: 400 },
      );
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
      {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      },
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Error fetching ${type}` },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
