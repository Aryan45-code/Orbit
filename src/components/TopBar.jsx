import { Bell, Coffee, Search, MessageCircle } from "lucide-react";
import { useClickOutside } from "../utils/hooks.js";
import { Logo } from "./Common.jsx";

export function TopBar({ notifOpen, setNotifOpen, notifications, onTeaClick, onSearchClick, onMessagesClick, unreadMessages = 0, markRead }) {
  const unreadCount = notifications.filter((n) => n.unread).length;
  const notifRef = useClickOutside(notifOpen, () => setNotifOpen(false));
  const toggleNotifs = () => {
    const next = !notifOpen;
    if (next) markRead();
    setNotifOpen(next);
  };
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
          {unreadMessages > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-zinc-950" />}
        </button>
        <button aria-label="Notifications" onClick={toggleNotifs} className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-zinc-900">
          <Bell size={20} className="text-zinc-300" />
          {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-400 ring-2 ring-zinc-950" />}
        </button>
      </div>
      {notifOpen && (
        <div className="absolute right-4 top-14 w-72 bg-zinc-900 rounded-2xl shadow-xl shadow-black/50 border border-zinc-800 z-40 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 font-semibold text-zinc-100 text-sm">Notifications</div>
          <div className="max-h-72 overflow-y-auto no-scrollbar">
            {notifications.map((n) => (
              <div key={n.id} className="px-4 py-3 border-b border-zinc-800/60 last:border-0 flex gap-2 items-start">
                {n.unread && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />}
                <div className={n.unread ? "" : "opacity-50"}>
                  <p className="text-sm text-zinc-200 leading-snug">{n.text}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5 mono">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
