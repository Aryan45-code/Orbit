import React, { useState, useMemo } from "react";
import { Plus, MapPin, Users, Flame, TrendingUp, Megaphone, Orbit as OrbitIcon, Crown } from "lucide-react";
import { CATEGORIES, COLOR_MAP, MOCK_ADS } from "../data/constants.js";
import { distanceKm, interestMatchCount, baseSparks, communityTrendScore, orbitTitle } from "../utils/helpers.js";
import { OrbitWatermark } from "./Common.jsx";

export function CommunityStories({ communities, radius, joinedIds, interests, onOpen, onCreateClick }) {
  const withDist = useMemo(() => (
    communities.map((c) => ({ ...c, distance: distanceKm(c.dx, c.dy) })).filter((c) => c.distance <= radius)
  ), [communities, radius]);
  const ordered = useMemo(() => {
    const joined = withDist.filter((c) => joinedIds.includes(c.id)).sort((a, b) => a.lastActive - b.lastActive);
    const remaining = withDist.filter((c) => !joinedIds.includes(c.id));
    const matched = remaining.filter((c) => interestMatchCount(c, interests) > 0).sort((a, b) => interestMatchCount(b, interests) - interestMatchCount(a, interests) || a.lastActive - b.lastActive);
    const others = remaining.filter((c) => interestMatchCount(c, interests) === 0).sort((a, b) => a.lastActive - b.lastActive);
    return [...joined, ...matched, ...others].slice(0, 12);
  }, [withDist, joinedIds, interests]);
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
          const isJoined = joinedIds.includes(c.id);
          return (
            <button key={c.id} onClick={() => onOpen(c)} className="flex flex-col items-center gap-1.5 w-16 shrink-0">
              <div className={`rounded-full p-[2.5px] shrink-0 ${isLive ? "bg-gradient-to-br from-blue-400 to-emerald-400" : isJoined ? "bg-gradient-to-br from-zinc-600 to-zinc-700" : "bg-zinc-800"}`}>
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

export function OrbitHero({ score, rankInfo, onViewLeaderboard }) {
  const title = orbitTitle(score);
  return (
    <div className="mx-5 mt-4 rounded-2xl border border-zinc-800 bg-gradient-to-br from-blue-500/10 via-zinc-900 to-emerald-500/5 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-300 flex items-center justify-center shrink-0">
            <OrbitIcon size={18} />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">Orbit Score</p>
            <p className="text-xl font-bold text-zinc-50 mono leading-tight">{score}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-blue-300">{title}</p>
          {rankInfo && (
            <p className="text-[11px] text-zinc-500 mt-0.5">Rank <span className="mono text-zinc-300">#{rankInfo.rank}</span> of {rankInfo.total}</p>
          )}
        </div>
      </div>
      <button onClick={onViewLeaderboard} className="w-full mt-3 pt-2.5 border-t border-zinc-800 text-xs font-medium text-blue-400">
        See community leaderboard →
      </button>
    </div>
  );
}

export function OrbitLeaderboard({ leaderboard, communities }) {
  const [seg, setSeg] = useState("people");
  const trendingCommunities = useMemo(() => (
    [...communities].sort((a, b) => communityTrendScore(b) - communityTrendScore(a)).slice(0, 8)
  ), [communities]);
  return (
    <div>
      <div className="flex gap-1.5 px-4 pb-3">
        <button onClick={() => setSeg("people")} className={`flex-1 text-xs font-medium py-2 rounded-xl border ${seg === "people" ? "bg-zinc-50 text-zinc-900 border-zinc-50" : "bg-zinc-900 text-zinc-400 border-zinc-800"}`}>People</button>
        <button onClick={() => setSeg("communities")} className={`flex-1 text-xs font-medium py-2 rounded-xl border ${seg === "communities" ? "bg-zinc-50 text-zinc-900 border-zinc-50" : "bg-zinc-900 text-zinc-400 border-zinc-800"}`}>Communities</button>
      </div>
      {seg === "people" && (
        <div className="px-4 space-y-1.5">
          {leaderboard.map((p) => (
            <div key={p.name} className={`flex items-center gap-3 p-2.5 rounded-xl ${p.isYou ? "bg-blue-500/10 border border-blue-500/30" : ""}`}>
              <span className="w-6 text-center shrink-0">
                {p.rank <= 3 ? <Crown size={14} className="text-amber-400 mx-auto" /> : <span className="text-xs font-bold text-zinc-500 mono">{p.rank}</span>}
              </span>
              <AvatarInline label={p.name[0]} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${p.isYou ? "text-blue-300" : "text-zinc-200"}`}>{p.name}{p.isYou ? " (You)" : ""}</p>
                <p className="text-[11px] text-zinc-500">{orbitTitle(p.score)}</p>
              </div>
              <span className="text-sm font-bold text-zinc-100 mono shrink-0">{p.score}</span>
            </div>
          ))}
        </div>
      )}
      {seg === "communities" && (
        <div className="px-4 space-y-1.5">
          {trendingCommunities.map((c, i) => {
            const cat = CATEGORIES.find((x) => x.name === c.category);
            const cm = COLOR_MAP[cat.color];
            return (
              <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl">
                <span className="w-6 text-center shrink-0">
                  {i < 3 ? <Crown size={14} className="text-amber-400 mx-auto" /> : <span className="text-xs font-bold text-zinc-500 mono">{i + 1}</span>}
                </span>
                <div className={`${cm.tint} ${cm.text} w-9 h-9 rounded-xl flex items-center justify-center shrink-0`}>
                  <cat.icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{c.name}</p>
                  <p className="text-[11px] text-zinc-500">{c.category} · {c.members} members</p>
                </div>
                {i === 0 && <TrendingUp size={15} className="text-emerald-400 shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Small local avatar to avoid a circular import with Common.jsx's Avatar
// (kept identical in behavior — swap for the shared Avatar if you prefer
// a single source of truth once this module graph settles).
function AvatarInline({ label, size = 34, color = "indigo" }) {
  const c = COLOR_MAP[color] || COLOR_MAP.indigo;
  return (
    <div className={`${c.tint} ${c.text} rounded-full flex items-center justify-center font-semibold shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {label}
    </div>
  );
}

export function RadiusBar({ radius, setRadius, auto, setAuto, count }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-4 mt-3 mb-1">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-zinc-400">
          <MapPin size={13} className="text-blue-400" />
          Within <span className="mono text-zinc-200">{radius.toFixed(1)} km</span> · <span className="mono">{count}</span> nearby
        </span>
        <span className="text-blue-400 font-medium">{open ? "Done" : "Adjust"}</span>
      </button>
      {open && (
        <div className="mt-2 p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-zinc-500">Search radius</span>
            <button
              onClick={() => setAuto(!auto)}
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${auto ? "bg-blue-500 text-white" : "bg-zinc-800 text-zinc-400"}`}
            >
              {auto ? "Auto" : "Manual"}
            </button>
          </div>
          <input
            type="range" min="1" max="5" step="0.5" value={radius}
            onChange={(e) => { setAuto(false); setRadius(parseFloat(e.target.value)); }}
            className="w-full accent-blue-500"
          />
        </div>
      )}
    </div>
  );
}

export function CommunityCard({ c, distance, joined, onOpen, sparked, onSpark, trendRank }) {
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
      className="w-full text-left bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition p-3.5 flex gap-3 cursor-pointer"
    >
      <div className={`${cm.tint} ${cm.text} w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 relative`}>
        <Icon size={20} />
        {isLive && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-zinc-900 animate-pulse" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-zinc-50 text-sm truncate">{c.name}</p>
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
            <span className="flex items-center gap-1 mono text-blue-400"><MapPin size={11} />{distance.toFixed(1)}km</span>
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

export function MatchCard({ c, distance, onOpen }) {
  const cat = CATEGORIES.find((x) => x.name === c.category);
  const cm = COLOR_MAP[cat.color];
  return (
    <button onClick={() => onOpen(c)} className="w-40 shrink-0 text-left bg-zinc-900 rounded-2xl border border-blue-500/30 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className={`${cm.tint} ${cm.text} w-9 h-9 rounded-xl flex items-center justify-center`}>
          <cat.icon size={16} />
        </div>
        <span className="text-[9px] text-blue-400 font-semibold flex items-center gap-0.5">✨ For you</span>
      </div>
      <p className="text-xs font-semibold text-zinc-100 leading-tight line-clamp-2 mb-1">{c.name}</p>
      <p className="text-[10px] text-zinc-500">{c.members} members · {distance.toFixed(1)}km</p>
    </button>
  );
}

export function HomeScreen({ communities, radius, setRadius, auto, setAuto, joinedIds, onOpen, filterCat, setFilterCat, sparkedIds, onSpark, onCreateClick, interests }) {
  const withDist = useMemo(() => (
    communities.map((c) => ({ ...c, distance: distanceKm(c.dx, c.dy) }))
  ), [communities]);
  const inRange = useMemo(() => withDist.filter((c) => c.distance <= radius), [withDist, radius]);
  const filtered = filterCat ? inRange.filter((c) => c.category === filterCat) : inRange;
  const grouped = CATEGORIES.map((cat) => ({
    cat,
    isInterest: (interests || []).includes(cat.name),
    items: filtered.filter((c) => c.category === cat.name).sort((a, b) => a.distance - b.distance),
  })).filter((g) => g.items.length > 0)
    .sort((a, b) => (b.isInterest - a.isInterest));
  const topTrending = useMemo(() => (
    [...communities].sort((a, b) => communityTrendScore(b) - communityTrendScore(a)).slice(0, 3).map((c) => c.id)
  ), [communities]);
  const matched = useMemo(() => {
    if (!interests || interests.length === 0) return [];
    return inRange
      .filter((c) => !joinedIds.includes(c.id) && interestMatchCount(c, interests) > 0)
      .sort((a, b) => interestMatchCount(b, interests) - interestMatchCount(a, interests) || a.distance - b.distance)
      .slice(0, 6);
  }, [inRange, interests, joinedIds]);
  return (
    <div className="relative flex-1 overflow-y-auto no-scrollbar pb-4">
      <OrbitWatermark />
      <div className="relative z-10">
        <div className="h-[3px] bg-gradient-to-r from-blue-500 via-emerald-400 to-blue-500" />
        <CommunityStories communities={communities} radius={radius} joinedIds={joinedIds} interests={interests} onOpen={onOpen} onCreateClick={onCreateClick} />
        <RadiusBar radius={radius} setRadius={setRadius} auto={auto} setAuto={setAuto} count={inRange.length} />
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
              {matched.map((c) => <MatchCard key={c.id} c={c} distance={c.distance} onOpen={onOpen} />)}
            </div>
          </div>
        )}
        <div className="px-4 space-y-5 mt-2">
          {grouped.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-10">No communities in range yet. Try widening the radius.</p>
          )}
          {grouped.map(({ cat, items, isInterest }, i) => (
            <React.Fragment key={cat.name}>
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  {cat.name}{isInterest && <span className="text-blue-400 normal-case font-medium">· your interest</span>}
                </p>
                <div className="space-y-2.5">
                  {items.map((c) => (
                    <CommunityCard key={c.id} c={c} distance={c.distance} joined={joinedIds.includes(c.id)} onOpen={onOpen}
                      sparked={sparkedIds.includes(c.id)} onSpark={onSpark}
                      trendRank={topTrending.includes(c.id) ? topTrending.indexOf(c.id) + 1 : null} />
                  ))}
                </div>
              </div>
              {i === 0 && <AdCard ad={MOCK_ADS[0]} />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
