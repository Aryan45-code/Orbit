import { useState, useMemo } from "react";
import { ArrowLeft, Coffee, Flame, Snowflake, MessageCircle, Send, Flag, Clock } from "lucide-react";
import { teaTimeLeft, isTeaExpired } from "../utils/helpers.js";
import { EmptyState } from "./EmptyState.jsx";

// Locali-Tea: anonymous, campus-only confessions/gossip. Every post (and its
// comments) is only visible for 48h from posting, then it's gone — this is
// what replaced the old top-bar "+" (community creation moved to the Home
// feed's own "Create" story bubble, which already existed independently).
function TeaCard({ t, onOpen, onValidate, myVote }) {
  const total = t.trueCount + t.capCount || 1;
  const truePct = Math.round((t.trueCount / total) * 100);
  return (
    <button onClick={() => onOpen(t)} className="w-full text-left bg-zinc-900 rounded-2xl border border-zinc-800 p-3.5 animate-fade-in-up">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-zinc-500">Anonymous</span>
        <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium"><Clock size={11} />{teaTimeLeft(t.createdAt)}</span>
      </div>
      <p className="text-sm text-zinc-200 leading-snug line-clamp-4">{t.text}</p>
      <div className="mt-3 h-1.5 rounded-full bg-zinc-800 overflow-hidden flex">
        <div className="h-full bg-emerald-500" style={{ width: `${truePct}%` }} />
        <div className="h-full bg-rose-500" style={{ width: `${100 - truePct}%` }} />
      </div>
      <div className="flex items-center justify-between mt-2.5">
        <div className="flex items-center gap-3">
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onValidate(t.id, "true"); }}
            className={`flex items-center gap-1 text-[11px] font-medium ${myVote === "true" ? "text-emerald-400" : "text-zinc-500"}`}
          >
            <Flame size={13} fill={myVote === "true" ? "currentColor" : "none"} />{t.trueCount}
          </span>
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onValidate(t.id, "cap"); }}
            className={`flex items-center gap-1 text-[11px] font-medium ${myVote === "cap" ? "text-rose-400" : "text-zinc-500"}`}
          >
            <Snowflake size={13} fill={myVote === "cap" ? "currentColor" : "none"} />{t.capCount}
          </span>
        </div>
        <span className="flex items-center gap-1 text-[11px] text-zinc-500"><MessageCircle size={12} />{t.comments.length}</span>
      </div>
    </button>
  );
}

