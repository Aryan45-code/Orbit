import { Monitor, Moon, Sun } from "lucide-react";
import { COLOR_MAP } from "../data/constants.js";

export function Logo({ size = "text-2xl" }) {
  return (
    <span
      className={`${size} tracking-tight text-fg select-none`}
      style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
    >
      Orbit
    </span>
  );
}

export function Avatar({ label, size = 44, color = "blue", ring = false }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;
  const inner = (
    <div
      className={`${c.tint} ${c.text} rounded-full flex items-center justify-center font-semibold shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {label}
    </div>
  );
  if (!ring) return inner;
  return (
    <div
      className="story-ring rounded-full p-[2px] shrink-0"
      style={{ width: size + 6, height: size + 6 }}
    >
      <div className="bg-canvas rounded-full p-[2px] w-full h-full">{inner}</div>
    </div>
  );
}

// IG's primary action button: solid blue, white label, quietly rounded.
export const btnPrimary =
  "bg-accent text-accent-fg text-sm font-semibold rounded-lg px-4 py-1.5 active:opacity-70 transition-opacity disabled:opacity-40";

export const btnSecondary =
  "bg-surface-3 text-fg text-sm font-semibold rounded-lg px-4 py-1.5 active:opacity-70 transition-opacity disabled:opacity-40";

export function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-rise-in absolute left-1/2 -translate-x-1/2 bottom-28 bg-fg text-canvas text-sm font-medium px-4 py-2.5 rounded-lg shadow-lg z-50 whitespace-nowrap"
    >
      {message}
    </div>
  );
}

export function GuestBanner({ onVerify }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-line">
      <p className="text-xs text-fg-muted leading-snug">
        Browsing as a guest — verify to join, create or chat
      </p>
      <button onClick={onVerify} className="text-xs text-accent font-semibold shrink-0">
        Verify
      </button>
    </div>
  );
}

export function PreviewBanner() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-line bg-surface-2">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-accent">
        Preview
      </span>
      <p className="text-[11px] text-fg-muted leading-snug">
        Sample data — nothing you do here is saved.
      </p>
    </div>
  );
}

const THEME_OPTIONS = [
  { key: "system", label: "System", icon: Monitor },
  { key: "light", label: "Light", icon: Sun },
  { key: "dark", label: "Dark", icon: Moon },
];

export function ThemeSegment({ mode, setMode }) {
  return (
    <div
      role="radiogroup"
      aria-label="Appearance"
      className="flex gap-1 p-1 rounded-xl bg-surface-2 border border-line"
    >
      {THEME_OPTIONS.map(({ key, label, icon: Icon }) => {
        const active = mode === key;
        return (
          <button
            key={key}
            role="radio"
            aria-checked={active}
            onClick={() => setMode(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              active ? "bg-canvas text-fg shadow-sm" : "text-fg-muted"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
