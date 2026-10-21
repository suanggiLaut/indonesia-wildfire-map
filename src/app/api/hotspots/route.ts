import { NextRequest, NextResponse } from "next/server";
import { Sensor, TimeWindow } from "@/types";

// WFS endpoint - works with MAP KEY (not CSV API which needs separate key)
const FIRMS_WFS = "https://firms.modaps.eosdis.nasa.gov/mapserver/wfs/SouthEast_Asia";

// Indonesia bounding box
const INDO_BBOX = "-11,95,6,141";

// WFS layer names per sensor and time window
function getWfsLayers(sensor: Sensor, timeWindow: TimeWindow): string[] {
  const hours = timeWindow === "24h" ? "24hrs" : timeWindow === "48h" ? "48hrs" : "7days";

  if (sensor === "VIIRS") {
    return [
      `ms:fires_snpp_${hours}`,
      `ms:fires_noaa20_${hours}`,
      `ms:fires_noaa21_${hours}`,
    ];
  } else {
    return [`ms:fires_modis_${hours}`];
  }
}

interface WfsFeature {
  properties: Record<string, unknown>;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

interface WfsResponse {
  type: string;
  features?: WfsFeature[];
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

function parseWfsFeatures(geojson: WfsResponse): HotspotData[] {
  if (!geojson.features || !Array.isArray(geojson.features)) return [];

  return geojson.features
    .filter((f) => {
      const [lng, lat] = f.geometry.coordinates;
      return lat >= -11 && lat <= 6 && lng >= 95 && lng <= 141;
    })
    .map((f) => {
      const p = f.properties;
      const [lng, lat] = f.geometry.coordinates;
      return {
        latitude: lat,
        longitude: lng,
        brightness: Number(p.brightness || p.bright_ti4) || 0,
        scan: Number(p.scan) || 0,
        track: Number(p.track) || 0,
        acq_date: String(p.acq_date || p.ACQ_DATE || ""),
        acq_time: String(p.acq_time || p.ACQ_TIME || ""),
        satellite: String(p.satellite || p.SATELLITE || ""),
        instrument: String(p.instrument || p.INSTRUMENT || ""),
        confidence: p.confidence || p.CONFIDENCE || "",
        bright_ti4: Number(p.bright_ti4 || p.BRIGHT_TI4) || 0,
        bright_ti5: Number(p.bright_ti5 || p.BRIGHT_TI5) || 0,
        frp: Number(p.frp || p.FRP) || 0,
        daynight: String(p.daynight || p.DAYNIGHT || ""),
      };
    });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sensor = (searchParams.get("sensor") || "VIIRS") as Sensor;
  const timeWindow = (searchParams.get("window") || "24h") as TimeWindow;

  const apiKey = process.env.NASA_FIRMS_KEY || "DEMO_KEY";
  const layers = getWfsLayers(sensor, timeWindow);

  const allHotspots: HotspotData[] = [];
  const errors: string[] = [];

  try {
    // Try each layer - some may not be available
    for (const layer of layers) {
      try {
        const url = `${FIRMS_WFS}/${apiKey}/?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAME=${layer}&STARTINDEX=0&COUNT=10000&SRSNAME=urn:ogc:def:crs:EPSG::4326&BBOX=${INDO_BBOX},urn:ogc:def:crs:EPSG::4326&outputformat=geojson`;

        const response = await fetch(url, {
          signal: AbortSignal.timeout(20000),
        });

        if (response.ok) {
          const contentType = response.headers.get("content-type") || "";
          const text = await response.text();

          // Check if it's valid GeoJSON
          if (contentType.includes("json") || text.startsWith("{")) {
            const geojson = JSON.parse(text) as WfsResponse;
            const hotspots = parseWfsFeatures(geojson);
            allHotspots.push(...hotspots);
          }
        }
      } catch (e) {
        errors.push(`${layer}: ${String(e)}`);
        continue;
      }
    }

    // Deduplicate by lat/lng/acq_date/acq_time
    const seen = new Set<string>();
    const unique = allHotspots.filter((h) => {
      const key = `${h.latitude.toFixed(4)}_${h.longitude.toFixed(4)}_${h.acq_date}_${h.acq_time}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json(
      {
        data: unique,
        count: unique.length,
        fetched_at: new Date().toISOString(),
        layers_tried: layers,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("FIRMS WFS fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error", detail: String(error), errors },
      { status: 500 }
    );
  }
}
