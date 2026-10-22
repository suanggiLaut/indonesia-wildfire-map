"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Hotspot, TimeWindow, Sensor } from "@/types";
import ControlPanel from "@/components/ControlPanel";
import ProvinceChart from "@/components/ProvinceChart";
import FirePowerChart from "@/components/FirePowerChart";

// Leaflet must be loaded client-side only
const FireMap = dynamic(() => import("@/components/FireMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-terminal-bg">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-terminal-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-terminal-muted">Memuat peta...</p>
      </div>
    </div>
  ),
});

const ASCII_HEADER = `
██╗  ██╗ ██████╗ ████████╗███████╗██████╗  ██████╗ ████████╗    ███╗   ███╗ █████╗ ██████╗
██║  ██║██╔═══██╗╚══██╔══╝██╔════╝██╔══██╗██╔═══██╗╚══██╔══╝    ████╗ ████║██╔══██╗██╔══██╗
███████║██║   ██║   ██║   ███████╗██████╔╝██║   ██║   ██║       ██╔████╔██║███████║██████╔╝
██╔══██║██║   ██║   ██║   ╚════██║██╔═══╝ ██║   ██║   ██║       ██║╚██╔╝██║██╔══██║██╔═══╝
██║  ██║╚██████╔╝   ██║   ███████║██║     ╚██████╔╝   ██║       ██║ ╚═╝ ██║██║  ██║██║
╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚══════╝╚═╝      ╚═════╝    ╚═╝       ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝
`.trim();

