import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../option";

const TYPE_TO_ENDPOINT: Record<string, string> = {
  countries: "/api/countries",
  states: "/api/states",
  cities: "/api/cities",
  "administrator-types": "/api/administrator-types",
  insurers: "/api/insurers",
  "measurement-units": "/api/medicines/measurement-units",
  "administration-routes": "/api/medicines/administration-routes",
  "pharmaceutical-forms": "/api/medicines/pharmaceutical-forms",
  presentations: "/api/medicines/presentations",
  "medicine-groups": "/api/medicines/medicine-groups",
};

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "countries";

    if (!TYPE_TO_ENDPOINT[type]) {
      return NextResponse.json(
        {
          error: "Invalid type parameter",
          received: type,
          validTypes: Object.keys(TYPE_TO_ENDPOINT),
        },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${TYPE_TO_ENDPOINT[type]}`,
      {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Error fetching ${type}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
