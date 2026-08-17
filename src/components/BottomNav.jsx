import { Home, Compass, CalendarDays, User } from "lucide-react";

const ITEMS = [
  { key: "home", label: "Home", icon: Home },
  { key: "explore", label: "Explore", icon: Compass },
  { key: "events", label: "Events", icon: CalendarDays },
  { key: "profile", label: "Profile", icon: User },
];

export function BottomNav({ active, setActive }) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 z-40 pointer-events-none flex justify-center px-4"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <nav
        aria-label="Primary"
        className="pointer-events-auto flex items-center gap-1 p-1.5 rounded-full glass border border-line shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.6)]"
      >
        {ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              onClick={() => setActive(key)}
              className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors duration-200 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
                isActive ? "bg-accent" : ""
              }`}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.2 : 1.9}
                className={isActive ? "text-accent-fg" : "text-fg"}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
}