export default function Home() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string>("");

  const [timeWindow, setTimeWindow] = useState<TimeWindow>("24h");
  const [sensor, setSensor] = useState<Sensor>("VIIRS");
  const [firePower, setFirePower] = useState("all");
  const [selectedProvince, setSelectedProvince] = useState("");
  // Sidebar closed by default on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/hotspots?sensor=${sensor}&window=${timeWindow}`
      );
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setHotspots(json.data || []);
      setFetchedAt(json.fetched_at || new Date().toISOString());
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data dari NASA FIRMS. Coba lagi nanti.");
      setHotspots([]);
    } finally {
      setLoading(false);
    }
  }, [sensor, timeWindow]);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text font-mono flex flex-col">
      {/* Header */}
      <header className="border-b border-terminal-border flex-shrink-0">
        <div className="max-w-[1800px] mx-auto px-3 sm:px-4 py-2 sm:py-3">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <div className="flex items-center gap-3">
              <span className="text-terminal-muted text-[10px] sm:text-xs">
                portfolio ~/indonesia-wildfire-map
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-terminal-red animate-pulse-live" />
                <span className="text-terminal-red text-[10px] sm:text-xs font-semibold">
                  LIVE
                </span>
              </div>
              <a
                href="https://github.com/suanggiLaut/indonesia-wildfire-map"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terminal-muted text-[10px] sm:text-xs hover:text-terminal-text transition-colors"
              >
                GitHub ↗
              </a>
            </div>
          </div>

          {/* ASCII art — hidden on mobile & tablet */}
          <pre className="hidden xl:block text-[8px] 2xl:text-[10px] leading-tight text-terminal-orange/80 select-none overflow-hidden">
            {ASCII_HEADER}
          </pre>

          {/* Title */}
          <div className="mt-1 sm:mt-2">
            <h1 className="text-sm sm:text-lg md:text-xl font-bold text-terminal-text">
              Indonesia Wildfire Map{" "}
              <span className="hidden sm:inline text-terminal-muted font-normal">
                — Peta Titik Panas Kebakaran Hutan & Lahan
              </span>
            </h1>
            <p className="text-[10px] sm:text-xs text-terminal-muted mt-0.5 sm:mt-1">
              Data satelit real-time NASA VIIRS & MODIS · 24h / 48h / 7 hari
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col lg:flex-row" style={{ minHeight: "calc(100vh - 200px)" }}>
        {/* Sidebar toggle (mobile/tablet) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden flex items-center justify-between px-3 py-2 border-b border-terminal-border bg-terminal-surface text-xs text-terminal-muted flex-shrink-0"
        >
          <span className="flex items-center gap-2">
            <span>⚙</span>
            <span>Filter & Statistik</span>
            {loading && (
              <span className="text-terminal-orange animate-pulse">●</span>
            )}
            {!loading && hotspots.length > 0 && (
              <span className="text-terminal-orange font-semibold">
                {hotspots.length.toLocaleString()} hotspot
              </span>
            )}
          </span>
          <span className="text-base">{sidebarOpen ? "▲" : "▼"}</span>
        </button>

        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } lg:block w-full lg:w-72 xl:w-80 border-r border-terminal-border bg-terminal-bg overflow-y-auto flex-shrink-0`}
          style={{ maxHeight: sidebarOpen ? "60vh" : undefined }}
        >
          <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
            {/* Controls */}
            <ControlPanel
              timeWindow={timeWindow}
              sensor={sensor}
              firePower={firePower}
              selectedProvince={selectedProvince}
              loading={loading}
              onTimeWindowChange={setTimeWindow}
              onSensorChange={setSensor}
              onFirePowerChange={setFirePower}
              onProvinceChange={setSelectedProvince}
            />

            {/* Stats box */}
            <div className="bg-terminal-surface border border-terminal-border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-terminal-muted uppercase tracking-wider">
                  Status
                </span>
                {loading && (
                  <span className="text-[10px] text-terminal-orange animate-pulse">
                    Loading...
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-terminal-orange">
                    {hotspots.length.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-terminal-muted">
                    Total Hotspot
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-terminal-red">
                    ≈{" "}
                    {hotspots
                      .filter((h) => h.confidence === "high" || h.confidence === "h" || Number(h.confidence) >= 80)
                      .length.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-terminal-muted">
                    High Confidence
                  </div>
                </div>
              </div>
              {fetchedAt && (
                <div className="text-[9px] text-terminal-muted pt-1 border-t border-terminal-border">
                  Terakhir diperbarui:{" "}
                  {new Date(fetchedAt).toLocaleString("id-ID")}
                </div>
              )}
            </div>

            {/* Fire Power Chart */}
            <FirePowerChart hotspots={hotspots} />

            {/* Province Chart — hidden on mobile sidebar to save space */}
            <div className="hidden sm:block lg:block">
              <ProvinceChart
                hotspots={hotspots}
                firePower={firePower}
                onSelectProvince={setSelectedProvince}
              />
            </div>
          </div>
        </aside>

        {/* Map — explicit height is critical for Leaflet on mobile */}
        <div className="flex-1 relative min-h-[300px] sm:min-h-[400px] lg:min-h-0">
          {error && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-terminal-bg/80">
              <div className="bg-terminal-surface border border-terminal-red/50 rounded-lg p-4 sm:p-6 max-w-sm mx-4 text-center">
                <div className="text-terminal-red text-2xl sm:text-3xl mb-2">⚠</div>
                <p className="text-xs sm:text-sm text-terminal-text mb-3">{error}</p>
                <button
                  onClick={fetchData}
                  className="px-4 py-2 text-xs bg-terminal-orange/20 border border-terminal-orange text-terminal-orange rounded hover:bg-terminal-orange/30 transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          )}
          {loading && hotspots.length === 0 && (
            <div className="absolute inset-0 z-[999] flex items-center justify-center bg-terminal-bg">
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-terminal-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-terminal-muted">Mengambil data hotspot...</p>
                <p className="text-[10px] text-terminal-muted/60 mt-1">NASA FIRMS WFS API</p>
              </div>
            </div>
          )}
          <FireMap
            hotspots={hotspots}
            firePower={firePower}
            selectedProvince={selectedProvince}
          />
        </div>
      </main>

      {/* Footer — only visible when scrolled (on desktop the page doesn't scroll, so it's always visible) */}
      <footer className="border-t border-terminal-border py-2 sm:py-4 px-3 sm:px-4 flex-shrink-0">
        <div className="max-w-[1800px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2 text-[9px] sm:text-[10px] text-terminal-muted">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            <span>indonesia-wildfire-map</span>
            <span className="hidden sm:inline">·</span>
            <span>
              Data:{" "}
              <a
                href="https://firms.modaps.eosdis.nasa.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terminal-accent hover:underline"
              >
                NASA FIRMS
              </a>
            </span>
            <span>·</span>
            <span>
              Basemap:{" "}
              <a
                href="https://www.openstreetmap.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terminal-accent hover:underline"
              >
                OpenStreetMap
              </a>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            <span>
              Next.js + Leaflet + Tailwind
            </span>
            <span>·</span>
            <span>Bukan untuk darurat — hubungi BNPB/BPBD</span>
          </div>
        </div>
      </footer>

      {/* Info section */}
      <section className="border-t border-terminal-border">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8 sm:space-y-10">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-terminal-text mb-3">
              Apa yang ditampilkan
            </h2>
            <p className="text-[11px] sm:text-xs text-terminal-muted leading-relaxed">
              Peta ini menampilkan <strong className="text-terminal-orange">titik panas (hotspot)</strong>{" "}
              yang terdeteksi oleh satelit NASA di seluruh wilayah Indonesia.
              Titik oranye adalah hotspot aktif yang terdeteksi oleh instrumen
              VIIRS (resolusi 375m) dan MODIS (resolusi 1km). Data diambil dari{" "}
              <strong className="text-terminal-accent">NASA FIRMS</strong>{" "}
              (Fire Information for Resource Management System) — sumber data
              yang sama yang digunakan oleh BMKG dan KLHK untuk pemantauan
              karhutla.
            </p>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-terminal-text mb-3">
              Klasifikasi Fire Power
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] sm:text-xs">
                <thead>
                  <tr className="text-terminal-muted border-b border-terminal-border">
                    <th className="text-left py-2 pr-4">Kelas</th>
                    <th className="text-left py-2 pr-4">Fire Radiative Power</th>
                    <th className="text-left py-2">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="text-terminal-text">
                  <tr className="border-b border-terminal-border/30">
                    <td className="py-2 pr-4"><span className="text-fire-low">● LOW</span></td>
                    <td className="py-2 pr-4">&lt; 20 MW</td>
                    <td className="py-2 text-terminal-muted">Titik panas kecil, bisa jadi pembakaran lahan</td>
                  </tr>
                  <tr className="border-b border-terminal-border/30">
                    <td className="py-2 pr-4"><span className="text-fire-moderate">● MODERATE</span></td>
                    <td className="py-2 pr-4">20–50 MW</td>
                    <td className="py-2 text-terminal-muted">Kebakaran sedang</td>
                  </tr>
                  <tr className="border-b border-terminal-border/30">
                    <td className="py-2 pr-4"><span className="text-fire-high">● HIGH</span></td>
                    <td className="py-2 pr-4">50–200 MW</td>
                    <td className="py-2 text-terminal-muted">Kebakaran signifikan</td>
                  </tr>
                  <tr className="border-b border-terminal-border/30">
                    <td className="py-2 pr-4"><span className="text-fire-vhigh">● VERY HIGH</span></td>
                    <td className="py-2 pr-4">200–500 MW</td>
                    <td className="py-2 text-terminal-muted">Kebakaran besar</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4"><span className="text-fire-extreme">● EXTREME</span></td>
                    <td className="py-2 pr-4">≥ 500 MW</td>
                    <td className="py-2 text-terminal-muted">Kebakaran sangat besar</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-terminal-text mb-3">
              Sumber Data
            </h2>
            <ul className="text-[11px] sm:text-xs text-terminal-muted space-y-1.5 list-none">
              <li>
                <span className="text-terminal-orange">→</span>{" "}
                <strong className="text-terminal-text">Hotspot:</strong> NASA
                FIRMS — VIIRS (S-NPP, NOAA-20 & NOAA-21) dan MODIS (Terra & Aqua)
              </li>
              <li>
                <span className="text-terminal-orange">→</span>{" "}
                <strong className="text-terminal-text">Basemap:</strong> OpenStreetMap
                (dark theme via CSS filter)
              </li>
              <li>
                <span className="text-terminal-orange">→</span>{" "}
                <strong className="text-terminal-text">Provinsi:</strong>{" "}
                Bounding box assignment (estimasi, bukan batas administratif resmi)
              </li>
            </ul>
          </div>

          <div className="bg-terminal-surface border border-terminal-border rounded-lg p-4">
            <h2 className="text-xs sm:text-sm font-bold text-terminal-red mb-2">
              ⚠ Disclaimer
            </h2>
            <p className="text-[11px] sm:text-xs text-terminal-muted leading-relaxed">
              Peta ini <strong className="text-terminal-text">BUKAN</strong>{" "}
              layanan darurat. Data satelit memiliki jeda beberapa jam dan bisa
              melewatkan kebakaran kecil. Hotspot juga bisa mendeteksi sumber
              panas non-kebakaran seperti industri, gunung berapi, atau flare
              gas. Untuk informasi resmi, hubungi{" "}
              <strong className="text-terminal-accent">BNPB (117)</strong> atau
              BPBD setempat. Untuk pelaporan karhutla, gunakan aplikasi{" "}
              <strong className="text-terminal-accent">SiPongi</strong> KLHK.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
