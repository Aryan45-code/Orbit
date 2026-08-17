import { useState } from "react";
import { REPORT_REASONS } from "../data/constants.js";
import { btnSecondary } from "./Common.jsx";

// Instagram reports from a bottom sheet with a plain divided option list.
export function ReportModal({ target, onClose, onSubmit }) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  return (
    <div
      className="absolute inset-0 bg-black/40 dark:bg-black/70 z-[60] flex items-end animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Report ${target}`}
        className="animate-rise-in w-full bg-surface border-t border-line rounded-t-2xl"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-line-strong mx-auto mt-2.5 mb-3" />
        <p className="text-center font-semibold text-fg pb-3 border-b border-line px-5">
          Report {target}
        </p>
        <div className="px-5 pt-3 pb-1">
          <p className="text-[13px] text-fg-muted mb-2">Why are you reporting this?</p>
        </div>
        <div>
          {REPORT_REASONS.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={`w-full text-left text-sm px-5 py-3.5 border-b border-line transition-colors ${
                reason === r ? "text-accent font-semibold" : "text-fg"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="p-5 flex gap-2">
          <button onClick={onClose} className={`${btnSecondary} flex-1 py-2.5`}>
            Cancel
          </button>
          <button
            onClick={() => onSubmit(reason)}
            className="flex-1 py-2.5 rounded-lg bg-accent text-accent-fg text-sm font-semibold active:opacity-70"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
