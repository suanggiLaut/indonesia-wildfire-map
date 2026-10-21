"use client";

import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Hotspot, getFirePowerClass, getFirePowerColor, getFirePowerLabel } from "@/types";

interface FireMapProps {
  hotspots: Hotspot[];
  firePower: string;
  selectedProvince: string;
  onSelectHotspot?: (h: Hotspot) => void;
}

export default function FireMap({
  hotspots,
  firePower,
  selectedProvince,
  onSelectHotspot,
}: FireMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [-2.5, 118],
      zoom: 5,
      minZoom: 4,
      maxZoom: 15,
      zoomControl: true,
      attributionControl: true,
    });

    // Dark basemap
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Filter hotspots
  const filtered = useMemo(() => {
    return hotspots.filter((h) => {
      const cls = getFirePowerClass(h.frp);
      if (firePower === "moderate" && cls === "low") return false;
      if (firePower === "high" && (cls === "low" || cls === "moderate"))
        return false;
      if (
        firePower === "vhigh" &&
        (cls === "low" || cls === "moderate" || cls === "high")
      )
        return false;
      if (firePower === "extreme" && cls !== "extreme") return false;
      return true;
    });
  }, [hotspots, firePower]);

  // Update markers
  useEffect(() => {
    if (!markersRef.current) return;
    markersRef.current.clearLayers();

    filtered.forEach((h) => {
      const cls = getFirePowerClass(h.frp);
      const color = getFirePowerColor(cls);
      const radius = cls === "extreme" ? 8 : cls === "vhigh" ? 7 : cls === "high" ? 6 : cls === "moderate" ? 5 : 4;

      const marker = L.circleMarker([h.latitude, h.longitude], {
        radius,
        fillColor: color,
        color: color,
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0.7,
      });

      marker.bindPopup(
        `<div style="font-size:11px;line-height:1.6">
          <div style="font-weight:600;color:${color};margin-bottom:4px;">
            🔥 ${getFirePowerLabel(cls)}
          </div>
          <div>Lat: ${h.latitude.toFixed(4)}</div>
          <div>Lng: ${h.longitude.toFixed(4)}</div>
          <div>FRP: ${h.frp.toFixed(1)} MW</div>
          <div>Brightness: ${h.brightness.toFixed(1)} K</div>
          <div>Satelit: ${h.satellite}</div>
          <div>Waktu: ${h.acq_date} ${h.acq_time}</div>
          <div>Confidence: ${h.confidence}</div>
          <div style="margin-top:4px;color:#737373;font-size:10px">${h.daynight === "D" ? "☀️ Siang" : "🌙 Malam"}</div>
        </div>`
      );

      marker.on("click", () => onSelectHotspot?.(h));
      marker.addTo(markersRef.current!);
    });
  }, [filtered, onSelectHotspot]);

  // Fly to province
  useEffect(() => {
    if (!mapRef.current || !selectedProvince) return;

    const { INDONESIA_PROVINCES } = require("@/types");
    const bbox = INDONESIA_PROVINCES[selectedProvince];
    if (bbox) {
      const [minLat, minLng, maxLat, maxLng] = bbox;
      mapRef.current.flyToBounds(
        [
          [minLat, minLng],
          [maxLat, maxLng],
        ],
        { padding: [30, 30], duration: 1 }
      );
    }
  }, [selectedProvince]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {/* Live indicator */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2 bg-terminal-surface/90 border border-terminal-border px-3 py-1.5 rounded text-xs">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-live" />
        <span className="text-terminal-muted">LIVE</span>
        <span className="text-terminal-text font-semibold">
          {filtered.length.toLocaleString()} hotspot
        </span>
      </div>
    </div>
  );
}
