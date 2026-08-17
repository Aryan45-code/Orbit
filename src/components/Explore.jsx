import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { CATEGORIES } from "../data/constants.js";
import { EmptyState } from "./EmptyState.jsx";
import { CommunityRow } from "./Home.jsx";

export function ExploreScreen({ subTab, setSubTab, clubs, communities, onOpen, onJoinToggle, joinedIds }) {
  const [query, setQuery] = useState("");
  const [filterCat, setFilterCat] = useState(null);
  const list = subTab === "clubs" ? clubs : communities;

  const filtered = useMemo(() => {
    let items = list;
    if (filterCat) items = items.filter((c) => c.category === filterCat);
    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (c) => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
      );
    }
    return items;
  }, [list, filterCat, query]);

  const chip = (isOn) =>
    `text-[13px] px-4 py-1.5 rounded-full shrink-0 font-medium transition-colors ${
      isOn ? "bg-inverse text-inverse-fg" : "bg-surface-3 text-fg"
    }`;

  // IG's underline tabs — the label carries the state, no boxed segments.
  const subTabClass = (isOn) =>
    `flex-1 text-sm font-semibold py-3 border-b-2 -mb-px transition-colors ${
      isOn ? "border-fg text-fg" : "border-transparent text-fg-subtle"
    }`;

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-28">
      <div className="px-4 pt-2 pb-3">
        <div className="flex items-center gap-2 bg-surface-3 rounded-lg px-3 py-2">
          <Search size={16} className="text-fg-subtle shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={subTab === "clubs" ? "Search clubs" : "Search communities"}
            className="flex-1 min-w-0 bg-transparent text-fg placeholder-fg-subtle text-sm outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search">
              <X size={15} className="text-fg-subtle" />
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-line px-4">
        <button onClick={() => setSubTab("clubs")} className={subTabClass(subTab === "clubs")}>
          Clubs
        </button>
        <button
          onClick={() => setSubTab("communities")}
          className={subTabClass(subTab === "communities")}
        >
          Communities
        </button>
      </div>

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

      <div className="pt-2">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title={`No ${subTab} found`}
            subtitle="Try a different search term or category."
          />
        ) : (
          filtered.map((item) => (
            <CommunityRow
              key={item.id}
              c={item}
              joined={joinedIds.includes(item.id)}
              onOpen={onOpen}
              onJoinToggle={onJoinToggle}
            />
          ))
        )}
      </div>
    </div>
  );
}
