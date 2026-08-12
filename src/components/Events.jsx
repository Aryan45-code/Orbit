import React from "react";
import { CalendarDays, Clock, MapPin, Users, Check, ArrowRight } from "lucide-react";
import { CATEGORIES, COLOR_MAP, MOCK_ADS } from "../data/constants.js";
import { OrbitWatermark } from "./Common.jsx";
import { EmptyState } from "./EmptyState.jsx";
import { AdCard } from "./Home.jsx";

// Registration, listing, and community access are one flow here: registering
// for an event immediately grants access to that event's linked community
// (handled in App.jsx's handleRegisterEvent) — no separate "join" step.
function EventCard({ e, registered, interests, onRegister, onOpenCommunity, index = 0 }) {
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
        {registered ? (
          <button onClick={() => onOpenCommunity(e)} className="w-full mt-3 py-2 rounded-xl bg-zinc-800 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5">
            <Check size={13} />Registered — open event group <ArrowRight size={13} />
          </button>
        ) : (
          <button onClick={() => onRegister(e)} className="w-full mt-3 py-2 rounded-xl bg-violet-500 text-white text-xs font-semibold active:scale-[0.98] transition-transform">
            Register
          </button>
        )}
      </div>
    </div>
  );
}

export function EventsScreen({ events, registeredEventIds, interests, onRegister, onOpenCommunity }) {
  const sorted = [...events].sort((a, b) => {
    const am = interests && interests.includes(a.category) ? 1 : 0;
    const bm = interests && interests.includes(b.category) ? 1 : 0;
    return bm - am;
  });
  return (
    <div className="relative flex-1 overflow-y-auto no-scrollbar pb-6">
      <OrbitWatermark />
      <div className="relative z-10">
        <div className="px-4 pt-4">
          <p className="font-bold text-zinc-50 text-lg flex items-center gap-1.5"><CalendarDays size={17} className="text-violet-400" />Events</p>
          <p className="text-xs text-zinc-500 mt-0.5">Register for an event and get instant access to its community — planning, chat, and updates all in one place.</p>
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
                registered={registeredEventIds.includes(e.id)}
                interests={interests}
                onRegister={onRegister}
                onOpenCommunity={onOpenCommunity}
              />
              {i === 1 && <AdCard ad={MOCK_ADS[1]} />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
