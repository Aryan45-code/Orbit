import React from "react";
import { CalendarDays, Clock, MapPin, Users, Lock } from "lucide-react";
import { CATEGORIES, COLOR_MAP } from "../data/constants.js";
import { EmptyState } from "./EmptyState.jsx";

// Events is listing-only for this launch — registration (and the discussion
// space it used to unlock) is Coming soon, not wired to anything. Listing
// itself is still real Supabase data (see App.jsx).
function EventCard({ e, interests, onComingSoon, index = 0 }) {
  const cat = CATEGORIES.find((x) => x.name === e.category);
  const cm = COLOR_MAP[cat.color];
  const isMatch = interests && interests.includes(e.category);
  return (
    <div className={`animate-fade-in-up stagger-${Math.min((index % 8) + 1, 8)} bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden`}>
      <div className={`${cm.tint} px-3.5 py-2 flex items-center justify-between`}>
        <span className={`${cm.text} text-[11px] font-semibold flex items-center gap-1`}>
          <cat.icon size={12} />{e.category}
        </span>
        {isMatch && <span className="text-[10px] text-violet-300 font-medium">✨ Matches your interests</span>}
      </div>
      <div className="p-3.5">
        <p className="font-semibold text-zinc-100 text-sm">{e.title}</p>
        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{e.desc}</p>
        <div className="flex items-center gap-3 mt-2.5 text-xs text-zinc-500 flex-wrap">
          <span className="flex items-center gap-1"><Clock size={12} />{e.when}</span>
          <span className="flex items-center gap-1"><MapPin size={12} />{e.where}</span>
          <span className="flex items-center gap-1 mono"><Users size={12} />{e.capacity} spots</span>
        </div>
        <button onClick={onComingSoon} className="w-full mt-3 py-2 rounded-xl bg-zinc-800 text-zinc-500 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-default">
          <Lock size={12} />Registration — coming soon
        </button>
      </div>
    </div>
  );
}

export function EventsScreen({ events, interests, onComingSoon }) {
  const sorted = [...events].sort((a, b) => {
    const am = interests && interests.includes(a.category) ? 1 : 0;
    const bm = interests && interests.includes(b.category) ? 1 : 0;
    return bm - am;
  });
  return (
    <div className="relative flex-1 overflow-y-auto no-scrollbar pb-6">
      <div className="relative z-10">
        <div className="px-4 pt-4">
          <p className="font-bold text-zinc-50 text-lg flex items-center gap-1.5"><CalendarDays size={17} className="text-violet-400" />Events</p>
          <p className="text-xs text-zinc-500 mt-0.5">Browsing is live. Registration and the event discussion space are coming soon.</p>
        </div>
        <div className="px-4 pt-4 space-y-2.5">
          {sorted.length === 0 && (
            <EmptyState icon={CalendarDays} title="No events right now" subtitle="Check back soon — new events are added regularly." />
          )}
          {sorted.map((e, i) => (
            <React.Fragment key={e.id}>
              <EventCard
                e={e}
                index={i}
                interests={interests}
                onComingSoon={onComingSoon}
              />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
