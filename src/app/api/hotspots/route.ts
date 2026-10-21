import { NextRequest, NextResponse } from "next/server";
import { Sensor, TimeWindow } from "@/types";

const FIRMS_BASE = "https://firms.modaps.eosdis.nasa.gov/api/country/csv";

// Source names to try in order (NASA updates these periodically)
const VIIRS_SOURCES = ["VIIRS_SNPP_NRT", "VIIRS_SNPP_SP", "VIIRS_NOAA20_NRT", "VIIRS_NOAA21_NRT"];
const MODIS_SOURCES = ["MODIS_NRT", "MODIS_SP"];

async function fetchWithFallback(apiKey: string, sources: string[], country: string, days: number): Promise<Response | null> {
  for (const source of sources) {
    const url = `${FIRMS_BASE}/${apiKey}/${source}/${country}/${days}`;
    try {
      const response = await fetch(url, {
        headers: { Accept: "text/csv" },
        signal: AbortSignal.timeout(15000),
      });
      if (response.ok) {
        const text = await response.text();
        // Check if response is actually CSV data (not error HTML)
        if (text.includes("latitude") || text.includes("lat")) {
          return new Response(text, { status: 200 });
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sensor = (searchParams.get("sensor") || "VIIRS") as Sensor;
  const timeWindow = (searchParams.get("window") || "24h") as TimeWindow;

  const days = timeWindow === "24h" ? 1 : timeWindow === "48h" ? 2 : 7;
  const sources = sensor === "VIIRS" ? VIIRS_SOURCES : MODIS_SOURCES;

  const apiKey = process.env.NASA_FIRMS_KEY || "DEMO_KEY";

  try {
    const response = await fetchWithFallback(apiKey, sources, "IDN", days);

    if (!response) {
      return NextResponse.json(
        { error: "Failed to fetch from NASA FIRMS - all sources tried", sources_tried: sources },
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
      { error: "Internal server error", detail: String(error) },
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
