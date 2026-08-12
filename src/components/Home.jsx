import React, { useState, useMemo, useEffect } from "react";
import { Plus, Users, Flame, TrendingUp, Megaphone, Compass } from "lucide-react";
import { CATEGORIES, COLOR_MAP, MOCK_ADS } from "../data/constants.js";
import { interestMatchCount, baseSparks, communityTrendScore } from "../utils/helpers.js";
import { OrbitWatermark } from "./Common.jsx";
import { SkeletonFeed, SkeletonStory } from "./Skeleton.jsx";
import { EmptyState } from "./EmptyState.jsx";

// Stories only ever show communities/clubs the student has already joined —
// this is a "what's active where I belong" strip, like Instagram stories
// only showing people you follow, not a discovery surface.
export function CommunityStories({ communities, joinedIds, onOpen, onCreateClick }) {
  const ordered = useMemo(() => (
    communities
      .filter((c) => joinedIds.includes(c.id))
      .sort((a, b) => a.lastActive - b.lastActive)
      .slice(0, 12)
  ), [communities, joinedIds]);
  return (
    <div className="pt-3.5 pb-1 border-b border-zinc-900">
      <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 no-scrollbar">
        <button onClick={onCreateClick} className="flex flex-col items-center gap-1.5 w-16 shrink-0">
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center">
            <Plus size={18} className="text-zinc-500" />
          </div>
          <p className="text-[10px] text-zinc-400 text-center leading-tight">Create</p>
        </button>
        {ordered.map((c) => {
          const cat = CATEGORIES.find((x) => x.name === c.category);
          const isLive = c.lastActive <= 10;
          return (
            <button key={c.id} onClick={() => onOpen(c)} className="flex flex-col items-center gap-1.5 w-16 shrink-0">
              <div className={`rounded-full p-[2.5px] shrink-0 ${isLive ? "bg-gradient-to-br from-violet-400 to-emerald-400" : "bg-gradient-to-br from-zinc-600 to-zinc-700"}`}>
                <div className="bg-zinc-950 rounded-full p-[2px]">
                  <div className={`${COLOR_MAP[cat.color].tint} ${COLOR_MAP[cat.color].text} rounded-full w-12 h-12 flex items-center justify-center`}>
                    <cat.icon size={19} />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 text-center leading-tight line-clamp-2">{c.name.split(" — ")[0]}</p>
            </button>
          );
        })}
        {ordered.length === 0 && (
          <p className="text-xs text-zinc-600 self-center py-2">Join a community to see it here.</p>
        )}
      </div>
    </div>
  );
}

