import { useState } from "react";
import { ArrowLeft, ChevronLeft, ShieldCheck } from "lucide-react";
import { CATEGORIES, COLOR_MAP } from "../data/constants.js";

const primaryBtn =
  "w-full py-3 rounded-xl bg-accent disabled:bg-surface-2 text-accent-fg disabled:text-fg-subtle text-sm font-semibold active:scale-[0.99] transition-all";
const field =
  "w-full bg-surface-2 border border-line text-fg placeholder-fg-subtle rounded-xl px-3.5 py-3 text-sm outline-none focus:border-accent transition-colors";

export function CreateCommunity({ onCreate, onClose, verified, onBlocked, onVerifyNow }) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    await onCreate({ name: name.trim(), category, desc: desc.trim() });
    setSubmitting(false);
  };

  return (
    <div className="flex-1 bg-canvas flex flex-col min-h-0">
      <div
        className="flex items-center gap-2 px-4 pb-2 shrink-0"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <button
          onClick={onClose}
          aria-label="Back"
          className="w-9 h-9 -ml-1.5 flex items-center justify-center rounded-full text-fg-muted hover:bg-surface-2 hover:text-fg transition-colors"
        >
          <ArrowLeft size={19} />
        </button>
        <p className="font-semibold text-fg">New community</p>
      </div>

      {!verified ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <ShieldCheck size={30} className="text-fg-subtle mb-3" />
          <p className="font-medium text-fg">Verify your account to create a community</p>
          <p className="text-sm text-fg-muted mt-1.5 leading-relaxed">
            Only verified students can start new communities on Orbit.
          </p>
          <button onClick={onVerifyNow} className="mt-5 text-sm text-accent font-semibold">
            Verify now
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 px-5 pt-4 pb-8">
          <div className="flex items-center gap-1.5 mb-6 shrink-0">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-accent" : "bg-surface-3"
                }`}
              />
            ))}
          </div>
          {step === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (category) setStep(2);
              }}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <h2 className="font-semibold text-fg text-lg mb-1">Pick a category</h2>
                <p className="text-sm text-fg-muted mb-5">
                  Every community needs exactly one. This drives discovery.
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const cm = COLOR_MAP[cat.color];
                    const Icon = cat.icon;
                    const selected = category === cat.name;
                    return (
                      <button
                        type="button"
                        key={cat.name}
                        onClick={() => setCategory(cat.name)}
                        className={`rounded-2xl p-3.5 text-left border transition-colors ${
                          selected
                            ? "border-accent bg-accent/5"
                            : "border-line bg-surface hover:border-line-strong"
                        }`}
                      >
                        <div
                          className={`${cm.tint} ${cm.text} w-9 h-9 rounded-xl flex items-center justify-center mb-2.5`}
                        >
                          <Icon size={17} />
                        </div>
                        <p className="text-sm font-medium text-fg leading-snug">{cat.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="shrink-0 pt-4">
                <button type="submit" disabled={!category} className={primaryBtn}>
                  Continue
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (name.trim()) setStep(3);
              }}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-fg-muted flex items-center gap-1 mb-4"
                >
                  <ChevronLeft size={14} />
                  Back
                </button>
                <h2 className="font-semibold text-fg text-lg mb-1">Name it</h2>
                <p className="text-sm text-fg-muted mb-5">
                  Make it sound like something people would actually tap on.
                </p>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sunday Football League"
                  maxLength={80}
                  className={`${field} mb-2.5`}
                />
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Short description (optional)"
                  rows={3}
                  maxLength={800}
                  className={`${field} resize-none`}
                />
              </div>
              <div className="shrink-0 pt-4">
                <button type="submit" disabled={!name.trim()} className={primaryBtn}>
                  Continue
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-fg-muted flex items-center gap-1 mb-4"
                >
                  <ChevronLeft size={14} />
                  Back
                </button>
                <h2 className="font-semibold text-fg text-lg mb-1">Confirm</h2>
                <p className="text-sm text-fg-muted mb-5">
                  Your community gets a unique handle and QR code once created.
                </p>
                <dl className="bg-surface border border-line rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between gap-4 text-sm">
                    <dt className="text-fg-muted shrink-0">Category</dt>
                    <dd className="font-medium text-fg text-right">{category}</dd>
                  </div>
                  <div className="flex justify-between gap-4 text-sm">
                    <dt className="text-fg-muted shrink-0">Name</dt>
                    <dd className="font-medium text-fg text-right">{name}</dd>
                  </div>
                  {desc.trim() && (
                    <div className="flex justify-between gap-4 text-sm">
                      <dt className="text-fg-muted shrink-0">About</dt>
                      <dd className="text-fg text-right">{desc.trim()}</dd>
                    </div>
                  )}
                </dl>
              </div>
              <div className="shrink-0 pt-4">
                <button type="submit" disabled={submitting} className={primaryBtn}>
                  {submitting ? "Creating…" : "Create community"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
