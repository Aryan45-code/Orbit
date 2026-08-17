import { useState } from "react";
import { Check, ChevronLeft, ArrowRight, Mail } from "lucide-react";
import { CATEGORIES, COLOR_MAP, ONBOARDING_STEPS } from "../data/constants.js";
import { Logo } from "./Common.jsx";
import { supabase } from "../lib/supabaseClient.js";

const emailValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const OTP_LENGTH = 8;

const primaryBtn =
  "w-full py-3 rounded-xl bg-accent disabled:bg-surface-2 text-accent-fg disabled:text-fg-subtle text-sm font-semibold active:scale-[0.99] transition-all flex items-center justify-center gap-1.5";

export function Onboarding({ onDone, onGuest }) {
  const [step, setStep] = useState("contact");
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const toggleInterest = (catName) => {
    setInterests((cur) =>
      cur.includes(catName) ? cur.filter((x) => x !== catName) : [...cur, catName]
    );
  };

  const stepIndex = ONBOARDING_STEPS.indexOf(step);
  const trimmedEmail = email.trim();
  const emailLooksValid = emailValid(email);

  const sendOtp = async () => {
    setLoading(true);
    setErrorMsg("");
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) {
      setErrorMsg(error.message || "Couldn't send the code. Try again.");
      return;
    }
    setOtpSent(true);
  };

  const verifyOtp = async () => {
    setLoading(true);
    setErrorMsg("");
    const { data, error } = await supabase.auth.verifyOtp({
      email: trimmedEmail,
      token: otp,
      type: "email",
    });
    if (error) {
      setLoading(false);
      setErrorMsg(error.message || "That code didn't work. Check it and try again.");
      return;
    }

    const userId = data?.user?.id;
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, interests")
        .eq("id", userId)
        .single();
      if (profile?.name) {
        setLoading(false);
        onDone(profile.name, profile.interests || []);
        return;
      }
      // Partially filled (e.g. abandoned last time) — prefill, don't reset.
      if (profile) setInterests(profile.interests || []);
    }

    setLoading(false);
    setStep("profile");
  };

  const finishProfile = async (finalName, finalInterests) => {
    setLoading(true);
    setErrorMsg("");
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      const { error } = await supabase
        .from("profiles")
        .update({ name: finalName, interests: finalInterests })
        .eq("id", session.user.id);
      if (error) {
        setLoading(false);
        setErrorMsg("Couldn't save your profile. Check your connection and try again.");
        return;
      }
    }
    setLoading(false);
    onDone(finalName, finalInterests);
  };

  return (
    <div
      className="flex-1 flex flex-col px-6 pb-8 min-h-0 overflow-hidden"
      style={{ paddingTop: "max(2.25rem, env(safe-area-inset-top))" }}
    >
      <div className="flex items-center justify-between shrink-0">
        <Logo size="text-2xl" />
        <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2.5 py-1 rounded-full">
          Beta
        </span>
      </div>
      <p className="text-xs text-fg-muted mt-2.5 shrink-0 leading-relaxed">
        You're using an early build of Orbit — things may break or change. Thanks for helping test it.
      </p>

      <div className="flex items-center gap-1.5 mt-7 mb-8 shrink-0">
        {ONBOARDING_STEPS.map((s, i) => (
          <span
            key={s}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === stepIndex ? "w-7 bg-accent" : i < stepIndex ? "w-4 bg-accent/40" : "w-4 bg-surface-3"
            }`}
          />
        ))}
      </div>

      {step === "contact" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (loading) return;
            if (!otpSent) {
              if (emailLooksValid) sendOtp();
            } else if (otp.length >= OTP_LENGTH) {
              verifyOtp();
            }
          }}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <h1
              className="font-semibold text-fg mb-7 text-2xl leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Let's get you in
            </h1>
            <div
              className={`flex items-center gap-2.5 bg-surface-2 border rounded-xl px-3.5 py-3 transition-colors ${
                otpSent ? "border-line opacity-60" : "border-line focus-within:border-accent"
              }`}
            >
              <Mail size={16} className="text-fg-subtle shrink-0" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                disabled={otpSent}
                className="flex-1 min-w-0 bg-transparent text-fg placeholder-fg-subtle text-sm outline-none disabled:cursor-not-allowed"
              />
              {otpSent && (
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setErrorMsg("");
                  }}
                  className="text-xs text-accent font-medium shrink-0"
                >
                  Change
                </button>
              )}
            </div>

            {otpSent && (
              <div className="mt-5">
                <p className="text-sm text-fg-muted mb-3">
                  Enter the {OTP_LENGTH}-digit code sent to{" "}
                  <span className="text-fg">{trimmedEmail}</span>.
                </p>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
                  placeholder={"0".repeat(OTP_LENGTH)}
                  inputMode="numeric"
                  autoFocus
                  className="w-full bg-surface-2 border border-line text-fg placeholder-fg-subtle rounded-xl px-3.5 py-4 tracking-[0.4em] text-center text-xl outline-none focus:border-accent mono transition-colors"
                />
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading}
                  className="text-xs text-fg-muted text-center mt-4 w-full disabled:opacity-50"
                >
                  Didn't get a code? <span className="text-accent font-medium">Resend</span>
                </button>
              </div>
            )}

            {errorMsg && <p className="text-xs text-rose-600 dark:text-rose-400 mt-3">{errorMsg}</p>}
          </div>

          <div className="shrink-0 pt-4">
            <button
              type="submit"
              disabled={loading || (otpSent ? otp.length < OTP_LENGTH : !emailLooksValid)}
              className={primaryBtn}
            >
              {loading ? (
                "Please wait…"
              ) : otpSent ? (
                "Verify"
              ) : (
                <>
                  Send code <ArrowRight size={15} />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onGuest}
              className="w-full text-xs text-fg-muted underline underline-offset-2 mt-4"
            >
              Browse first, verify later
            </button>
          </div>
        </form>
      )}

      {step === "profile" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim() && !loading) finishProfile(name.trim(), interests);
          }}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setStep("contact")}
              className="text-xs text-fg-muted flex items-center gap-1 mb-4 -mt-1 w-fit"
            >
              <ChevronLeft size={14} />
              Back
            </button>
            <h1
              className="font-semibold text-fg mb-1.5 text-2xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Set up your profile
            </h1>
            <p className="text-sm text-fg-muted mb-5">Just the basics to get you started.</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={60}
              className="w-full bg-surface-2 border border-line text-fg placeholder-fg-subtle rounded-xl px-3.5 py-3 text-sm mb-6 outline-none focus:border-accent transition-colors"
            />

            <div className="flex items-center justify-between mb-1.5 gap-3">
              <p className="text-sm text-fg font-medium">What are you into?</p>
              <button
                type="button"
                onClick={() => finishProfile(name.trim(), [])}
                disabled={!name.trim() || loading}
                className="text-xs text-accent font-medium disabled:text-fg-subtle shrink-0"
              >
                Skip
              </button>
            </div>
            <p className="text-xs text-fg-muted mb-4 leading-relaxed">
              Pick as many as you like — we'll sort your home feed around them. Skip to see
              everything instead.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const cm = COLOR_MAP[cat.color];
                const selected = interests.includes(cat.name);
                const Icon = cat.icon;
                return (
                  <button
                    type="button"
                    key={cat.name}
                    onClick={() => toggleInterest(cat.name)}
                    aria-pressed={selected}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left border transition-colors ${
                      selected ? "border-accent bg-accent/5" : "border-line bg-surface hover:border-line-strong"
                    }`}
                  >
                    <div
                      className={`${cm.tint} ${cm.text} w-7 h-7 rounded-lg flex items-center justify-center shrink-0`}
                    >
                      <Icon size={14} />
                    </div>
                    <p className="text-xs font-medium text-fg leading-tight">{cat.name}</p>
                    {selected && <Check size={13} className="text-accent ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>

            {errorMsg && <p className="text-xs text-rose-600 dark:text-rose-400 mt-4">{errorMsg}</p>}
          </div>

          <div className="shrink-0 pt-4">
            <button type="submit" disabled={!name.trim() || loading} className={primaryBtn}>
              {loading ? "Please wait…" : "Enter Orbit"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
