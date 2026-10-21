"use client";

import { useMemo } from "react";
import { Hotspot, getFirePowerClass, getFirePowerColor, getFirePowerLabel } from "@/types";

interface FirePowerChartProps {
  hotspots: Hotspot[];
}

const CLASSES = ["low", "moderate", "high", "vhigh", "extreme"] as const;

export default function FirePowerChart({ hotspots }: FirePowerChartProps) {
  const mix = useMemo(() => {
    const counts = { low: 0, moderate: 0, high: 0, vhigh: 0, extreme: 0 };
    hotspots.forEach((h) => {
      const cls = getFirePowerClass(h.frp) as keyof typeof counts;
      if (cls in counts) counts[cls]++;
    });
    return counts;
  }, [hotspots]);

  const total = Object.values(mix).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-terminal-muted uppercase tracking-wider">
        Fire Power Mix
      </h3>

      {/* Stacked bar */}
      <div className="h-5 flex rounded overflow-hidden">
        {CLASSES.map((cls) => {
          const pct = (mix[cls] / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={cls}
              className="h-full transition-all duration-500 relative group"
              style={{
                width: `${pct}%`,
                backgroundColor: getFirePowerColor(cls),
              }}
            >
              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-terminal-surface border border-terminal-border text-[9px] text-terminal-text px-1.5 py-0.5 rounded whitespace-nowrap z-10 transition-opacity">
                {getFirePowerLabel(cls)}: {mix[cls]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {CLASSES.map((cls) => (
          <div key={cls} className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-sm"
              style={{ backgroundColor: getFirePowerColor(cls) }}
            />
            <span className="text-[9px] text-terminal-muted">
              {getFirePowerLabel(cls)}{" "}
              <span className="text-terminal-text">{mix[cls]}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
