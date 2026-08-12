import { Home, Compass, CalendarDays, User } from "lucide-react";

export function BottomNav({ active, setActive }) {
  const items = [
    { key: "home", label: "Home", icon: Home },
    { key: "explore", label: "Explore", icon: Compass },
    { key: "events", label: "Events", icon: CalendarDays },
    { key: "profile", label: "Profile", icon: User },
  ];
  return (
    <div
      className="flex items-center justify-between px-2 pt-1.5 bg-zinc-950 border-t border-zinc-900"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      {items.map((it) => {
        const Icon = it.icon;
        const isActive = active === it.key;
        return (
          <button key={it.key} aria-label={it.label} onClick={() => setActive(it.key)} className="flex flex-col items-center gap-1 w-14 py-1.5 active:scale-90 transition-transform">
            <span className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 ${isActive ? "bg-violet-500/15 animate-pop-in" : ""}`}>
              <Icon size={21} strokeWidth={isActive ? 2.3 : 1.9} className={isActive ? "text-violet-400" : "text-zinc-500"} />
              {it.badge && <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-zinc-950" />}
            </span>
            {isActive && <span className="text-[9px] text-violet-400 font-medium animate-fade-in">{it.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
