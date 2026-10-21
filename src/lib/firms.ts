import { Hotspot, TimeWindow, Sensor } from "@/types";

const FIRMS_BASE = "https://firms.modaps.eosdis.nasa.gov/api/country/csv";

// NASA FIRMS MAP_KEY — free tier, register at https://firms.modaps.eosdis.nasa.gov/api/
// For production, replace with your own key
const MAP_KEY = "DEMO_KEY";

/**
 * Fetch hotspot data from NASA FIRMS API for Indonesia
 * Country code: IDN
 * Sensors: VIIRS_SNPP_NRT, VIIRS_NOAA20_NRT, MODIS_NRT
 */
export async function fetchHotspots(
  sensor: Sensor,
  timeWindow: TimeWindow
): Promise<Hotspot[]> {
  const days = timeWindow === "24h" ? 1 : timeWindow === "48h" ? 2 : 7;
  const source =
    sensor === "VIIRS" ? "VIIRS_SNPP_NRT" : "MODIS_NRT";

  const url = `${FIRMS_BASE}/${MAP_KEY}/${source}/IDN/${days}`;

  try {
    const response = await fetch(url, { next: { revalidate: 300 } }); // cache 5 min
    if (!response.ok) {
      console.error("FIRMS API error:", response.status);
      return [];
    }

    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error("Failed to fetch FIRMS data:", error);
    return [];
  }
}

function parseCSV(csv: string): Hotspot[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",");
  const hotspots: Hotspot[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    if (values.length < headers.length) continue;

    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h.trim()] = values[idx]?.trim() || "";
    });

    hotspots.push({
      latitude: parseFloat(obj.latitude) || 0,
      longitude: parseFloat(obj.longitude) || 0,
      brightness: parseFloat(obj.brightness || obj.bright_ti4) || 0,
      scan: parseFloat(obj.scan) || 0,
      track: parseFloat(obj.track) || 0,
      acq_date: obj.acq_date || "",
      acq_time: obj.acq_time || "",
      satellite: obj.satellite || "",
      instrument: obj.instrument || "",
      confidence: obj.confidence || "",
      version: obj.version || "",
      bright_ti4: parseFloat(obj.bright_ti4) || 0,
      bright_ti5: parseFloat(obj.bright_ti5) || 0,
      frp: parseFloat(obj.frp) || 0,
      daynight: obj.daynight || "",
      type: parseInt(obj.type) || 0,
    });
  }

  return hotspots.filter(
    (h) =>
      h.latitude >= -11 &&
      h.latitude <= 6 &&
      h.longitude >= 95 &&
      h.longitude <= 141
  );
}

/**
 * Assign province to a hotspot based on bounding box
 */
export function assignProvince(
  lat: number,
  lng: number,
  provinces: Record<string, [number, number, number, number]>
): string {
  for (const [name, bbox] of Object.entries(provinces)) {
    const [minLat, minLng, maxLat, maxLng] = bbox;
    if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) {
      return name;
    }
  }
  return "Lainnya";
}
