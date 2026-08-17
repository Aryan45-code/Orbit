
export function EmptyState({ icon: Icon, title, subtitle, action, tone = "neutral" }) {
  const isError = tone === "error";
  return (
    <div className="flex flex-col items-center text-center py-16 px-8">
      {Icon && (
        <div
          className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mb-4 ${
            isError ? "border-rose-500 text-rose-500" : "border-fg text-fg"
          }`}
        >
          <Icon size={28} strokeWidth={1.5} />
        </div>
      )}
      <p className="text-[17px] font-semibold text-fg">{title}</p>
      {subtitle && (
        <p className="text-sm text-fg-muted mt-1.5 max-w-[260px] leading-relaxed">{subtitle}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