function TeaDetail({ t, onBack, onValidate, myVote, onComment, onReport }) {
  const [draft, setDraft] = useState("");
  const total = t.trueCount + t.capCount || 1;
  const truePct = Math.round((t.trueCount / total) * 100);
  return (
    <div className="relative flex-1 bg-zinc-950 flex flex-col min-h-0">
      <div className="relative z-10 flex flex-col min-h-0 flex-1">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-900"><ArrowLeft size={18} className="text-zinc-300" /></button>
          <button onClick={onReport} className="text-xs text-zinc-400 hover:bg-zinc-900 px-2.5 py-1.5 rounded-full flex items-center gap-1"><Flag size={12} />Report</button>
        </div>
        <div className="px-5 pb-3 border-b border-zinc-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500">Anonymous</span>
            <span className="flex items-center gap-1 text-xs text-amber-400 font-medium"><Clock size={12} />{teaTimeLeft(t.createdAt)}</span>
          </div>
          <p className="text-sm text-zinc-100 leading-relaxed">{t.text}</p>
          <div className="mt-3 h-1.5 rounded-full bg-zinc-800 overflow-hidden flex">
            <div className="h-full bg-emerald-500" style={{ width: `${truePct}%` }} />
            <div className="h-full bg-rose-500" style={{ width: `${100 - truePct}%` }} />
          </div>
          <div className="flex items-center gap-4 mt-3">
            <button onClick={() => onValidate(t.id, "true")} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${myVote === "true" ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-900 border border-zinc-800 text-zinc-400"}`}>
              <Flame size={13} fill={myVote === "true" ? "currentColor" : "none"} />{t.trueCount} true
            </button>
            <button onClick={() => onValidate(t.id, "cap")} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${myVote === "cap" ? "bg-rose-500/10 text-rose-400" : "bg-zinc-900 border border-zinc-800 text-zinc-400"}`}>
              <Snowflake size={13} fill={myVote === "cap" ? "currentColor" : "none"} />{t.capCount} cap
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-3 space-y-3">
          {t.comments.length === 0 && <p className="text-xs text-zinc-600 text-center py-6">No discussion yet — start it.</p>}
          {t.comments.map((c, i) => (
            <div key={i}>
              <p className="text-xs text-zinc-500 font-medium">{c.who}</p>
              <p className="text-sm text-zinc-300 mt-0.5">{c.text}</p>
              <p className="text-[10px] text-zinc-600 mono mt-0.5">{c.time}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4 py-3 border-t border-zinc-900">
          <input
            value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && draft.trim()) { onComment(t.id, draft.trim()); setDraft(""); } }}
            placeholder="Add to the discussion, anonymously"
            className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-full px-4 py-2 text-sm outline-none focus:border-violet-500"
          />
          <button
            onClick={() => { if (draft.trim()) { onComment(t.id, draft.trim()); setDraft(""); } }}
            className="w-9 h-9 rounded-full bg-violet-500 text-white flex items-center justify-center shrink-0"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function LocaliTeaScreen({ teaPosts, onClose, verified, onBlocked, onPost, onValidate, onComment, onReport, myVotes }) {
  const [openTeaId, setOpenTeaId] = useState(null);
  const [draft, setDraft] = useState("");
  const visible = useMemo(() => teaPosts.filter((t) => !isTeaExpired(t.createdAt)).sort((a, b) => b.createdAt - a.createdAt), [teaPosts]);
  const openTea = visible.find((t) => t.id === openTeaId);

  if (openTea) {
    return (
      <TeaDetail
        t={openTea}
        onBack={() => setOpenTeaId(null)}
        onValidate={onValidate}
        myVote={myVotes[openTea.id]}
        onComment={onComment}
        onReport={() => onReport(`a Locali-Tea post`)}
      />
    );
  }

  return (
    <div className="relative flex-1 bg-zinc-950 flex flex-col min-h-0">
      <div className="relative z-10 flex flex-col min-h-0 flex-1">
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
          <button onClick={onClose} className="shrink-0"><ArrowLeft size={19} className="text-zinc-300" /></button>
          <div className="flex-1">
            <p className="font-bold text-zinc-50 flex items-center gap-1.5"><Coffee size={16} className="text-amber-400" />Locali-Tea</p>
            <p className="text-[11px] text-zinc-500">Anonymous. Gone in 48 hours.</p>
          </div>
        </div>
        {verified && (
          <div className="px-4 pb-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <textarea
                value={draft} onChange={(e) => setDraft(e.target.value)}
                placeholder="Spill the tea… posted anonymously, auto-deletes in 48h"
                rows={2}
                className="w-full bg-transparent text-zinc-100 placeholder-zinc-600 text-sm outline-none resize-none"
              />
              <div className="flex justify-end mt-1.5">
                <button
                  disabled={!draft.trim()}
                  onClick={() => { onPost(draft.trim()); setDraft(""); }}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-500 text-xs font-semibold"
                >
                  Post anonymously
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-2.5 pb-6">
          {visible.length === 0 && (
            <EmptyState icon={Coffee} title="No tea right now" subtitle="Be the first to post — it'll disappear in 48 hours either way." />
          )}
          {visible.map((t) => (
            <TeaCard
              key={t.id}
              t={t}
              myVote={myVotes[t.id]}
              onOpen={(tea) => { if (!verified) { onBlocked(); return; } setOpenTeaId(tea.id); }}
              onValidate={(id, vote) => { if (!verified) { onBlocked(); return; } onValidate(id, vote); }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
