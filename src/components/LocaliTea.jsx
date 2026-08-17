import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft, Coffee, MessageCircle, Flag, Clock, HeartHandshake, Trash2,
  ThumbsUp, ThumbsDown,
} from "lucide-react";
import { teaTimeLeft, isTeaExpired } from "../utils/helpers.js";
import { EmptyState } from "./EmptyState.jsx";
import { btnSecondary } from "./Common.jsx";

const REACTION_EMOJIS = ["😂", "❤️", "😮", "😢", "🔥"];

function ReactionRow({ reactions, myReaction, onReact }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {REACTION_EMOJIS.map((emoji) => {
        const count = reactions?.[emoji] || 0;
        const mine = myReaction === emoji;
        return (
          <button
            key={emoji}
            onClick={(e) => {
              e.stopPropagation();
              onReact(emoji);
            }}
            aria-pressed={mine}
            className={`flex items-center gap-1 text-[13px] font-medium rounded-full px-2.5 py-1 transition-colors ${
              mine ? "bg-accent/15 text-accent" : "bg-surface-3 text-fg-muted"
            }`}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="mono">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

// Zero votes must render neutral, not 100% cap.
function VoteBar({ trueCount, capCount }) {
  const total = trueCount + capCount;
  if (total === 0) return <div className="mt-3 h-0.5 rounded-full bg-surface-3" />;
  const truePct = Math.round((trueCount / total) * 100);
  return (
    <div className="mt-3 h-0.5 rounded-full bg-surface-3 overflow-hidden flex">
      <div className="h-full bg-emerald-500" style={{ width: `${truePct}%` }} />
      <div className="h-full bg-rose-500" style={{ width: `${100 - truePct}%` }} />
    </div>
  );
}

// Full-bleed, hairline-divided — the same shape as an Instagram feed post.
function TeaCard({ t, onOpen, onValidate, myVote, onReact, myReaction }) {
  const isConfession = t.category === "confession";
  const commentCount = t.commentCount ?? t.comments?.length ?? 0;
  return (
    <button
      onClick={() => onOpen(t)}
      className="w-full text-left px-4 py-3.5 border-b border-line active:bg-surface-2 transition-colors"
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] font-semibold text-fg">Anonymous</span>
        <span className="flex items-center gap-1 text-[13px] text-fg-subtle">
          <Clock size={12} />
          {teaTimeLeft(t.createdAt)}
        </span>
      </div>

      <p className="text-sm text-fg leading-relaxed line-clamp-4">{t.text}</p>

      {isConfession ? (
        <div className="flex items-center justify-between mt-3 gap-2">
          <ReactionRow reactions={t.reactions} myReaction={myReaction} onReact={onReact} />
          <span className="flex items-center gap-1 text-[13px] text-fg-subtle shrink-0">
            <MessageCircle size={14} />
            {commentCount}
          </span>
        </div>
      ) : (
        <>
          <VoteBar trueCount={t.trueCount} capCount={t.capCount} />
          <div className="flex items-center gap-5 mt-2.5">
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onValidate(t.id, "true");
              }}
              className={`flex items-center gap-1.5 text-[13px] font-medium ${
                myVote === "true" ? "text-emerald-600 dark:text-emerald-400" : "text-fg-muted"
              }`}
            >
              <ThumbsUp size={15} fill={myVote === "true" ? "currentColor" : "none"} />
              {t.trueCount}
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onValidate(t.id, "cap");
              }}
              className={`flex items-center gap-1.5 text-[13px] font-medium ${
                myVote === "cap" ? "text-rose-600 dark:text-rose-400" : "text-fg-muted"
              }`}
            >
              <ThumbsDown size={15} fill={myVote === "cap" ? "currentColor" : "none"} />
              {t.capCount}
            </span>
            <span className="flex items-center gap-1.5 text-[13px] text-fg-muted ml-auto">
              <MessageCircle size={15} />
              {commentCount}
            </span>
          </div>
        </>
      )}
    </button>
  );
}

