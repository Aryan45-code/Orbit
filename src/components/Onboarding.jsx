import { useState } from "react";
import { Phone, Mail, Check, ShieldCheck, Clock, ChevronLeft } from "lucide-react";
import { CATEGORIES, COLOR_MAP, ONBOARDING_STEPS } from "../data/constants.js";
import { Logo, OrbitWatermark } from "./Common.jsx";

export function Onboarding({ onDone, onGuest }) {
  const [step, setStep] = useState("contact");
  const [method, setMethod] = useState("phone");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [interests, setInterests] = useState([]);
  const toggleInterest = (catName) => {
    setInterests((cur) => cur.includes(catName) ? cur.filter((x) => x !== catName) : [...cur, catName]);
  };
  const stepIndex = ONBOARDING_STEPS.indexOf(step);
  return (
    <div className="relative flex-1 flex flex-col px-7 pt-9 pb-8 overflow-y-auto no-scrollbar">
      <OrbitWatermark />
      <div className="relative z-10 flex-1 flex flex-col">
      <Logo size="text-2xl" />
      <p className="text-sm text-zinc-500 mt-1.5">Feel at home, wherever you move.</p>
      <div className="flex items-center gap-1.5 mt-6 mb-8">
        {ONBOARDING_STEPS.map((s, i) => (
          <span key={s} className={`h-1 rounded-full transition-all ${i === stepIndex ? "w-7 bg-blue-400" : i < stepIndex ? "w-4 bg-blue-400/40" : "w-4 bg-zinc-800"}`} />
        ))}
      </div>
      {step === "contact" && (
        <div className="flex-1 flex flex-col">
          <p className="font-semibold text-zinc-100 mb-1 text-base">Let's verify it's really you</p>
          <p className="text-sm text-zinc-500 mb-6">Keeps Orbit to real people only.</p>
          <div className="flex gap-1 mb-3 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button onClick={() => { setMethod("phone"); setContact(""); }} className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg ${method === "phone" ? "bg-zinc-50 text-zinc-900" : "text-zinc-400"}`}>
              <Phone size={13} />Phone
            </button>
            <button onClick={() => { setMethod("email"); setContact(""); }} className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg ${method === "email" ? "bg-zinc-50 text-zinc-900" : "text-zinc-400"}`}>
              <Mail size={13} />Email
            </button>
          </div>
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 mb-4 focus-within:border-blue-500">
            {method === "phone" ? <Phone size={16} className="text-zinc-500 shrink-0" /> : <Mail size={16} className="text-zinc-500 shrink-0" />}
            <input
              value={contact} onChange={(e) => setContact(e.target.value)}
              placeholder={method === "phone" ? "98765 43210" : "you@email.com"}
              className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-600 text-sm outline-none"
            />
          </div>
          <button disabled={!contact.trim()} onClick={() => setStep("otp")} className="w-full py-2.5 rounded-xl bg-blue-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 text-sm font-semibold">Send OTP</button>
          <div className="flex-1 min-h-6" />
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0"><Check size={14} /></div>
              <p className="text-xs text-zinc-400">Only real, verified people get in</p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0"><ShieldCheck size={14} /></div>
              <p className="text-xs text-zinc-400">Your number or email is never shown publicly</p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0"><Clock size={14} /></div>
              <p className="text-xs text-zinc-400">Takes less than 30 seconds</p>
            </div>
          </div>
          <button onClick={onGuest} className="w-full text-xs text-zinc-500 underline underline-offset-2">Browse first, verify later</button>
        </div>
      )}
      {step === "otp" && (
        <div className="flex-1 flex flex-col">
          <button onClick={() => setStep("contact")} className="text-xs text-zinc-500 flex items-center gap-1 mb-3 -mt-1"><ChevronLeft size={14} />Back</button>
          <p className="font-semibold text-zinc-100 mb-1 text-base">Enter the OTP</p>
          <p className="text-sm text-zinc-500 mb-6">Sent to <span className="text-zinc-300">{contact}</span>. (Prototype: any 4 digits work.)</p>
          <input value={otp} onChange={(e) => setOtp(e.target.value.slice(0, 4))} placeholder="0000" className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl px-3.5 py-3 text-sm mb-4 tracking-[0.5em] text-center text-lg outline-none focus:border-blue-500 mono" />
          <button disabled={otp.length < 4} onClick={() => setStep("profile")} className="w-full py-2.5 rounded-xl bg-blue-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 text-sm font-semibold">Verify</button>
          <div className="flex-1 min-h-6" />
          <p className="text-xs text-zinc-500 text-center">Didn't get a code? <span className="text-blue-400 font-medium">Resend OTP</span></p>
        </div>
      )}
      {step === "profile" && (
        <div className="flex-1 flex flex-col">
          <button onClick={() => setStep("otp")} className="text-xs text-zinc-500 flex items-center gap-1 mb-3 -mt-1"><ChevronLeft size={14} />Back</button>
          <p className="font-semibold text-zinc-100 mb-1 text-base">Set up your profile</p>
          <p className="text-sm text-zinc-500 mb-5">Just the basics — your area is auto-detected from your verification.</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-xl px-3.5 py-2.5 text-sm mb-5 outline-none focus:border-blue-500" />
          <p className="text-sm text-zinc-300 font-medium mb-1">What are you into?</p>
          <p className="text-xs text-zinc-500 mb-3">Pick as many as you like — we'll personalize your home feed.</p>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {CATEGORIES.map((cat) => {
              const cm = COLOR_MAP[cat.color];
              const selected = interests.includes(cat.name);
              const Icon = cat.icon;
              return (
                <button key={cat.name} onClick={() => toggleInterest(cat.name)} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left border ${selected ? "border-blue-500 ring-1 ring-blue-500/30 bg-blue-500/5" : "border-zinc-800 bg-zinc-900"}`}>
                  <div className={`${cm.tint} ${cm.text} w-7 h-7 rounded-lg flex items-center justify-center shrink-0`}><Icon size={14} /></div>
                  <p className="text-xs font-medium text-zinc-200 leading-tight">{cat.name}</p>
                  {selected && <Check size={13} className="text-blue-400 ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>
          <div className="flex-1 min-h-3" />
          <button disabled={!name.trim()} onClick={() => onDone(name.trim(), interests)} className="w-full py-2.5 rounded-xl bg-blue-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 text-sm font-semibold">Enter Orbit</button>
        </div>
      )}
      </div>
    </div>
  );
}
