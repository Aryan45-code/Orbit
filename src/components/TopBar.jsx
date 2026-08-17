import { Coffee, Search, MessageCircle, Heart, Clock } from "lucide-react";
import { useClickOutside } from "../utils/hooks.js";
import { Logo } from "./Common.jsx";

export function TopBar({ notifOpen, setNotifOpen, onTeaClick, onSearchClick, onMessagesClick }) {
  const notifRef = useClickOutside(notifOpen, () => setNotifOpen(false));
  const iconBtn =
    "w-8 h-8 flex items-center justify-center text-fg active:opacity-50 transition-opacity";
  return (
    <div
      ref={notifRef}
      className="relative flex items-center justify-between px-4 pb-3 bg-canvas border-b border-line shrink-0"
      style={{ paddingTop: "max(0.875rem, env(safe-area-inset-top))" }}
    >
      <Logo />
      <div className="flex items-center gap-4">
        <button aria-label="Locali-Tea" onClick={onTeaClick} className={iconBtn}>
          <Coffee size={23} strokeWidth={1.8} />
        </button>
        <button aria-label="Search" onClick={onSearchClick} className={iconBtn}>
          <Search size={23} strokeWidth={1.8} />
        </button>
        <button
          aria-label="Notifications"
          aria-expanded={notifOpen}
          onClick={() => setNotifOpen(!notifOpen)}
          className={iconBtn}
        >
          <Heart size={23} strokeWidth={1.8} />
        </button>
        <button aria-label="Messages" onClick={onMessagesClick} className={iconBtn}>
          <MessageCircle size={23} strokeWidth={1.8} />
        </button>
      </div>
      {notifOpen && (
        <div className="animate-rise-in absolute right-4 top-full mt-1 w-60 bg-surface rounded-xl shadow-xl shadow-black/10 dark:shadow-black/60 border border-line z-40 overflow-hidden">
          <div className="px-4 py-3 border-b border-line font-semibold text-fg text-sm">
            Notifications
          </div>
          <div className="px-4 py-6 flex flex-col items-center text-center gap-1.5">
            <Clock size={18} className="text-fg-subtle" />
            <p className="text-xs text-fg-muted">Coming soon</p>
          </div>
        </div>
      )}
    </div>
  );
}
