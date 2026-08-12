import { useState } from "react";
import { Check, ChevronLeft, ArrowRight, GraduationCap } from "lucide-react";
import { CATEGORIES, COLOR_MAP, ONBOARDING_STEPS } from "../data/constants.js";
import { Logo, AuroraBackground } from "./Common.jsx";

const COLLEGE_EMAIL_DOMAIN = "muj.manipal.edu";

// Only the local part (before @) is ever typed by the user — the domain is
// fixed and appended automatically, so there's no way to enter a non-Manipal
// email at all.
const localPartValid = (v) => /^[a-zA-Z0-9._%+-]+$/.test(v.trim());

export function Onboarding({ onDone, onGuest }) {
  const [step, setStep] = useState("contact");
  const [emailLocal, setEmailLocal] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [interests, setInterests] = useState([]);
  const toggleInterest = (catName) => {
    setInterests((cur) => cur.includes(catName) ? cur.filter((x) => x !== catName) : [...cur, catName]);
  };
  const stepIndex = ONBOARDING_STEPS.indexOf(step);
  const emailLooksValid = emailLocal.trim().length > 1 && localPartValid(emailLocal);
  const email = `${emailLocal.trim()}@${COLLEGE_EMAIL_DOMAIN}`;
  return (
    <div className="relative flex-1 flex flex-col px-7 pt-9 pb-8 overflow-y-auto no-scrollbar">
      <AuroraBackground />
      <div className="relative z-10 flex-1 flex flex-col">
      <div className="flex items-center justify-between animate-fade-in-up">
        <Logo size="text-2xl" />
      </div>
      <div className="flex items-center gap-1.5 mt-6 mb-8 animate-fade-in-up stagger-1">
        {ONBOARDING_STEPS.map((s, i) => (
          <span key={s} className={`h-1 rounded-full transition-all duration-300 ${i === stepIndex ? "w-7 bg-violet-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" : i < stepIndex ? "w-4 bg-violet-400/40" : "w-4 bg-zinc-800"}`} />
        ))}
      </div>
      {step === "contact" && (
        <div className="flex-1 flex flex-col">
          <p className="font-semibold text-zinc-100 mb-8 text-2xl leading-tight animate-fade-in-up stagger-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Let's get you in
          </p>
          <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-3 mb-4 transition-colors focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500/30 animate-fade-in-up stagger-3">
            <GraduationCap size={16} className="text-zinc-500 shrink-0" />
            <input
              value={emailLocal}
              onChange={(e) => setEmailLocal(e.target.value.replace(/[^a-zA-Z0-9._%+-]/g, ""))}
              placeholder="yourname"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              className="flex-1 min-w-0 bg-transparent text-zinc-100 placeholder-zinc-600 text-sm outline-none"
            />
            <span className="text-sm text-zinc-500 shrink-0">@{COLLEGE_EMAIL_DOMAIN}</span>
          </div>
          <button
            disabled={!emailLooksValid}
            onClick={() => setStep("otp")}
            className="w-full py-3 rounded-xl bg-violet-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 text-sm font-semibold shadow-lg shadow-violet-500/20 disabled:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 animate-fade-in-up stagger-4"
          >
            Send OTP <ArrowRight size={15} />
          </button>
          <div className="flex-1 min-h-6" />
          <button onClick={onGuest} className="w-full text-xs text-zinc-500 underline underline-offset-2 animate-fade-in-up stagger-6">Browse first, verify later</button>
        </div>
      )}
      {step === "otp" && (
        <div className="flex-1 flex flex-col animate-fade-in-up">
          <button onClick={() => setStep("contact")} className="text-xs text-zinc-500 flex items-center gap-1 mb-3 -mt-1 w-fit"><ChevronLeft size={14} />Back</button>
          <p className="font-semibold text-zinc-100 mb-1 text-2xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Enter the OTP</p>
          <p className="text-sm text-zinc-500 mb-6">Sent to <span className="text-zinc-300">{email}</span>. (Prototype: any 4 digits work.)</p>
          <input value={otp} onChange={(e) => setOtp(e.target.value.slice(0, 4))} placeholder="0000" className="w-full bg-zinc-900/80 border border-zinc-800 text-zinc-100 rounded-xl px-3.5 py-4 text-sm mb-4 tracking-[0.6em] text-center text-2xl outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 mono transition-colors" />
          <button disabled={otp.length < 4} onClick={() => setStep("profile")} className="w-full py-3 rounded-xl bg-violet-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 text-sm font-semibold shadow-lg shadow-violet-500/20 disabled:shadow-none active:scale-[0.98] transition-all">Verify</button>
          <div className="flex-1 min-h-6" />
          <p className="text-xs text-zinc-500 text-center">Didn't get a code? <span className="text-violet-400 font-medium">Resend OTP</span></p>
        </div>
      )}
      {step === "profile" && (
        <div className="flex-1 flex flex-col animate-fade-in-up">
          <button onClick={() => setStep("otp")} className="text-xs text-zinc-500 flex items-center gap-1 mb-3 -mt-1 w-fit"><ChevronLeft size={14} />Back</button>
          <p className="font-semibold text-zinc-100 mb-1 text-2xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Set up your profile</p>
          <p className="text-sm text-zinc-500 mb-5">Just the basics — you're set up as a Manipal Jaipur student.</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-xl px-3.5 py-2.5 text-sm mb-5 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors" />
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-zinc-300 font-medium">What are you into?</p>
            <button onClick={() => onDone(name.trim() || "You", [])} disabled={!name.trim()} className="text-xs text-violet-400 font-medium disabled:text-zinc-600">Skip — show me everything</button>
          </div>
          <p className="text-xs text-zinc-500 mb-3">Pick as many as you like — we'll personalize your home feed. Or skip to see all communities and clubs.</p>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {CATEGORIES.map((cat, i) => {
              const cm = COLOR_MAP[cat.color];
              const selected = interests.includes(cat.name);
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => toggleInterest(cat.name)}
                  className={`animate-pop-in stagger-${Math.min((i % 8) + 1, 8)} flex items-center gap-2 rounded-xl px-3 py-2.5 text-left border transition-all active:scale-[0.97] ${selected ? "border-violet-500 ring-1 ring-violet-500/30 bg-violet-500/5" : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"}`}
                >
                  <div className={`${cm.tint} ${cm.text} w-7 h-7 rounded-lg flex items-center justify-center shrink-0`}><Icon size={14} /></div>
                  <p className="text-xs font-medium text-zinc-200 leading-tight">{cat.name}</p>
                  {selected && <Check size={13} className="text-violet-400 ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>
          <div className="flex-1 min-h-3" />
          <button disabled={!name.trim()} onClick={() => onDone(name.trim(), interests)} className="w-full py-3 rounded-xl bg-violet-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 text-sm font-semibold shadow-lg shadow-violet-500/20 disabled:shadow-none active:scale-[0.98] transition-all">Enter Orbit</button>
        </div>
      )}
      </div>
    </div>
  );
}
