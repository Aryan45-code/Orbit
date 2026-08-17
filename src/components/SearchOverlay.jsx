import { useState, useMemo } from "react";
import { ArrowLeft, Search, X } from "lucide-react";
import { EmptyState } from "./EmptyState.jsx";
import { CommunityMark } from "./Home.jsx";
import { compactCount } from "../utils/helpers.js";

export function SearchOverlay({ communities, onOpen, onClose }) {
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return communities
      .filter(
        (c) => c.name.toLowerCase().includes(query) || c.category.toLowerCase().includes(query)
      )
      .slice(0, 30);
  }, [q, communities]);

  return (
    <div className="flex-1 bg-canvas flex flex-col min-h-0">
      <div
        className="flex items-center gap-3 px-4 pb-3 border-b border-line shrink-0"
        style={{ paddingTop: "max(0.875rem, env(safe-area-inset-top))" }}
      >
        <button onClick={onClose} aria-label="Back" className="shrink-0 text-fg active:opacity-50">
          <ArrowLeft size={22} strokeWidth={1.9} />
        </button>
        <div className="flex-1 flex items-center gap-2 bg-surface-3 rounded-lg px-3 py-2">
          <Search size={16} className="text-fg-subtle shrink-0" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="flex-1 min-w-0 bg-transparent text-fg placeholder-fg-subtle text-sm outline-none"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear search">
              <X size={15} className="text-fg-subtle" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {!q && (
          <EmptyState
            icon={Search}
            title="Search Orbit"
            subtitle={'Try a community name or a category, like "Coding" or "Football".'}
          />
        )}
        {q && results.length === 0 && (
          <EmptyState
            icon={Search}
            title={`No results for "${q}"`}
            subtitle="Try a different name or category."
          />
        )}
        <div className="py-2">
          {results.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                onOpen(c);
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-left active:bg-surface-2 transition-colors"
            >
              <CommunityMark community={c} size={44} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-fg truncate">{c.name}</p>
                <p className="text-[13px] text-fg-subtle truncate">
                  {c.category} · {compactCount(c.members)} members
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