export function AdCard({ ad }) {
  const cm = COLOR_MAP[ad.color];
  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-3.5 flex items-center gap-3">
      <div className={`${cm.tint} ${cm.text} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
        <Megaphone size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wide mb-0.5">Sponsored</p>
        <p className="text-sm font-medium text-zinc-100 leading-snug truncate">{ad.title}</p>
        <p className="text-xs text-zinc-500 truncate">{ad.subtitle}</p>
      </div>
      <span className={`${cm.text} text-[11px] font-semibold shrink-0`}>{ad.cta}</span>
    </div>
  );
}

export function CommunityCard({ c, joined, onOpen, sparked, onSpark, trendRank, index = 0 }) {
  const cat = CATEGORIES.find((x) => x.name === c.category);
  const cm = COLOR_MAP[cat.color];
  const Icon = cat.icon;
  const isLive = c.lastActive <= 10;
  const sparks = baseSparks(c) + (sparked ? 1 : 0);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(c)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(c); } }}
      className={`animate-fade-in-up stagger-${Math.min((index % 8) + 1, 8)} w-full text-left bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 p-3.5 flex gap-3 cursor-pointer`}
    >
      <div className={`${cm.tint} ${cm.text} w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 relative ring-1 ring-white/5`}>
        <Icon size={20} />
        {isLive && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-zinc-900 animate-pulse" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-zinc-50 text-sm truncate flex items-center gap-1">
            {c.name}
            {c.official && <BadgeCheckDot />}
          </p>
          {joined ? (
            <span className="text-[10px] text-emerald-400 font-medium shrink-0">Joined</span>
          ) : trendRank ? (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-400 font-medium shrink-0"><TrendingUp size={10} />#{trendRank} Trending</span>
          ) : null}
        </div>
        <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{c.desc}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2.5 text-[11px] text-zinc-500">
            <span className="text-zinc-400 font-medium">{c.category}</span>
            <span className="flex items-center gap-1 mono"><Users size={11} />{c.members}</span>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSpark(c.id); }}
            className={`flex items-center gap-1 text-[11px] font-medium px-1.5 py-1 rounded-full active:scale-90 transition-transform ${sparked ? "text-orange-400" : "text-zinc-500"}`}
          >
            <Flame size={13} fill={sparked ? "currentColor" : "none"} /><span className="mono">{sparks}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function BadgeCheckDot() {
  return <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" title="Official" />;
}

export function MatchCard({ c, onOpen }) {
  const cat = CATEGORIES.find((x) => x.name === c.category);
  const cm = COLOR_MAP[cat.color];
  return (
    <button onClick={() => onOpen(c)} className="w-40 shrink-0 text-left bg-zinc-900 rounded-2xl border border-violet-500/30 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className={`${cm.tint} ${cm.text} w-9 h-9 rounded-xl flex items-center justify-center`}>
          <cat.icon size={16} />
        </div>
        <span className="text-[9px] text-violet-400 font-semibold flex items-center gap-0.5">✨ For you</span>
      </div>
      <p className="text-xs font-semibold text-zinc-100 leading-tight line-clamp-2 mb-1">{c.name}</p>
      <p className="text-[10px] text-zinc-500">{c.members} members</p>
    </button>
  );
}

export function HomeScreen({ communities, joinedIds, onOpen, filterCat, setFilterCat, sparkedIds, onSpark, onCreateClick, interests }) {
  // Brief skeleton pass on first mount only — makes the feed feel like it's
  // fetching real data instead of popping in instantly.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);
  const filtered = filterCat ? communities.filter((c) => c.category === filterCat) : communities;
  const grouped = CATEGORIES.map((cat) => ({
    cat,
    isInterest: (interests || []).includes(cat.name),
    items: filtered.filter((c) => c.category === cat.name),
  })).filter((g) => g.items.length > 0)
    .sort((a, b) => (b.isInterest - a.isInterest));
  const topTrending = useMemo(() => (
    [...communities].sort((a, b) => communityTrendScore(b) - communityTrendScore(a)).slice(0, 3).map((c) => c.id)
  ), [communities]);
  const matched = useMemo(() => {
    if (!interests || interests.length === 0) return [];
    return communities
      .filter((c) => !joinedIds.includes(c.id) && interestMatchCount(c, interests) > 0)
      .sort((a, b) => interestMatchCount(b, interests) - interestMatchCount(a, interests))
      .slice(0, 6);
  }, [communities, interests, joinedIds]);
  return (
    <div className="relative flex-1 overflow-y-auto no-scrollbar pb-4">
      <OrbitWatermark />
      <div className="relative z-10">
        {loading ? (
          <div className="flex gap-3.5 overflow-x-auto px-4 py-3.5 no-scrollbar border-b border-zinc-900">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonStory key={i} />)}
          </div>
        ) : (
          <CommunityStories communities={communities} joinedIds={joinedIds} onOpen={onOpen} onCreateClick={onCreateClick} />
        )}
        <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
          <button onClick={() => setFilterCat(null)} className={`text-xs px-3 py-1.5 rounded-full shrink-0 font-medium ${!filterCat ? "bg-zinc-50 text-zinc-900" : "bg-zinc-900 text-zinc-400 border border-zinc-800"}`}>All</button>
          {CATEGORIES.map((cat) => (
            <button key={cat.name} onClick={() => setFilterCat(cat.name)} className={`text-xs px-3 py-1.5 rounded-full shrink-0 font-medium ${filterCat === cat.name ? "bg-zinc-50 text-zinc-900" : "bg-zinc-900 text-zinc-400 border border-zinc-800"}`}>{cat.name}</button>
          ))}
        </div>
        {!filterCat && matched.length > 0 && (
          <div className="pb-1 mb-1">
            <p className="text-xs font-semibold text-zinc-300 px-4 mb-2 flex items-center gap-1.5">✨ Matched to your interests</p>
            <div className="flex gap-2.5 overflow-x-auto px-4 pb-1 no-scrollbar">
              {matched.map((c) => <MatchCard key={c.id} c={c} onOpen={onOpen} />)}
            </div>
          </div>
        )}
        <div className="px-4 space-y-5 mt-2">
          {loading ? (
            <SkeletonFeed count={4} />
          ) : (
            <>
              {grouped.length === 0 && (
                <EmptyState
                  icon={Compass}
                  title="No communities match this filter"
                  subtitle="Try a different category, or check Explore for the full directory."
                />
              )}
              {grouped.map(({ cat, items, isInterest }, i) => (
                <React.Fragment key={cat.name}>
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      {cat.name}{isInterest && <span className="text-violet-400 normal-case font-medium">· your interest</span>}
                    </p>
                    <div className="space-y-2.5">
                      {items.map((c, idx) => (
                        <CommunityCard key={c.id} c={c} joined={joinedIds.includes(c.id)} onOpen={onOpen}
                          sparked={sparkedIds.includes(c.id)} onSpark={onSpark} index={idx}
                          trendRank={topTrending.includes(c.id) ? topTrending.indexOf(c.id) + 1 : null} />
                      ))}
                    </div>
                  </div>
                  {i === 0 && <AdCard ad={MOCK_ADS[0]} />}
                </React.Fragment>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
