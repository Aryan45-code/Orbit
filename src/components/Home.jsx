import { useMemo } from "react";
import { Plus, Compass, BadgeCheck } from "lucide-react";
import { CATEGORIES, COLOR_MAP } from "../data/constants.js";
import { interestMatchCount, compactCount } from "../utils/helpers.js";
import { SkeletonFeed, SkeletonStory } from "./Skeleton.jsx";
import { EmptyState } from "./EmptyState.jsx";
import { btnPrimary, btnSecondary } from "./Common.jsx";

export function CommunityMark({ community, size = 44 }) {
  const cat = CATEGORIES.find((x) => x.name === community.category) || CATEGORIES[0];
  const cm = COLOR_MAP[cat.color];
  if (community.avatarUrl) {
    return (
      <img
        src={community.avatarUrl}
        alt=""
        loading="lazy"
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={`${cm.tint} ${cm.text} rounded-full flex items-center justify-center shrink-0`}
      style={{ width: size, height: size }}
    >
      <cat.icon size={size * 0.42} strokeWidth={1.9} />
    </div>
  );
}

export function CommunityStories({ communities, joinedIds, onOpen, onCreateClick }) {
  const ordered = useMemo(
    () => communities.filter((c) => joinedIds.includes(c.id)).slice(0, 12),
    [communities, joinedIds]
  );
  return (
    <div className="py-3 border-b border-line">
      <div className="flex gap-4 overflow-x-auto px-4 no-scrollbar">
        <button
          onClick={onCreateClick}
          className="flex flex-col items-center gap-1.5 w-[68px] shrink-0 active:opacity-60 transition-opacity"
        >
          <div className="w-16 h-16 rounded-full border border-line flex items-center justify-center text-fg-muted">
            <Plus size={22} strokeWidth={1.8} />
          </div>
          <p className="text-[11px] text-fg truncate w-full text-center">New</p>
        </button>
        {ordered.map((c) => (
          <button
            key={c.id}
            onClick={() => onOpen(c)}
            className="flex flex-col items-center gap-1.5 w-[68px] shrink-0 active:opacity-60 transition-opacity"
          >
            <div className="story-ring rounded-full p-[2px] shrink-0">
              <div className="bg-canvas rounded-full p-[2px]">
                <CommunityMark community={c} size={56} />
              </div>
            </div>
            <p className="text-[11px] text-fg truncate w-full text-center">
              {c.name.split(" — ")[0]}
            </p>
          </button>
        ))}
        {ordered.length === 0 && (
          <p className="text-xs text-fg-subtle self-center py-4">
            Join a community to see it here.
          </p>
        )}
      </div>
    </div>
  );
}

// Shared by Home and Explore so a club reads the same wherever you meet it.
export function CommunityRow({ c, joined, onOpen, onJoinToggle }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(c)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(c);
        }
      }}
      className="w-full flex items-center gap-3 px-4 py-2.5 active:bg-surface-2 transition-colors cursor-pointer"
    >
      <CommunityMark community={c} size={44} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-fg truncate flex items-center gap-1">
          {c.name}
          {c.official && <BadgeCheck size={13} className="text-accent shrink-0" />}
        </p>
        <p className="text-[13px] text-fg-muted truncate">{c.desc}</p>
        <p className="text-[13px] text-fg-subtle truncate">
          {c.category} · {compactCount(c.members)} members
        </p>
      </div>
      {onJoinToggle && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onJoinToggle(c.id);
          }}
          className={`${joined ? btnSecondary : btnPrimary} shrink-0`}
        >
          {joined ? "Joined" : "Join"}
        </button>
      )}
    </div>
  );
}

function SuggestionCard({ c, onOpen, onJoinToggle, joined }) {
  return (
    <button
      onClick={() => onOpen(c)}
      className="w-[150px] shrink-0 flex flex-col items-center text-center border border-line rounded-lg p-4 active:opacity-70 transition-opacity"
    >
      <CommunityMark community={c} size={72} />
      <p className="text-sm font-semibold text-fg mt-3 line-clamp-2 leading-snug">{c.name}</p>
      <p className="text-xs text-fg-subtle mt-1 mb-3">{compactCount(c.members)} members</p>
      <span
        onClick={(e) => {
          e.stopPropagation();
          onJoinToggle(c.id);
        }}
        className={`${joined ? btnSecondary : btnPrimary} w-full text-center mt-auto`}
      >
        {joined ? "Joined" : "Join"}
      </span>
    </button>
  );
}

export function HomeScreen({
  communities,
  joinedIds,
  onOpen,
  onJoinToggle,
  filterCat,
  setFilterCat,
  onCreateClick,
  interests,
  loading,
}) {
  const filtered = filterCat ? communities.filter((c) => c.category === filterCat) : communities;

  const grouped = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        cat,
        isInterest: (interests || []).includes(cat.name),
        items: filtered.filter((c) => c.category === cat.name),
      }))
        .filter((g) => g.items.length > 0)
        .sort((a, b) => Number(b.isInterest) - Number(a.isInterest)),
    [filtered, interests]
  );

  const suggested = useMemo(() => {
    if (!interests || interests.length === 0) return [];
    return communities
      .filter((c) => !joinedIds.includes(c.id) && interestMatchCount(c, interests) > 0)
      .sort((a, b) => interestMatchCount(b, interests) - interestMatchCount(a, interests))
      .slice(0, 8);
  }, [communities, interests, joinedIds]);

  const chip = (isOn) =>
    `text-[13px] px-4 py-1.5 rounded-full shrink-0 font-medium transition-colors ${
      isOn ? "bg-inverse text-inverse-fg" : "bg-surface-3 text-fg"
    }`;

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-28">
      {loading ? (
        <div className="flex gap-4 overflow-x-auto px-4 py-3 no-scrollbar border-b border-line">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonStory key={i} />
          ))}
        </div>
      ) : (
        <CommunityStories
          communities={communities}
          joinedIds={joinedIds}
          onOpen={onOpen}
          onCreateClick={onCreateClick}
        />
      )}

      <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar border-b border-line">
        <button onClick={() => setFilterCat(null)} className={chip(!filterCat)}>
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setFilterCat(cat.name)}
            className={chip(filterCat === cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {!filterCat && suggested.length > 0 && (
        <div className="py-4 border-b border-line">
          <p className="text-sm font-semibold text-fg px-4 mb-3">Suggested for you</p>
          <div className="flex gap-2 overflow-x-auto px-4 no-scrollbar items-stretch">
            {suggested.map((c) => (
              <SuggestionCard
                key={c.id}
                c={c}
                onOpen={onOpen}
                onJoinToggle={onJoinToggle}
                joined={joinedIds.includes(c.id)}
              />
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="pt-2">
          <SkeletonFeed count={5} />
        </div>
      ) : grouped.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="Nothing here yet"
          subtitle={
            filterCat
              ? "No communities in this category. Try another, or browse the full directory in Explore."
              : "No communities have been created yet. Start the first one."
          }
        />
      ) : (
        grouped.map(({ cat, items, isInterest }) => (
          <section key={cat.name} className="pt-4 pb-2">
            <p className="text-sm font-semibold text-fg px-4 mb-1">
              {cat.name}
              {isInterest && (
                <span className="text-fg-subtle font-normal"> · your interest</span>
              )}
            </p>
            {items.map((c) => (
              <CommunityRow
                key={c.id}
                c={c}
                joined={joinedIds.includes(c.id)}
                onOpen={onOpen}
                onJoinToggle={onJoinToggle}
              />
            ))}
          </section>
        ))
      )}
    </div>
  );
}