function TeaDetail({
  t, onBack, onValidate, myVote, onReact, myReaction, onComment, onReport,
  canDelete, onDelete, canDeleteComment, onDeleteComment,
}) {
  const [draft, setDraft] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isConfession = t.category === "confession";

  const submitComment = () => {
    const text = draft.trim();
    if (!text) return;
    onComment(t.id, text);
    setDraft("");
  };

  const iconBtn = "w-8 h-8 flex items-center justify-center text-fg active:opacity-50";

  return (
    <div className="flex-1 bg-canvas flex flex-col min-h-0">
      <div
        className="flex items-center gap-3 px-4 pb-3 border-b border-line shrink-0"
        style={{ paddingTop: "max(0.875rem, env(safe-area-inset-top))" }}
      >
        <button onClick={onBack} aria-label="Back" className={`${iconBtn} -ml-1.5`}>
          <ArrowLeft size={22} strokeWidth={1.9} />
        </button>
        <p className="flex-1 text-base font-semibold text-fg">Post</p>
        {canDelete &&
          (confirmDelete ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setConfirmDelete(false);
                  onBack();
                  onDelete(t.id);
                }}
                className="text-[13px] text-rose-500 font-semibold"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-[13px] text-fg-muted"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} aria-label="Delete" className={iconBtn}>
              <Trash2 size={18} strokeWidth={1.9} />
            </button>
          ))}
        <button onClick={onReport} aria-label="Report" className={iconBtn}>
          <Flag size={18} strokeWidth={1.9} />
        </button>
      </div>

      <div className="px-4 py-3.5 border-b border-line shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] font-semibold text-fg">Anonymous</span>
          <span className="flex items-center gap-1 text-[13px] text-fg-subtle">
            <Clock size={12} />
            {teaTimeLeft(t.createdAt)}
          </span>
        </div>
        <p className="text-sm text-fg leading-relaxed">{t.text}</p>

        {isConfession ? (
          <div className="mt-3">
            <ReactionRow reactions={t.reactions} myReaction={myReaction} onReact={onReact} />
          </div>
        ) : (
          <>
            <VoteBar trueCount={t.trueCount} capCount={t.capCount} />
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => onValidate(t.id, "true")}
                className={`flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-2 rounded-lg transition-colors ${
                  myVote === "true"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-surface-3 text-fg-muted"
                }`}
              >
                <ThumbsUp size={15} fill={myVote === "true" ? "currentColor" : "none"} />
                {t.trueCount} true
              </button>
              <button
                onClick={() => onValidate(t.id, "cap")}
                className={`flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-2 rounded-lg transition-colors ${
                  myVote === "cap"
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                    : "bg-surface-3 text-fg-muted"
                }`}
              >
                <ThumbsDown size={15} fill={myVote === "cap" ? "currentColor" : "none"} />
                {t.capCount} cap
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {t.comments === null && (
          <p className="text-[13px] text-fg-subtle text-center py-8">Loading…</p>
        )}
        {t.comments && t.comments.length === 0 && (
          <p className="text-[13px] text-fg-subtle text-center py-8">
            No replies yet — start the discussion.
          </p>
        )}
        {(t.comments || []).map((c) => (
          <div key={c.id} className="flex items-start gap-2 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-fg leading-relaxed">
                <span className="font-semibold">{c.who}</span> {c.text}
              </p>
            </div>
            {canDeleteComment?.(c.id) && (
              <button
                onClick={() => onDeleteComment(t.id, c.id)}
                aria-label="Delete reply"
                className="shrink-0 text-fg-subtle active:opacity-50 p-1"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div
        className="flex items-center gap-2 px-4 py-3 border-t border-line shrink-0"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitComment();
          }}
          placeholder="Add a reply, anonymously…"
          maxLength={1000}
          className="flex-1 min-w-0 bg-transparent border border-line text-fg placeholder-fg-subtle rounded-full px-4 py-2 text-sm outline-none focus:border-line-strong transition-colors"
        />
        <button
          onClick={submitComment}
          disabled={!draft.trim()}
          className="text-sm font-semibold text-accent disabled:opacity-40 shrink-0 px-1"
        >
          Post
        </button>
      </div>
    </div>
  );
}

export function LocaliTeaScreen({
  teaPosts, onClose, verified, onBlocked, onPost, onValidate, onComment, onReport,
  myVotes, onOpenPost, onReact, myReactions, myPostIds, myCommentIds, canModerate,
  onDeletePost, onDeleteComment,
}) {
  const [tab, setTab] = useState("tea"); // "tea" | "confession"
  const [openTeaId, setOpenTeaId] = useState(null);
  const [draft, setDraft] = useState("");

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const visible = useMemo(
    () =>
      teaPosts
        .filter((t) => !isTeaExpired(t.createdAt) && (t.category || "tea") === tab)
        .sort((a, b) => b.createdAt - a.createdAt),
    // tick drives the expiry re-check; it is intentionally an input here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [teaPosts, tab, tick]
  );

  const openTea = teaPosts.find((t) => t.id === openTeaId);

  if (openTea) {
    return (
      <TeaDetail
        t={openTea}
        onBack={() => setOpenTeaId(null)}
        onValidate={onValidate}
        myVote={myVotes[openTea.id]}
        onReact={(emoji) => onReact(openTea.id, emoji)}
        myReaction={myReactions[openTea.id]}
        onComment={onComment}
        onReport={() => onReport("a Locali-Tea post")}
        canDelete={!!canModerate || !!myPostIds?.has(openTea.id)}
        onDelete={onDeletePost}
        canDeleteComment={(id) => !!canModerate || !!myCommentIds?.has(id)}
        onDeleteComment={onDeleteComment}
      />
    );
  }

  const tabClass = (isOn) =>
    `flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold py-3 border-b-2 -mb-px transition-colors ${
      isOn ? "border-fg text-fg" : "border-transparent text-fg-subtle"
    }`;

  return (
    <div className="flex-1 bg-canvas flex flex-col min-h-0">
      <div
        className="flex items-center gap-3 px-4 pb-3 shrink-0"
        style={{ paddingTop: "max(0.875rem, env(safe-area-inset-top))" }}
      >
        <button
          onClick={onClose}
          aria-label="Back"
          className="shrink-0 text-fg active:opacity-50 -ml-1.5"
        >
          <ArrowLeft size={22} strokeWidth={1.9} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-fg">Locali-Tea</h1>
          <p className="text-[13px] text-fg-subtle">Anonymous · gone in 48 hours</p>
        </div>
      </div>

      <div className="flex border-b border-line px-4 shrink-0">
        <button onClick={() => setTab("tea")} className={tabClass(tab === "tea")}>
          <Coffee size={16} strokeWidth={1.9} />
          Tea
        </button>
        <button onClick={() => setTab("confession")} className={tabClass(tab === "confession")}>
          <HeartHandshake size={16} strokeWidth={1.9} />
          Confessions
        </button>
      </div>

      {verified && (
        <div className="px-4 py-3 border-b border-line shrink-0">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              tab === "tea"
                ? "Spill the tea… anonymous, auto-deletes in 48h"
                : "Get it off your chest… anonymous, auto-deletes in 48h"
            }
            rows={2}
            maxLength={2000}
            className="w-full bg-transparent text-fg placeholder-fg-subtle text-sm outline-none resize-none"
          />
          <div className="flex justify-end">
            <button
              disabled={!draft.trim()}
              onClick={() => {
                onPost(draft.trim(), tab);
                setDraft("");
              }}
              className="text-sm font-semibold text-accent disabled:opacity-40 px-1"
            >
              Post anonymously
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {visible.length === 0 ? (
          <EmptyState
            icon={tab === "tea" ? Coffee : HeartHandshake}
            title={tab === "tea" ? "No tea right now" : "No confessions right now"}
            subtitle="Be the first to post — it'll disappear in 48 hours either way."
            action={
              !verified ? (
                <button onClick={onBlocked} className={`${btnSecondary} py-2`}>
                  Verify to post
                </button>
              ) : null
            }
          />
        ) : (
          visible.map((t) => (
            <TeaCard
              key={t.id}
              t={t}
              myVote={myVotes[t.id]}
              myReaction={myReactions[t.id]}
              onReact={(emoji) => {
                if (!verified) return onBlocked();
                onReact(t.id, emoji);
              }}
              onOpen={(tea) => {
                if (!verified) return onBlocked();
                setOpenTeaId(tea.id);
                onOpenPost?.(tea.id);
              }}
              onValidate={(id, vote) => {
                if (!verified) return onBlocked();
                onValidate(id, vote);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
