// Reusable empty/error state — replaces bare "no results" text with a
// friendly, consistent moment (icon chip + title + subtitle + optional
// action). Used across search, chat, and feed empty cases.

export function EmptyState({ icon: Icon, title, subtitle, action, tone = "neutral" }) {
  const toneRing = tone === "error" ? "border-rose-500/20 bg-rose-500/5" : "border-zinc-800 bg-zinc-900";
  const toneIcon = tone === "error" ? "text-rose-400" : "text-zinc-600";
  return (
    <div className="animate-fade-in-up flex flex-col items-center text-center py-14 px-6">
      <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-4 ${toneRing}`}>
        {Icon && <Icon size={26} className={toneIcon} />}
      </div>
      <p className="text-sm font-medium text-zinc-300">{title}</p>
      {subtitle && <p className="text-xs text-zinc-500 mt-1.5 max-w-[240px] leading-relaxed">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorBanner({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="animate-fade-in-up mx-4 my-2 flex items-center justify-between gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3.5 py-2.5">
      <p className="text-xs text-rose-300">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="shrink-0 text-xs font-semibold text-rose-300 underline underline-offset-2">
          Retry
        </button>
      )}
    </div>
  );
}

export function OfflineBanner() {
  return (
    <div className="flex items-center justify-center gap-1.5 bg-zinc-900 border-b border-zinc-800 px-4 py-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
      <p className="text-[11px] text-zinc-500">You're offline — showing saved data</p>
    </div>
  );
}
