import { Home, Radar, MessageCircle, Compass, User } from "lucide-react";

export function BottomNav({ active, setActive, unreadChat }) {
  const items = [
    { key: "home", label: "Home", icon: Home },
    { key: "nearby", label: "Nearby", icon: Radar },
    { key: "chat", label: "Chat", icon: MessageCircle, badge: unreadChat > 0 },
    { key: "discover", label: "Explore", icon: Compass },
    { key: "profile", label: "Profile", icon: User },
  ];
  return (
    <div className="flex items-center justify-between px-2 pb-2 pt-1.5 bg-zinc-950 border-t border-zinc-900">
      {items.map((it) => {
        const Icon = it.icon;
        const isActive = active === it.key;
        return (
          <button key={it.key} aria-label={it.label} onClick={() => setActive(it.key)} className="flex flex-col items-center gap-1 w-14 py-1.5">
            <span className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isActive ? "bg-blue-500/15" : ""}`}>
              <Icon size={21} strokeWidth={isActive ? 2.3 : 1.9} className={isActive ? "text-blue-400" : "text-zinc-500"} />
              {it.badge && <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-zinc-950" />}
            </span>
            {isActive && <span className="text-[9px] text-blue-400 font-medium">{it.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
