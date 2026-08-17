import { CalendarDays, Clock, MapPin, Users, Lock } from "lucide-react";
import { CATEGORIES, COLOR_MAP } from "../data/constants.js";
import { EmptyState } from "./EmptyState.jsx";
import { compactCount } from "../utils/helpers.js";

function EventCard({ e, interests, onComingSoon }) {
  const cat = CATEGORIES.find((x) => x.name === e.category) || CATEGORIES[0];
  const cm = COLOR_MAP[cat.color];
  const Icon = cat.icon;
  const isMatch = interests && interests.includes(e.category);

  return (
    <article className="border-b border-line">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className={`${cm.tint} ${cm.text} w-9 h-9 rounded-full flex items-center justify-center shrink-0`}>
          <Icon size={17} strokeWidth={1.9} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-fg truncate">{e.category}</p>
          <p className="text-xs text-fg-subtle truncate">{e.where}</p>
        </div>
        {isMatch && (
          <span className="text-xs text-accent font-semibold shrink-0">For you</span>
        )}
      </div>

      <div className="px-4 pb-3">
        <h2 className="text-[15px] font-semibold text-fg leading-snug">{e.title}</h2>
        <p className="text-sm text-fg-muted mt-1 leading-relaxed">{e.desc}</p>

        <dl className="flex items-center gap-x-4 gap-y-1.5 mt-3 text-[13px] text-fg-subtle flex-wrap">
          <div className="flex items-center gap-1.5">
            <Clock size={13} />
            <dd>{e.when}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={13} />
            <dd>{e.where}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={13} />
            <dd>{compactCount(e.capacity)} spots</dd>
          </div>
        </dl>

        <button
          onClick={onComingSoon}
          className="w-full mt-4 py-2 rounded-lg bg-surface-3 text-fg-subtle text-sm font-semibold flex items-center justify-center gap-1.5 cursor-default"
        >
          <Lock size={13} />
          Registration coming soon
        </button>
      </div>
    </article>
  );
}

export function EventsScreen({ events, interests, onComingSoon }) {
  const sorted = [...events].sort((a, b) => {
    const am = interests && interests.includes(a.category) ? 1 : 0;
    const bm = interests && interests.includes(b.category) ? 1 : 0;
    return bm - am;
  });

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-28">
      <div className="px-4 py-3 border-b border-line">
        <h1 className="text-base font-semibold text-fg">Events</h1>
        <p className="text-[13px] text-fg-muted mt-0.5">
          Browsing is live. Registration is coming soon.
        </p>
      </div>
      {sorted.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No events right now"
          subtitle="Check back soon — new events are added regularly."
        />
      ) : (
        sorted.map((e) => (
          <EventCard key={e.id} e={e} interests={interests} onComingSoon={onComingSoon} />
        ))
      )}
    </div>
  );
}
