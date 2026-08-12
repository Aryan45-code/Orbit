import { Orbit as OrbitIcon } from "lucide-react";
import { COLOR_MAP } from "../data/constants.js";

export function Logo({ size = "text-xl" }) {
  const iconSize = size === "text-xl" ? 20 : 26;
  return (
    <span className={`${size} font-bold tracking-tight flex items-center gap-1.5`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <OrbitIcon size={iconSize} className="text-blue-400" strokeWidth={2.4} />
      <span className="text-zinc-50">Orbit</span>
    </span>
  );
}

export function Avatar({ label, size = 40, color = "indigo", ring = false }) {
  const c = COLOR_MAP[color] || COLOR_MAP.indigo;
  const inner = (
    <div className={`${c.tint} ${c.text} rounded-full flex items-center justify-center font-semibold shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {label}
    </div>
  );
  if (!ring) return inner;
  return (
    <div className="rounded-full bg-gradient-to-br from-blue-400 to-emerald-400 p-[2px] shrink-0" style={{ width: size + 4, height: size + 4 }}>
      <div className="bg-zinc-950 rounded-full w-full h-full flex items-center justify-center">{inner}</div>
    </div>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-24 bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm px-4 py-2 rounded-full shadow-lg shadow-black/40 z-50 whitespace-nowrap">
      {message}
    </div>
  );
}

export function GuestBanner({ onVerify }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2 bg-amber-500/10 border-b border-amber-500/20">
      <p className="text-[11px] text-amber-300 leading-snug">Browsing as guest — verify to join, create or chat</p>
      <button onClick={onVerify} className="text-[11px] text-blue-400 font-semibold shrink-0">Verify now</button>
    </div>
  );
}

// Alternate orbit emblem — three crossing elliptical rings around a center
// point, like electron orbits around a nucleus. Used in place of the plain
// lucide Orbit glyph wherever the brand mark needs to feel a bit more custom.
export function OrbitEmblem({ size = 300, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      <circle cx="50" cy="50" r="3.5" fill="currentColor" />
      <ellipse cx="50" cy="50" rx="46" ry="18" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="50" cy="50" rx="46" ry="18" stroke="currentColor" strokeWidth="1.2" transform="rotate(60 50 50)" />
      <ellipse cx="50" cy="50" rx="46" ry="18" stroke="currentColor" strokeWidth="1.2" transform="rotate(120 50 50)" />
    </svg>
  );
}

// Subtle full-page emblem — sits behind every screen's content at near-zero
// opacity so it reads as texture, not a UI element. Never intercepts clicks.
export function OrbitWatermark({ size = 300 }) {
  return (
    <div className="pointer-events-none select-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
      <OrbitEmblem size={size} className="text-zinc-100 opacity-[0.04]" />
    </div>
  );
}
