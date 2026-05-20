"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brain, Sparkles, Loader2, Target, Heart, Waves, Settings, Leaf, Zap, Infinity, Coffee, Compass, CheckCircle2 } from "lucide-react";
import { useAppStore } from "../store";
import { API_URL } from "@/lib/api";


const FOCUS_OPTIONS = [
  { id: "exams", label: "Exams", icon: Zap },
  { id: "internships", label: "Internships", icon: Target },
  { id: "career_growth", label: "Career Growth", icon: Compass },
  { id: "consistency", label: "Building Consistency", icon: Infinity },
  { id: "personal_projects", label: "Personal Projects", icon: Brain },
  { id: "mental_clarity", label: "Mental Clarity", icon: Waves },
];

const STRUGGLE_OPTIONS = [
  { id: "overwhelm", label: "Overwhelm", icon: Waves },
  { id: "procrastination", label: "Procrastination", icon: Coffee },
  { id: "adhd_focus", label: "ADHD / focus issues", icon: Infinity },
  { id: "burnout", label: "Burnout", icon: Heart },
  { id: "priorities", label: "Too many priorities", icon: Target },
  { id: "consistency", label: "Staying consistent", icon: CheckCircle2 },
];

const STYLE_OPTIONS = [
  { id: "calm", label: "Calm & gentle", icon: Leaf },
  { id: "structured", label: "Structured & focused", icon: Settings },
  { id: "adhd_friendly", label: "ADHD-friendly", icon: Sparkles },
  { id: "minimal_pressure", label: "Minimal pressure", icon: Waves },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, token, setUser, setUserMemory } = useAppStore();
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.name || "");
  const [focus, setFocus] = useState("");
  const [struggle, setStruggle] = useState("");
  const [style, setStyle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.name && !name) {
      setName(user.name);
    }
  }, [user]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleComplete = async () => {
    if (!name || !focus || !struggle || !style) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/onboarding`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          user_name: name,
          primary_focus: focus,
          current_struggle: struggle,
          preferred_style: style
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Update user state with new name if it changed
        if (user) {
          setUser({ ...user, name: data.user_name });
        }
        
        // Initialize local user memory based on selections
        setUserMemory({
          current_focus: [focus],
          stressors: [struggle],
          preferred_style: style
        });

        // Small delay to let the user see the success state
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
    } catch (err) {
      console.error("Onboarding failed", err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-tr from-slate-50 via-indigo-50/30 to-slate-100 dark:from-[#0F0C20] dark:via-[#151030] dark:to-[#0A0718]">
      <div className="w-full max-w-2xl p-8 sm:p-12 rounded-[2rem] bg-white/70 dark:bg-white/[0.02] border border-white/40 dark:border-white/[0.08] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.8)] relative overflow-hidden transition-all duration-500">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-white/[0.05]">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-primary transition-all duration-700 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-primary/10 dark:bg-primary/5 blur-[100px] pointer-events-none" />

        <div className="relative z-10 min-h-[400px] flex flex-col justify-center">
          
          {step === 1 && (
            <div className="animate-fade-in text-center space-y-8">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 mb-6">
                <Sparkles size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight mb-3">Welcome to HabitFlow</h1>
                <p className="text-slate-500 dark:text-[#8E8EA8] text-lg">Let's set up your cognitive space. What should we call you?</p>
              </div>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && name && handleNext()}
                placeholder="Your Name"
                className="w-full max-w-sm mx-auto text-center text-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 rounded-2xl px-6 py-4 text-slate-800 dark:text-white focus:outline-none placeholder:text-slate-400 dark:placeholder:text-[#5B5B7A] transition-all shadow-sm dark:shadow-none"
              />
              <button
                onClick={handleNext}
                disabled={!name.trim()}
                className="mx-auto block px-8 py-3 rounded-xl bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-slide-up space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight mb-2">What's your primary focus right now?</h2>
                <p className="text-slate-500 dark:text-[#8E8EA8]">This helps tailor your daily matrix and reflections.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {FOCUS_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setFocus(opt.label); handleNext(); }}
                    className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${focus === opt.label ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500" : "border-slate-200 dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-300"}`}
                  >
                    <opt.icon size={20} className={focus === opt.label ? "text-indigo-500" : "text-slate-400 dark:text-slate-500"} />
                    <span className="font-semibold text-sm">{opt.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={handleBack} className="mx-auto block text-xs font-semibold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">Go Back</button>
            </div>
          )}

          {step === 3 && (
            <div className="animate-slide-up space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight mb-2">What's your biggest struggle lately?</h2>
                <p className="text-slate-500 dark:text-[#8E8EA8]">We'll adjust the system to reduce friction where it hurts most.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {STRUGGLE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setStruggle(opt.label); handleNext(); }}
                    className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${struggle === opt.label ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500" : "border-slate-200 dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-300"}`}
                  >
                    <opt.icon size={20} className={struggle === opt.label ? "text-rose-500" : "text-slate-400 dark:text-slate-500"} />
                    <span className="font-semibold text-sm">{opt.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={handleBack} className="mx-auto block text-xs font-semibold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">Go Back</button>
            </div>
          )}

          {step === 4 && (
            <div className="animate-slide-up space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight mb-2">How should the AI support you?</h2>
                <p className="text-slate-500 dark:text-[#8E8EA8]">Choose the tone for your daily reflections and Tiny Mode.</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {STYLE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setStyle(opt.label)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${style === opt.label ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500" : "border-slate-200 dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-300"}`}
                  >
                    <opt.icon size={20} className={style === opt.label ? "text-emerald-500" : "text-slate-400 dark:text-slate-500"} />
                    <span className="font-semibold text-sm">{opt.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="flex items-center justify-between mt-8">
                <button onClick={handleBack} className="text-sm font-semibold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors px-4 py-2">Go Back</button>
                <button
                  onClick={handleComplete}
                  disabled={!style || loading}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-primary text-white font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Preparing Space...</>
                  ) : (
                    <>Finish Setup <Sparkles size={18} /></>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
