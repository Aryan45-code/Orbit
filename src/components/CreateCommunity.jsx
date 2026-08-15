import { useState } from "react";
import { ArrowLeft, ChevronLeft, ShieldCheck } from "lucide-react";
import { CATEGORIES, COLOR_MAP } from "../data/constants.js";

export function CreateCommunity({ onCreate, onClose, verified, onBlocked, onVerifyNow }) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  return (
    <div className="relative flex-1 bg-zinc-950 flex flex-col min-h-0">
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
      <div className="flex items-center gap-2.5 px-5 pt-4 pb-2 shrink-0">
        <button onClick={onClose} className="w-8 h-8 -ml-1.5 flex items-center justify-center rounded-full hover:bg-zinc-900"><ArrowLeft size={18} className="text-zinc-300" /></button>
        <p className="font-bold text-zinc-50">New community</p>
      </div>
        {!verified ? (
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col items-center justify-center text-center px-8 py-10">
            <ShieldCheck size={30} className="text-zinc-700 mb-3" />
            <p className="font-semibold text-zinc-200">Verify your account to create a community</p>
            <p className="text-sm text-zinc-500 mt-1.5">Only verified members can start new communities on Orbit.</p>
            <button onClick={onVerifyNow} className="mt-4 text-sm text-violet-400 font-medium">Verify now</button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 px-5 pt-5 pb-8">
            <div className="flex items-center gap-2 mb-5 shrink-0">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-violet-500" : "bg-zinc-800"}`} />
              ))}
            </div>
            {/* Each step is a <form> so Enter in a text field submits like
                tapping the primary button, and that button sits in a
                shrink-0 footer below the scrollable content so it's always
                visible even when the content above (e.g. the category
                grid) is taller than the screen. */}
            {step === 1 && (
              <form
                onSubmit={(e) => { e.preventDefault(); if (category) setStep(2); }}
                className="flex-1 flex flex-col min-h-0"
              >
                <div className="flex-1 overflow-y-auto no-scrollbar">
                  <p className="font-bold text-zinc-50 text-lg mb-1">Pick a category</p>
                  <p className="text-sm text-zinc-500 mb-4">Every community needs exactly one. This drives discovery.</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {CATEGORIES.map((cat) => {
                      const cm = COLOR_MAP[cat.color];
                      const Icon = cat.icon;
                      const selected = category === cat.name;
                      return (
                        <button type="button" key={cat.name} onClick={() => setCategory(cat.name)} className={`rounded-2xl p-3.5 text-left border ${selected ? "border-violet-500 ring-1 ring-violet-500/30 bg-violet-500/5" : "border-zinc-800 bg-zinc-900"}`}>
                          <div className={`${cm.tint} ${cm.text} w-9 h-9 rounded-xl flex items-center justify-center mb-2`}><Icon size={18} /></div>
                          <p className="text-sm font-medium text-zinc-200 leading-snug">{cat.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="shrink-0 pt-4">
                  <button type="submit" disabled={!category} className="w-full py-2.5 rounded-xl bg-violet-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 text-sm font-semibold">Continue</button>
                </div>
              </form>
            )}
            {step === 2 && (
              <form
                onSubmit={(e) => { e.preventDefault(); if (name.trim()) setStep(3); }}
                className="flex-1 flex flex-col min-h-0"
              >
                <div className="flex-1 overflow-y-auto no-scrollbar">
                  <button type="button" onClick={() => setStep(1)} className="text-xs text-zinc-500 flex items-center gap-1 mb-3"><ChevronLeft size={14} />Back</button>
                  <p className="font-bold text-zinc-50 text-lg mb-1">Name it</p>
                  <p className="text-sm text-zinc-500 mb-4">Freeform — make it sound like something people would actually tap on.</p>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sunday Football League" maxLength={80} className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-xl px-3.5 py-2.5 text-sm mb-3 outline-none focus:border-violet-500" />
                  <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short description (optional)" rows={3} maxLength={800} className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-violet-500" />
                </div>
                <div className="shrink-0 pt-4">
                  <button type="submit" disabled={!name.trim()} className="w-full py-2.5 rounded-xl bg-violet-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 text-sm font-semibold">Continue</button>
                </div>
              </form>
            )}
            {step === 3 && (
              <form
                onSubmit={(e) => { e.preventDefault(); onCreate({ name, category, desc }); }}
                className="flex-1 flex flex-col min-h-0"
              >
                <div className="flex-1 overflow-y-auto no-scrollbar">
                  <button type="button" onClick={() => setStep(2)} className="text-xs text-zinc-500 flex items-center gap-1 mb-3"><ChevronLeft size={14} />Back</button>
                  <p className="font-bold text-zinc-50 text-lg mb-1">Confirm</p>
                  <p className="text-sm text-zinc-500 mb-4">Your community gets a unique handle and QR code once created.</p>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-zinc-500">Category</span><span className="font-medium text-zinc-200">{category}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-zinc-500">Name</span><span className="font-medium text-zinc-200">{name}</span></div>
                  </div>
                </div>
                <div className="shrink-0 pt-4">
                  <button type="submit" className="w-full py-2.5 rounded-xl bg-violet-500 text-white text-sm font-semibold">Create community</button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
      </div>
  );
}
