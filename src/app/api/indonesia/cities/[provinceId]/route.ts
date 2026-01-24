import axios from "axios";
import { NextResponse } from "next/server";

const INDONESIA_REGIONAL_API =
  process.env.INDONESIA_REGIONAL_API_BASE_URL ||
  "https://api-regional-indonesia.vercel.app";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ provinceId: string }> },
) {
  try {
    const { provinceId } = await params;

    const response = await axios.get(
      `${INDONESIA_REGIONAL_API}/api/cities/${provinceId}`,
    );

    // Return the data directly from the external API
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const data = error.response?.data || {
        error: "Failed to fetch cities",
      };

      return NextResponse.json(data, { status });
    }

    console.error("Cities API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
