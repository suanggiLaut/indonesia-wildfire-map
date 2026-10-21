"use client";

import { TimeWindow, Sensor, INDONESIA_PROVINCES } from "@/types";

interface ControlPanelProps {
  timeWindow: TimeWindow;
  sensor: Sensor;
  firePower: string;
  selectedProvince: string;
  loading: boolean;
  onTimeWindowChange: (tw: TimeWindow) => void;
  onSensorChange: (s: Sensor) => void;
  onFirePowerChange: (fp: string) => void;
  onProvinceChange: (p: string) => void;
}

export default function ControlPanel({
  timeWindow,
  sensor,
  firePower,
  selectedProvince,
  loading,
  onTimeWindowChange,
  onSensorChange,
  onFirePowerChange,
  onProvinceChange,
}: ControlPanelProps) {
  const provinces = Object.keys(INDONESIA_PROVINCES).sort();

  return (
    <div className="space-y-4">
      {/* Time Window */}
      <div>
        <label className="text-[10px] text-terminal-muted uppercase tracking-wider block mb-1.5">
          Window
        </label>
        <div className="flex gap-1">
          {(["24h", "48h", "7d"] as TimeWindow[]).map((tw) => (
            <button
              key={tw}
              onClick={() => onTimeWindowChange(tw)}
              disabled={loading}
              className={`px-3 py-1.5 text-xs rounded border transition-all ${
                timeWindow === tw
                  ? "bg-terminal-orange/20 border-terminal-orange text-terminal-orange"
                  : "bg-terminal-surface border-terminal-border text-terminal-muted hover:text-terminal-text hover:border-terminal-muted"
              } disabled:opacity-50`}
            >
              {tw === "7d" ? "7 days" : tw}
            </button>
          ))}
        </div>
      </div>

      {/* Sensor */}
      <div>
        <label className="text-[10px] text-terminal-muted uppercase tracking-wider block mb-1.5">
          Sensor
        </label>
        <div className="flex gap-1">
          {(["VIIRS", "MODIS"] as Sensor[]).map((s) => (
            <button
              key={s}
              onClick={() => onSensorChange(s)}
              disabled={loading}
              className={`px-3 py-1.5 text-xs rounded border transition-all ${
                sensor === s
                  ? "bg-terminal-accent/20 border-terminal-accent text-terminal-accent"
                  : "bg-terminal-surface border-terminal-border text-terminal-muted hover:text-terminal-text hover:border-terminal-muted"
              } disabled:opacity-50`}
            >
              {s} {s === "VIIRS" ? "375m" : "1km"}
            </button>
          ))}
        </div>
      </div>

      {/* Fire Power */}
      <div>
        <label className="text-[10px] text-terminal-muted uppercase tracking-wider block mb-1.5">
          Fire Power
        </label>
        <select
          value={firePower}
          onChange={(e) => onFirePowerChange(e.target.value)}
          className="w-full bg-terminal-surface border border-terminal-border rounded px-2 py-1.5 text-xs text-terminal-text focus:outline-none focus:border-terminal-orange appearance-none cursor-pointer"
        >
          <option value="all">All levels</option>
          <option value="moderate">Moderate & up</option>
          <option value="high">High & up</option>
          <option value="vhigh">Very high & up</option>
          <option value="extreme">Extreme only</option>
        </select>
      </div>

      {/* Province */}
      <div>
        <label className="text-[10px] text-terminal-muted uppercase tracking-wider block mb-1.5">
          Provinsi
        </label>
        <select
          value={selectedProvince}
          onChange={(e) => onProvinceChange(e.target.value)}
          className="w-full bg-terminal-surface border border-terminal-border rounded px-2 py-1.5 text-xs text-terminal-text focus:outline-none focus:border-terminal-orange appearance-none cursor-pointer"
        >
          <option value="">Semua Provinsi</option>
          {provinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
