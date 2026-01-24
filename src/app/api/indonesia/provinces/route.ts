import axios from "axios";
import { NextResponse } from "next/server";

const INDONESIA_REGIONAL_API =
  process.env.INDONESIA_REGIONAL_API_BASE_URL ||
  "https://api-regional-indonesia.vercel.app";

export async function GET() {
  try {
    const response = await axios.get(`${INDONESIA_REGIONAL_API}/api/provinces`);

    // Return the data directly from the external API
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const data = error.response?.data || {
        error: "Failed to fetch provinces",
      };

      return NextResponse.json(data, { status });
    }

    console.error("Provinces API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
