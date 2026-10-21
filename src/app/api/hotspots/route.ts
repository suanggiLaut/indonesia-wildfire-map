import { NextRequest, NextResponse } from "next/server";
import { Sensor, TimeWindow } from "@/types";

const FIRMS_BASE = "https://firms.modaps.eosdis.nasa.gov/api/country/csv";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sensor = (searchParams.get("sensor") || "VIIRS") as Sensor;
  const timeWindow = (searchParams.get("window") || "24h") as TimeWindow;

  const days = timeWindow === "24h" ? 1 : timeWindow === "48h" ? 2 : 7;
  const source = sensor === "VIIRS" ? "VIIRS_SNPP_NRT" : "MODIS_NRT";

  // Use environment variable for API key, fallback to DEMO_KEY
  const apiKey = process.env.NASA_FIRMS_KEY || "DEMO_KEY";
  const url = `${FIRMS_BASE}/${apiKey}/${source}/IDN/${days}`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "text/csv" },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from NASA FIRMS", status: response.status },
        { status: 502 }
      );
    }

    const csvText = await response.text();
    const hotspots = parseCSV(csvText);

    return NextResponse.json(
      { data: hotspots, count: hotspots.length, fetched_at: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("FIRMS fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

interface HotspotData {
  latitude: number;
  longitude: number;
  brightness: number;
  scan: number;
  track: number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  instrument: string;
  confidence: string | number;
  bright_ti4: number;
  bright_ti5: number;
  frp: number;
  daynight: string;
}

function parseCSV(csv: string): HotspotData[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",");
  const hotspots: HotspotData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    if (values.length < headers.length) continue;

    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h.trim()] = values[idx]?.trim() || "";
    });

    const lat = parseFloat(obj.latitude) || 0;
    const lng = parseFloat(obj.longitude) || 0;

    // Filter to Indonesia bounds
    if (lat < -11 || lat > 6 || lng < 95 || lng > 141) continue;

    hotspots.push({
      latitude: lat,
      longitude: lng,
      brightness: parseFloat(obj.brightness || obj.bright_ti4) || 0,
      scan: parseFloat(obj.scan) || 0,
      track: parseFloat(obj.track) || 0,
      acq_date: obj.acq_date || "",
      acq_time: obj.acq_time || "",
      satellite: obj.satellite || "",
      instrument: obj.instrument || "",
      confidence: obj.confidence || "",
      bright_ti4: parseFloat(obj.bright_ti4) || 0,
      bright_ti5: parseFloat(obj.bright_ti5) || 0,
      frp: parseFloat(obj.frp) || 0,
      daynight: obj.daynight || "",
    });
  }

  return hotspots;
}
