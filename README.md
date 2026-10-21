# 🔥 Indonesia Wildfire Map

**Peta titik panas (hotspot) kebakaran hutan dan lahan di Indonesia secara real-time dari satelit NASA.**

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green?logo=leaflet)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Fitur

- 🗺️ **Peta interaktif** — Leaflet.js dengan dark basemap (CARTO)
- 🛰️ **Data real-time** — NASA FIRMS (VIIRS 375m & MODIS 1km)
- 🕐 **Time window** — 24 jam, 48 jam, atau 7 hari
- 📊 **Statistik per provinsi** — chart horizontal bars
- 🔥 **Fire Power classification** — LOW → EXTREME berdasarkan FRP (MW)
- 📱 **Responsive** — mobile-friendly dengan sidebar collapse
- 🌙 **Dark terminal aesthetic** — monospace, ASCII header
- ⚡ **Auto-refresh** — data diperbarui setiap 5 menit

## 🛠️ Tech Stack

| Layer      | Technology              |
|------------|------------------------|
| Framework  | Next.js 14 (App Router)|
| Map        | Leaflet + react-leaflet|
| Styling    | Tailwind CSS           |
| Data       | NASA FIRMS API         |
| Language   | TypeScript             |
| Deploy     | Vercel (Singapore)     |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- NASA FIRMS API key (free): https://firms.modaps.eosdis.nasa.gov/api/

### Setup

```bash
# Clone repo
git clone https://github.com/YOUR_USERNAME/indonesia-wildfire-map.git
cd indonesia-wildfire-map

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your NASA FIRMS API key

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

1. Push ke GitHub
2. Import repository di [vercel.com/new](https://vercel.com/new)
3. Tambah environment variable: `NASA_FIRMS_KEY` = API key kamu
4. Deploy ✅

Region sudah dikonfigurasi ke **Singapore (sin1)** untuk latency terbaik ke Indonesia.

## 📡 Data Source

| Source | Description |
|--------|-------------|
| [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/) | Fire Information for Resource Management System — hotspot dari VIIRS & MODIS |
| [CARTO](https://carto.com/) | Dark basemap tiles |

## 📁 Project Structure

```
indonesia-wildfire-map/
├── src/
│   ├── app/
│   │   ├── api/hotspots/route.ts   # NASA FIRMS proxy API
│   │   ├── globals.css              # Tailwind + dark theme
│   │   ├── layout.tsx               # SEO metadata
│   │   └── page.tsx                 # Main page
│   ├── components/
│   │   ├── ControlPanel.tsx         # Filter controls
│   │   ├── FireMap.tsx              # Leaflet map
│   │   ├── FirePowerChart.tsx       # Power mix chart
│   │   └── ProvinceChart.tsx        # Province bar chart
│   ├── lib/
│   │   └── firms.ts                 # NASA FIRMS data fetcher
│   └── types/
│       └── index.ts                 # Types + province data
├── vercel.json                      # Vercel config (SIN region)
├── .env.example
├── tailwind.config.ts
└── package.json
```

## ⚠️ Disclaimer

Peta ini **BUKAN** layanan darurat. Data satelit memiliki jeda beberapa jam dan bisa melewatkan kebakaran kecil. Untuk informasi resmi, hubungi **BNPB (117)** atau BPBD setempat.

## 📄 License

MIT — feel free to use, modify, and share.

---

*Data: [NASA FIRMS/GIBS](https://firms.modaps.eosdis.nasa.gov/) · Basemap: [CARTO](https://carto.com/)*
