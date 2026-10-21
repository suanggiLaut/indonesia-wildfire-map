# 🔥 Indonesia Wildfire Map

**Peta titik panas (hotspot) kebakaran hutan dan lahan di Indonesia secara real-time dari satelit NASA.**

🌐 **Live Demo:** [indonesia-wildfire-map.vercel.app](https://indonesia-wildfire-map.vercel.app/)

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green?logo=leaflet)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Fitur

- 🗺️ **Peta interaktif** — Leaflet.js dengan dark basemap (OpenStreetMap dark theme)
- 🛰️ **Data real-time** — NASA FIRMS WFS (VIIRS SNPP, NOAA-20, NOAA-21 & MODIS)
- 🕐 **Time window** — 24 jam, 48 jam, atau 7 hari
- 📊 **Statistik per provinsi** — chart horizontal bars (top 15 provinsi)
- 🔥 **Fire Power classification** — LOW → EXTREME berdasarkan FRP (MW)
- 🗂️ **Filter provinsi** — 38 provinsi Indonesia dengan fly-to otomatis
- 🌙 **Dark terminal aesthetic** — JetBrains Mono, ASCII header
- ⚡ **Auto-refresh** — data diperbarui setiap 5 menit
- 📦 **Server-side caching** — API proxy dengan 5 menit cache

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|----------------------------------|
| Framework  | Next.js 14 (App Router)          |
| Map        | Leaflet.js                        |
| Styling    | Tailwind CSS                      |
| Data       | NASA FIRMS WFS API (GeoJSON)      |
| Language   | TypeScript                        |
| Font       | JetBrains Mono                    |
| Deploy     | Vercel (Singapore region)         |

## 🔥 Fire Power Classification

| Level     | FRP (MW)   | Warna   |
|-----------|------------|---------|
| LOW       | < 20       | 🟡 Kuning |
| MODERATE  | 20 - 50    | 🟠 Orange |
| HIGH      | 50 - 200   | 🔴 Merah  |
| VERY HIGH | 200 - 500  | 🟣 Ungu   |
| EXTREME   | ≥ 500      | ⚪ Putih  |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- NASA FIRMS MAP KEY (free): [firms.modaps.eosdis.nasa.gov/api/](https://firms.modaps.eosdis.nasa.gov/api/)

### Setup

```bash
# Clone repo
git clone https://github.com/suanggiLaut/indonesia-wildfire-map.git
cd indonesia-wildfire-map

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local dan masukkan NASA FIRMS MAP KEY kamu

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for production

```bash
npm run build
npm start
```

## 🌐 Deploy ke Vercel

1. Fork / push repo ke GitHub
2. Import repository di [vercel.com/new](https://vercel.com/new)
3. Tambah environment variable:
   - **Key:** `NASA_FIRMS_KEY`
   - **Value:** MAP KEY dari NASA FIRMS
4. Deploy ✅

Region sudah dikonfigurasi ke **Singapore (sin1)** untuk latency terbaik ke Indonesia.

## 📡 Data Source

| Source | Description |
|--------|-------------|
| [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/) | Fire Information for Resource Management System — hotspot dari VIIRS (SNPP, NOAA-20, NOAA-21) & MODIS via WFS endpoint |
| [OpenStreetMap](https://www.openstreetmap.org/) | Basemap tiles dengan CSS dark filter |

## 📁 Project Structure

```
indonesia-wildfire-map/
├── src/
│   ├── app/
│   │   ├── api/hotspots/route.ts   # NASA FIRMS WFS proxy (GeoJSON)
│   │   ├── globals.css              # Tailwind + dark theme + Leaflet overrides
│   │   ├── layout.tsx               # SEO metadata (Indonesian)
│   │   └── page.tsx                 # Main page + sidebar + controls
│   ├── components/
│   │   ├── ControlPanel.tsx         # Filter: time, sensor, fire power, provinsi
│   │   ├── FireMap.tsx              # Leaflet map + dark OSM tiles
│   │   ├── FirePowerChart.tsx       # Fire power distribution chart
│   │   └── ProvinceChart.tsx        # Top 15 province bar chart
│   ├── lib/
│   │   └── firms.ts                 # FIRMS data utilities
│   └── types/
│       └── index.ts                 # TypeScript types + 38 province bounding boxes
├── vercel.json                      # Vercel config (SIN1 region + cache headers)
├── .env.example
├── tailwind.config.ts
└── package.json
```

## ⚠️ Disclaimer

Peta ini **BUKAN** layanan darurat. Data satelit memiliki jeda beberapa jam dan bisa melewatkan kebakaran kecil. Untuk informasi resmi, hubungi **BNPB (117)** atau BPBD setempat.

## 📄 License

MIT — feel free to use, modify, and share.

---

*Data: [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/) · Basemap: [OpenStreetMap](https://www.openstreetmap.org/)*
