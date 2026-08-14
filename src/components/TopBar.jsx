import { Bell, Coffee, Search, MessageCircle, Clock } from "lucide-react";
import { useClickOutside } from "../utils/hooks.js";
import { Logo } from "./Common.jsx";

// Messages (DMs) and Notifications are both "Coming soon" for this launch —
// no mock data pretending to be real. The bell still opens a small dropdown
// (nicer than a toast that vanishes), it just says so plainly instead of
// showing fabricated notification rows.
export function TopBar({ notifOpen, setNotifOpen, onTeaClick, onSearchClick, onMessagesClick }) {
  const notifRef = useClickOutside(notifOpen, () => setNotifOpen(false));
  return (
    <div
      ref={notifRef}
      className="relative flex items-center justify-between px-4 pb-3 bg-zinc-950 border-b border-zinc-900"
      style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
    >
      <Logo />
      <div className="flex items-center gap-1">
        <button aria-label="Locali-Tea" onClick={onTeaClick} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-zinc-900">
          <Coffee size={20} className="text-amber-400" />
        </button>
        <button aria-label="Search" onClick={onSearchClick} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-zinc-900">
          <Search size={20} className="text-zinc-300" />
        </button>
        <button aria-label="Messages" onClick={onMessagesClick} className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-zinc-900">
          <MessageCircle size={20} className="text-zinc-300" />
        </button>
        <button aria-label="Notifications" onClick={() => setNotifOpen(!notifOpen)} className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-zinc-900">
          <Bell size={20} className="text-zinc-300" />
        </button>
      </div>
      {notifOpen && (
        <div className="absolute right-4 top-14 w-64 bg-zinc-900 rounded-2xl shadow-xl shadow-black/50 border border-zinc-800 z-40 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 font-semibold text-zinc-100 text-sm">Notifications</div>
          <div className="px-4 py-6 flex flex-col items-center text-center gap-1.5">
            <Clock size={18} className="text-zinc-600" />
            <p className="text-xs text-zinc-500">Coming soon</p>
          </div>
        </div>
      )}
    </div>
  );
}
