export interface Hotspot {
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
  version: string;
  bright_ti4: number;
  bright_ti5: number;
  frp: number;
  daynight: string;
  type: number;
}

export type TimeWindow = "24h" | "48h" | "7d";
export type Sensor = "VIIRS" | "MODIS";
export type FirePower = "all" | "moderate" | "high" | "vhigh" | "extreme";

export interface ProvinceCount {
  province: string;
  count: number;
}

export interface FirePowerMix {
  low: number;
  moderate: number;
  high: number;
  vhigh: number;
  extreme: number;
}

export const INDONESIA_PROVINCES: Record<string, [number, number, number, number]> = {
  "Aceh": [2.0, 95.0, 6.0, 98.5],
  "Sumatera Utara": [0.0, 97.0, 4.5, 100.5],
  "Sumatera Barat": [-2.5, 98.5, 1.5, 101.8],
  "Riau": [-1.0, 100.0, 2.5, 104.0],
  "Jambi": [-2.8, 101.5, -0.5, 105.0],
  "Sumatera Selatan": [-5.0, 103.0, -1.5, 106.5],
  "Bengkulu": [-5.5, 101.0, -2.0, 104.0],
  "Lampung": [-6.0, 103.5, -3.5, 106.5],
  "Kepulauan Bangka Belitung": [-3.5, 105.0, -1.5, 109.0],
  "Kepulauan Riau": [-1.0, 103.0, 4.5, 109.0],
  "DKI Jakarta": [-6.4, 106.6, -6.0, 107.0],
  "Jawa Barat": [-7.8, 106.0, -6.0, 108.8],
  "Jawa Tengah": [-8.0, 108.5, -6.0, 111.5],
  "DI Yogyakarta": [-8.2, 110.0, -7.5, 110.8],
  "Jawa Timur": [-8.8, 111.0, -6.5, 114.6],
  "Banten": [-7.2, 105.0, -6.0, 106.7],
  "Bali": [-8.9, 114.4, -8.0, 115.8],
  "Nusa Tenggara Barat": [-9.2, 115.5, -8.0, 119.2],
  "Nusa Tenggara Timur": [-11.0, 118.5, -8.0, 125.5],
  "Kalimantan Barat": [-3.5, 108.0, 2.5, 110.5],
  "Kalimantan Tengah": [-4.0, 111.0, -0.5, 116.0],
  "Kalimantan Selatan": [-4.5, 114.5, -2.0, 116.5],
  "Kalimantan Timur": [-2.5, 115.5, 2.5, 118.5],
  "Kalimantan Utara": [1.5, 115.0, 4.5, 118.0],
  "Sulawesi Utara": [-1.0, 122.0, 4.0, 127.5],
  "Sulawesi Tengah": [-3.5, 119.5, 1.0, 124.5],
  "Sulawesi Selatan": [-6.5, 119.0, -2.5, 121.5],
  "Sulawesi Tenggara": [-6.5, 120.5, -3.0, 124.5],
  "Gorontalo": [-0.8, 121.0, 1.2, 123.5],
  "Sulawesi Barat": [-3.5, 118.5, -1.0, 119.8],
  "Maluku": [-8.5, 125.0, -2.5, 135.0],
  "Maluku Utara": [-2.0, 124.0, 3.0, 129.5],
  "Papua": [-9.5, 135.0, -0.5, 141.5],
  "Papua Barat": [-4.5, 129.5, 0.0, 135.5],
  "Papua Selatan": [-9.0, 137.0, -5.0, 141.0],
  "Papua Tengah": [-5.0, 135.5, -2.0, 140.0],
  "Papua Pegunungan": [-5.5, 137.5, -3.0, 141.5],
  "Papua Barat Daya": [-4.0, 129.0, -1.0, 133.0],
};

export function getFirePowerClass(frp: number): string {
  if (frp >= 500) return "extreme";
  if (frp >= 200) return "vhigh";
  if (frp >= 50) return "high";
  if (frp >= 20) return "moderate";
  return "low";
}

export function getFirePowerColor(cls: string): string {
  switch (cls) {
    case "extreme": return "#991b1b";
    case "vhigh": return "#dc2626";
    case "high": return "#ef4444";
    case "moderate": return "#f59e0b";
    case "low": return "#fbbf24";
    default: return "#fbbf24";
  }
}

export function getFirePowerLabel(cls: string): string {
  switch (cls) {
    case "extreme": return "EXTREME";
    case "vhigh": return "VERY HIGH";
    case "high": return "HIGH";
    case "moderate": return "MODERATE";
    case "low": return "LOW";
    default: return "LOW";
  }
}
