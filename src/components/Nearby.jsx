import { distanceKm, timeAgo } from "../utils/helpers.js";
import { OrbitWatermark } from "./Common.jsx";

export function ActiveRadar({ communities, radius }) {
  const withDist = communities.map((c) => ({ ...c, distance: distanceKm(c.dx, c.dy) })).filter((c) => c.distance <= radius);
  const active = [...withDist].sort((a, b) => a.lastActive - b.lastActive).slice(0, 10);
  const size = 260, center = size / 2, maxR = center - 20;
  const angleFor = (id) => (parseInt(id, 10) * 47) % 360;
  return (
    <div className="px-4 pt-4">
      <div className="bg-zinc-900 rounded-2xl flex items-center justify-center py-5 border border-zinc-800">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {[1, 2, 3].map((ring) => (
            <circle key={ring} cx={center} cy={center} r={(maxR / 3) * ring} fill="none" stroke="#27272a" strokeWidth="1" />
          ))}
          <circle cx={center} cy={center} r={maxR} fill="none" stroke="#3f3f46" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx={center} cy={center} r="6" fill="#60a5fa" />
          {active.map((c) => {
            const frac = Math.min(c.distance / radius, 1);
            const r = frac * maxR;
            const angle = (angleFor(c.id) * Math.PI) / 180;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            const isLive = c.lastActive <= 10;
            return (
              <g key={c.id}>
                {isLive && <circle cx={x} cy={y} r="9" fill="#34d399" opacity="0.35">
                  <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.05;0.4" dur="2s" repeatCount="indefinite" />
                </circle>}
                <circle cx={x} cy={y} r="5" fill={isLive ? "#34d399" : "#52525b"} stroke="#09090b" strokeWidth="1.5" />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 space-y-1.5">
        {active.map((c) => (
          <div key={c.id} className="flex items-center justify-between text-sm py-1.5 border-b border-zinc-900">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-1.5 h-1.5 rounded-full ${c.lastActive <= 10 ? "bg-emerald-400" : "bg-zinc-700"}`} />
              <span className="truncate text-zinc-300">{c.name}</span>
            </div>
            <span className="text-[11px] text-zinc-500 shrink-0 ml-2 mono">{timeAgo(c.lastActive)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NearbyScreen({ communities, radius }) {
  return (
    <div className="relative flex-1 overflow-y-auto no-scrollbar pb-6">
      <OrbitWatermark />
      <div className="relative z-10">
        <div className="px-4 pt-4">
          <p className="font-bold text-zinc-50 text-lg">Active nearby now</p>
          <p className="text-xs text-zinc-500 mt-0.5">Real-time-style activity within your current radius — this is what makes Orbit different from a static group chat.</p>
        </div>
        <ActiveRadar communities={communities} radius={radius} />
      </div>
    </div>
  );
}
