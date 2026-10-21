"use client";

import { useMemo } from "react";
import { Hotspot, INDONESIA_PROVINCES, getFirePowerClass } from "@/types";
import { assignProvince } from "@/lib/firms";

interface ProvinceChartProps {
  hotspots: Hotspot[];
  firePower: string;
  onSelectProvince: (province: string) => void;
}

export default function ProvinceChart({
  hotspots,
  firePower,
  onSelectProvince,
}: ProvinceChartProps) {
  const provinceCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    hotspots.forEach((h) => {
      const cls = getFirePowerClass(h.frp);
      if (firePower === "moderate" && cls === "low") return;
      if (firePower === "high" && (cls === "low" || cls === "moderate")) return;
      if (firePower === "vhigh" && (cls === "low" || cls === "moderate" || cls === "high")) return;
      if (firePower === "extreme" && cls !== "extreme") return;

      const province = assignProvince(h.latitude, h.longitude, INDONESIA_PROVINCES);
      counts[province] = (counts[province] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
  }, [hotspots, firePower]);

  const maxCount = provinceCounts[0]?.[1] || 1;

  if (provinceCounts.length === 0) {
    return (
      <div className="text-terminal-muted text-xs text-center py-4">
        Tidak ada data hotspot
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <h3 className="text-xs font-semibold text-terminal-muted uppercase tracking-wider mb-3">
        Hotspot per Provinsi
      </h3>
      {provinceCounts.map(([province, count]) => (
        <button
          key={province}
          onClick={() => onSelectProvince(province)}
          className="w-full group flex items-center gap-2 text-left hover:bg-terminal-border/30 rounded px-1 py-0.5 transition-colors"
        >
          <span className="text-[10px] text-terminal-muted w-24 truncate flex-shrink-0">
            {province}
          </span>
          <div className="flex-1 h-3 bg-terminal-border/30 rounded overflow-hidden">
            <div
              className="h-full rounded transition-all duration-500"
              style={{
                width: `${(count / maxCount) * 100}%`,
                background: `linear-gradient(90deg, #f97316, #ef4444)`,
              }}
            />
          </div>
          <span className="text-[10px] font-semibold text-terminal-orange w-8 text-right flex-shrink-0">
            {count}
          </span>
        </button>
      ))}
    </div>
  );
}
