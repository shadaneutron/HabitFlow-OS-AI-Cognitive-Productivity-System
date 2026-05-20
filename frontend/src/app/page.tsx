"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Clock,
  Target,
  CheckCircle2,
  Flame,
  Brain,
  Zap,
  ArrowRight,
  AlertTriangle,
  Frown,
  Sparkles,
  Loader2
} from "lucide-react";
import { useAppStore } from "./store";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

/* ──────────────── Eat The Frog Component ──────────────── */
function EatTheFrog() {
  const {
    frog,
    setFrog,
    completeFrog,
    clearFrog,
    matrixTasks,
    cognitiveContext,
    showToast,
    setTinyMode,
    timeBlocks,
    addTimeBlock
  } = useAppStore();

  const [picking, setPicking] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  const isFrogToday = frog && frog.date === todayStr;

  const availableTasks = matrixTasks.filter(
    (t) => !t.done && (t.quadrant === "q1" || t.quadrant === "q2")
  );

  const getRecommendationReasoning = (task: any) => {
    const reasons: string[] = [];
    if (task.quadrant === "q1") {
      reasons.push("Urgent Priority (Q1): Tackling this first reduces immediate pressure.");
    } else {
      reasons.push("Strategic Growth (Q2): Progress on this prevents future stress and builds skills.");
    }

    if (cognitiveContext) {
      const lowerTitle = task.title.toLowerCase();
      const focuses = cognitiveContext.active_focus || [];
      const stressors = cognitiveContext.active_stressors || [];

      const matchingFocus = focuses.find((term: string) => {
        const words = term.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        return words.length === 0 ? lowerTitle.includes(term.toLowerCase()) : words.some((w) => lowerTitle.includes(w));
      });

      const matchingStressor = stressors.find((term: string) => {
        const words = term.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        return words.length === 0 ? lowerTitle.includes(term.toLowerCase()) : words.some((w) => lowerTitle.includes(w));
      });

      if (matchingFocus) {
        reasons.push(`Focus Match: Directly aligns with your active focus on "${matchingFocus}".`);
      }
      if (matchingStressor) {
        reasons.push(`Stressor Relief: Helps mitigate anxiety related to "${matchingStressor}".`);
      }
    }
    return reasons;
  };

  const isRecommended = (task: any) => {
    if (!cognitiveContext) return false;
    const lowerTitle = task.title.toLowerCase();
    const focuses = cognitiveContext.active_focus || [];
    const stressors = cognitiveContext.active_stressors || [];

    return [...focuses, ...stressors].some((term) => {
      const words = term.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      return words.length === 0 ? lowerTitle.includes(term.toLowerCase()) : words.some((w) => lowerTitle.includes(w));
    });
  };

  const handleSelectFrog = (taskId: string, title: string) => {
    setFrog(taskId, title);
    setPicking(false);
    showToast(
      `Frog selected: "${title}" 🐸`,
      () => {
        clearFrog();
      },
      "Undo"
    );
  };

  const getSuggestedHour = () => {
    const dayBlocks = timeBlocks.filter((b) => b.date === todayStr);
    const currentHour = new Date().getHours();
    const startHour = Math.max(9, currentHour + 1);

    for (let h = startHour; h <= 20; h++) {
      if (!dayBlocks.some((b) => b.hour === h)) {
        return h;
      }
    }
    return currentHour + 1 <= 24 ? currentHour + 1 : 9;
  };

  const suggestedHour = getSuggestedHour();
  const isScheduled = frog && timeBlocks.some(
    (b) => b.date === todayStr && b.taskId === frog.taskId
  );

  const handleScheduleFocusSlot = () => {
    if (!frog) return;
    addTimeBlock({
      date: todayStr,
      hour: suggestedHour,
      taskTitle: `Eat the Frog: ${frog.taskTitle}`,
      color: "#EF4444",
      taskId: frog.taskId,
    });
    showToast(`Scheduled "${frog.taskTitle}" for today at ${suggestedHour === 12 ? "12 PM" : suggestedHour > 12 ? `${suggestedHour - 12} PM` : `${suggestedHour} AM`}! 📅`);
  };

  if (isFrogToday && frog.completed) {
    return (
      <div className="rounded-2xl border border-success/25 bg-success-light dark:bg-emerald-950/40 dark:border-emerald-500/20 p-5 sm:p-6 animate-fade-in shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-3xl">🎉</span>
          <div>
            <h2 className="text-sm font-bold text-success uppercase tracking-wider">Frog Eaten!</h2>
            <p className="text-base font-bold text-text-dark dark:text-dark-text mt-1 line-through">{frog.taskTitle}</p>
            <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">Great job tackling the hardest task first!</p>
          </div>
        </div>
      </div>
    );
  }

  if (isFrogToday && !frog.completed) {
    return (
      <div className="widget-card border border-warning/30 dark:bg-[#1A1500] dark:border-amber-500/20 dark:shadow-[0_0_40px_rgba(245,158,11,0.08)] animate-fade-in space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl sm:text-4xl animate-frog">🐸</span>
            <div>
              <h2 className="text-xs font-bold text-warning uppercase tracking-wider">Today's Frog</h2>
              <p className="text-base sm:text-lg font-bold text-text-dark dark:text-dark-text mt-1">{frog.taskTitle}</p>
              <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">Eat it first — don't procrastinate!</p>
            </div>
          </div>
          <div className="flex gap-2 self-end sm:self-auto items-center">
            <button
              onClick={() => clearFrog()}
              className="px-4 py-2 rounded-xl border border-border dark:border-white/[0.08] text-xs font-semibold text-text-muted dark:text-[#6B6B8A] hover:bg-surface dark:hover:bg-white/[0.04] transition-colors"
            >
              Change
            </button>
            <button
              onClick={() => {
                const dayBlocks = timeBlocks.filter((b) => b.date === todayStr);
                const exists = dayBlocks.some(
                  (b) => b.taskId === frog.taskId || b.taskTitle.toLowerCase().includes(frog.taskTitle.toLowerCase())
                );
                if (!exists) {
                  addTimeBlock({
                    date: todayStr,
                    hour: new Date().getHours(),
                    taskTitle: `Focus Session: ${frog.taskTitle}`,
                    color: "#2563EB",
                    taskId: frog.taskId,
                  });
                }
                setTinyMode(true, frog.taskId);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Zap size={12} /> Start Tiny Step
            </button>
            <button
              onClick={() => completeFrog()}
              className="px-5 py-2 rounded-xl bg-success hover:bg-success/90 text-white text-xs font-bold transition-all shadow-sm"
            >
              Done! 🎉
            </button>
          </div>
        </div>

        {/* Suggest Focus Slot to integrate Frog Selection to Time Blocking */}
        {!isScheduled && (
          <div className="p-3.5 rounded-xl bg-warning/5 dark:bg-amber-950/20 border border-warning/15 flex items-center justify-between gap-3 text-xs animate-fade-in">
            <div className="text-text-muted dark:text-dark-text-muted font-medium">
              📅 Calendar slot suggestion: <span className="font-bold text-warning">Today at {suggestedHour === 12 ? "12 PM" : suggestedHour > 12 ? `${suggestedHour - 12} PM` : `${suggestedHour} AM`}</span>
            </div>
            <button
              onClick={handleScheduleFocusSlot}
              className="px-3.5 py-1.5 rounded-lg bg-warning text-white text-[11px] font-bold hover:bg-warning/90 transition-all shadow-sm shrink-0"
            >
              Schedule Slot
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="widget-card border border-dashed border-warning/30 dark:bg-[#13100A] dark:border-amber-500/20 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-3xl sm:text-4xl animate-frog">🐸</span>
          <div>
            <h2 className="text-xs font-bold text-warning uppercase tracking-wider">Eat the Frog</h2>
            <p className="text-xs sm:text-sm text-text-muted dark:text-dark-text-muted mt-0.5">Pick your hardest task. Tackle it first thing.</p>
          </div>
        </div>
        <button
          onClick={() => setPicking(!picking)}
          className="px-4 py-2 rounded-xl bg-warning hover:bg-warning/90 text-white text-xs font-bold transition-all shadow-sm shrink-0"
        >
          {picking ? "Cancel" : "Pick Frog"}
        </button>
      </div>

      {picking && (
        <div className="mt-4 pt-4 border-t border-border dark:border-white/[0.08] space-y-3 animate-slide-up">
          {availableTasks.length === 0 ? (
            <p className="text-xs text-text-muted dark:text-dark-text-muted flex items-center gap-2 py-2">
              <Frown size={14} /> No pending tasks in Q1/Q2. Add some in the Matrix first.
            </p>
          ) : (
            availableTasks.map((t) => {
              const rec = isRecommended(t);
              const reasons = getRecommendationReasoning(t);
              return (
                <div
                  key={t.id}
                  className={`p-3 rounded-xl bg-surface dark:bg-dark-bg transition-all flex flex-col gap-2 border ${
                    rec ? "border-indigo-500/40 bg-indigo-50/5 dark:bg-indigo-950/10" : "border-border dark:border-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${t.quadrant === "q1" ? "bg-danger" : "bg-primary"}`} />
                    <span className="text-xs sm:text-sm font-semibold text-text-dark dark:text-dark-text flex-1 truncate">
                      {t.title}
                    </span>
                    {rec && (
                      <span className="text-[9px] font-extrabold text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/20 px-1.5 py-0.5 rounded uppercase tracking-widest shrink-0">
                        Recommended
                      </span>
                    )}
                    <button
                      onClick={() => handleSelectFrog(t.id, t.title)}
                      className="px-3 py-1.5 bg-warning hover:bg-warning/90 text-white text-[11px] font-bold rounded-lg transition-all"
                    >
                      Pick as Frog
                    </button>
                  </div>
                  {/* Detailed cognitive alignment and reasoning list */}
                  <div className="space-y-1 pl-5 border-l-2 border-border dark:border-white/[0.06]">
                    {reasons.map((r, idx) => (
                      <p key={idx} className="text-[10px] sm:text-xs text-text-muted dark:text-dark-text-muted leading-tight">
                        • {r}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────── AI Focus Recovery Center Component ──────────────── */
interface AIFocusRecoveryProps {
  rescueData: { message: string; suggested_task: string } | null;
  setRescueData: (data: { message: string; suggested_task: string } | null) => void;
  loading: boolean;
  triggerFocusRescue: () => void;
  showCustomInput: boolean;
  setShowCustomInput: (show: boolean) => void;
}

function AIFocusRecovery({
  rescueData,
  setRescueData,
  loading,
  triggerFocusRescue,
  showCustomInput,
  setShowCustomInput
}: AIFocusRecoveryProps) {
  const {
    matrixTasks,
    addMatrixTask,
    setTinyMode,
    tinyModeActive,
    tinyModeTaskId,
    toggleMatrixTask,
    showToast,
    frog,
    timeBlocks,
    addTimeBlock
  } = useAppStore();

  const [customStepText, setCustomStepText] = useState("");
  const activeTinyTask = matrixTasks.find((t) => t.id === tinyModeTaskId);

  const isFallback = !tinyModeTaskId || !matrixTasks.some((t) => t.id === tinyModeTaskId);

  const activeTitle = isFallback
    ? "Take one small step."
    : (activeTinyTask?.title || "Focusing...");

  const activeSubtitle = isFallback
    ? "Open the task you're avoiding most."
    : "Tackle this single item without distraction.";

  const ensureTimeBlockForFocusTask = (taskId: string | null, title: string) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const currentHour = new Date().getHours();
    
    // Check if there is already a block for this taskId or title today
    const exists = timeBlocks.some(
      (b) =>
        b.date === todayStr &&
        (b.taskId === taskId || b.taskTitle.toLowerCase().includes(title.toLowerCase()))
    );

    if (!exists) {
      addTimeBlock({
        date: todayStr,
        hour: currentHour,
        taskTitle: `Focus Session: ${title}`,
        color: "#2563EB", // Blue for focus
        taskId: taskId || undefined,
      });
    }
  };

  // Direct Tiny Mode activation from the dashboard button
  const handleStartTinyModeDirect = () => {
    const pendingFrog = frog && !frog.completed ? matrixTasks.find((t) => t.id === frog.taskId) : null;
    const firstQ1 = matrixTasks.find((t) => t.quadrant === "q1" && !t.done);
    const firstQ2 = matrixTasks.find((t) => t.quadrant === "q2" && !t.done);
    const candidate = pendingFrog || firstQ1 || firstQ2;

    if (candidate) {
      ensureTimeBlockForFocusTask(candidate.id, candidate.title);
      setTinyMode(true, candidate.id);
      showToast(`Entering Tiny Mode for: "${candidate.title}" 🧘`);
    } else {
      setTinyMode(true, null);
      showToast("Entering Tiny Mode with fallback step 🧘");
    }
  };

  // Launch Tiny Mode on recommendation
  const handleStartTiny = (taskTitle: string) => {
    const existing = matrixTasks.find(
      (t) =>
        t.title.toLowerCase().includes(taskTitle.toLowerCase()) ||
        taskTitle.toLowerCase().includes(t.title.toLowerCase())
    );
    if (existing) {
      ensureTimeBlockForFocusTask(existing.id, existing.title);
      setTinyMode(true, existing.id);
      showToast(`Entering Tiny Mode for: "${existing.title}" 🧘`);
    } else {
      addMatrixTask(taskTitle, "q1");
      setTimeout(() => {
        const newlyAdded = useAppStore.getState().matrixTasks.find((t) => t.title === taskTitle);
        if (newlyAdded) {
          ensureTimeBlockForFocusTask(newlyAdded.id, newlyAdded.title);
          setTinyMode(true, newlyAdded.id);
          showToast(`Entering Tiny Mode for: "${taskTitle}" 🧘`);
        }
      }, 50);
    }
    setRescueData(null);
  };

  // Custom step entry
  const handleStartCustomTiny = () => {
    if (!customStepText.trim()) return;
    const title = customStepText.trim();
    addMatrixTask(title, "q1");
    setCustomStepText("");
    setShowCustomInput(false);
    setTimeout(() => {
      const newlyAdded = useAppStore.getState().matrixTasks.find((t) => t.title === title);
      if (newlyAdded) {
        ensureTimeBlockForFocusTask(newlyAdded.id, newlyAdded.title);
        setTinyMode(true, newlyAdded.id);
        showToast(`Entering Tiny Mode for: "${title}" 🧘`);
      }
    }, 50);
  };

  const handleCompleteTiny = () => {
    if (isFallback) {
      setTinyMode(false, null);
      showToast("Exited focus mode. You got this! 🧘");
      return;
    }

    if (!activeTinyTask) return;
    const taskId = activeTinyTask.id;
    toggleMatrixTask(taskId, true); // skip toast
    setTinyMode(false, null);

    showToast(
      `Completed: "${activeTinyTask.title}"! 🎉`,
      () => {
        toggleMatrixTask(taskId, true);
        setTinyMode(true, taskId);
      },
      "Undo"
    );
  };

  return (
    <div className="widget-card border border-indigo-500/20 bg-gradient-to-br from-[#0C0C1E]/30 to-indigo-950/10 dark:shadow-[0_4px_24px_rgba(99,102,241,0.05)] p-5 sm:p-6 rounded-2xl relative overflow-hidden animate-fade-in">
      {/* Background soft glow decoration */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {tinyModeActive ? (
        /* Tiny Mode active view */
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3 border-b border-border dark:border-white/[0.06] pb-3">
            <h3 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <Zap size={13} className="animate-pulse" /> Tiny Mode Active
            </h3>
            <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/15 dark:bg-indigo-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Focusing
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-text-dark dark:text-dark-text leading-snug">
            {activeTitle}
          </h2>
          <p className="text-xs text-text-muted dark:text-[#6B6B8A] mt-2 italic">
            {activeSubtitle}
          </p>

          <div className="flex flex-wrap gap-2.5 mt-4">
            <button
              onClick={handleCompleteTiny}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
            >
              Complete Step & Exit
            </button>
            <button
              onClick={() => setTinyMode(false, null)}
              className="px-4 py-2 border border-border dark:border-white/[0.08] hover:bg-surface dark:hover:bg-white/[0.04] text-xs text-text-muted dark:text-[#6B6B8A] font-semibold rounded-xl transition-colors"
            >
              Exit Tiny Mode
            </button>
          </div>
        </div>
      ) : rescueData ? (
        /* Focus Rescue guidance display view */
        <div className="relative z-10 animate-fade-in">
          <div className="flex items-center justify-between mb-3 border-b border-border dark:border-white/[0.06] pb-3">
            <h3 className="text-xs font-bold text-danger uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={13} /> Focus Rescue Plan
            </h3>
            <button
              onClick={() => setRescueData(null)}
              className="text-[10px] text-text-muted hover:text-text-dark dark:text-[#6B6B8A] dark:hover:text-dark-text font-bold"
            >
              Clear
            </button>
          </div>

          <p className="text-xs sm:text-sm text-text-muted dark:text-dark-text-muted italic leading-relaxed mb-4">
            "{rescueData.message}"
          </p>

          <div className="p-3 bg-danger-light/10 dark:bg-red-950/20 border border-danger/15 rounded-xl mb-4">
            <p className="text-[10px] uppercase text-danger font-extrabold tracking-wider">
              Suggested Next Step
            </p>
            <p className="text-xs sm:text-sm font-bold text-text-dark dark:text-dark-text mt-1">
              {rescueData.suggested_task}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => handleStartTiny(rescueData.suggested_task)}
              className="px-4 py-2 bg-danger hover:bg-danger/90 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Zap size={12} /> Start Tiny Step
            </button>
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="px-4 py-2 border border-border dark:border-white/[0.08] hover:bg-surface dark:hover:bg-white/[0.04] text-xs text-text-muted dark:text-[#6B6B8A] font-semibold rounded-xl transition-colors"
            >
              Do Something Else
            </button>
          </div>
        </div>
      ) : (
        /* Default standby recovery controls - BOTH CTAs ALWAYS VISIBLE */
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={13} className="text-indigo-500" /> AI Focus Recovery
            </h3>
            <p className="text-xs sm:text-sm text-text-muted dark:text-dark-text-muted mt-1.5 leading-relaxed">
              Feeling overwhelmed, anxious, or unable to focus? Trigger Focus Rescue to simplify your tasks or jump directly into a low-distraction single step using Tiny Mode.
            </p>
            {/* Enter Custom Tiny Step Toggle Link */}
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-[11px] font-semibold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline mt-2 block"
            >
              Or enter custom focus step...
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0 self-start md:self-center w-full md:w-auto">
            <button
              onClick={triggerFocusRescue}
              disabled={loading}
              className="px-4 py-2.5 bg-danger hover:bg-danger/90 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              Focus Rescue
            </button>
            <button
              onClick={handleStartTinyModeDirect}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Zap size={13} /> Start Tiny Mode
            </button>
          </div>
        </div>
      )}

      {/* Slide-out Custom Step Input for Tiny Mode */}
      {showCustomInput && !tinyModeActive && (
        <div className="mt-4 pt-4 border-t border-border dark:border-white/[0.06] animate-slide-up relative z-10">
          <label className="text-[10px] uppercase text-text-muted dark:text-[#6B6B8A] font-extrabold tracking-wider block mb-2">
            Enter the exact step to focus on:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customStepText}
              onChange={(e) => setCustomStepText(e.target.value)}
              placeholder="e.g. Write intro paragraph for essay..."
              onKeyDown={(e) => e.key === "Enter" && handleStartCustomTiny()}
              className="flex-1 bg-surface dark:bg-dark-bg border border-border dark:border-white/[0.08] rounded-xl px-4 py-2 text-xs text-text-dark dark:text-dark-text focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              onClick={handleStartCustomTiny}
              disabled={!customStepText.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Go
            </button>
            <button
              onClick={() => {
                setShowCustomInput(false);
                setCustomStepText("");
              }}
              className="px-3 py-2 border border-border dark:border-white/[0.08] hover:bg-surface dark:hover:bg-white/[0.04] text-xs font-semibold rounded-xl text-text-muted dark:text-[#6B6B8A]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────── Dashboard Page ──────────────── */
export default function Dashboard() {
  const router = useRouter();

  const {
    habits,
    matrixTasks,
    pomodoroSessions,
    settings,
    token,
    isGuestMode,
    user,
    dailyReflection,
    setDailyReflection,
    addMatrixTask,
    setTinyMode,
    tinyModeActive,
    tinyModeTaskId,
    toggleMatrixTask,
    showToast,
    cognitiveContext
  } = useAppStore();

  const [rescueData, setRescueData] = useState<{ message: string; suggested_task: string } | null>(null);
  const [loadingRescue, setLoadingRescue] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Tiny Mode rotation support states
  const [tinyStepData, setTinyStepData] = useState<{ celebration: string; tiny_step: string } | null>(null);
  const [loadingNext, setLoadingNext] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayDoneHabits = habits.filter((h) => h.completedDates.includes(todayStr)).length;
  const habitPct = habits.length > 0 ? Math.round((todayDoneHabits / habits.length) * 100) : 0;
  const todayPomodoros = pomodoroSessions.filter(
    (s) => s.completedAt.slice(0, 10) === todayStr && s.type === "work"
  );
  const totalFocusMin = Math.round(todayPomodoros.reduce((a, s) => a + s.duration, 0) / 60);
  const q1Tasks = matrixTasks.filter((t) => t.quadrant === "q1" && !t.done);
  const totalDoneTasks = matrixTasks.filter((t) => t.done).length;

  useEffect(() => {
    if (!token && !isGuestMode) {
      router.push("/login");
    }
  }, [token, isGuestMode, router]);

  const fetchReflection = async () => {
    try {
      const completedHabitNames = habits
        .filter((h) => h.completedDates.includes(todayStr))
        .map((h) => h.name);

      const completedTaskNames = matrixTasks.filter((t) => t.done).map((t) => t.title);

      const workSessionMin = Math.round(
        pomodoroSessions
          .filter((s) => s.completedAt.slice(0, 10) === todayStr && s.type === "work")
          .reduce((a, s) => a + s.duration, 0) / 60
      );

      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/api/daily-reflection`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          habits: completedHabitNames,
          tasks: completedTaskNames,
          focus_time_min: workSessionMin
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDailyReflection(data.reflection);
      }
    } catch (err) {
      console.error("Error loading daily reflection:", err);
    }
  };

  useEffect(() => {
    if (token || isGuestMode) {
      fetchReflection();
    }
  }, [token, isGuestMode]);

  const triggerFocusRescue = async () => {
    setLoadingRescue(true);
    try {
      const q1Titles = q1Tasks.map((t) => t.title);
      let success = false;

      if (q1Titles.length > 0) {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/api/focus-rescue`, {
          method: "POST",
          headers,
          body: JSON.stringify({ q1_tasks: q1Titles })
        });
        
        if (res.ok) {
          const data = await res.json();
          setRescueData(data);
          success = true;
        }
      }

      // Safe local fallback: runs if backend fails OR there are no pending tasks
      if (!success) {
        let suggested = "Define your very next action";
        if (q1Titles.length > 0) {
          suggested = q1Titles[0];
        } else {
          const q2Tasks = matrixTasks.filter((t) => t.quadrant === "q2" && !t.done);
          if (q2Tasks.length > 0) {
            suggested = q2Tasks[0].title;
          }
        }

        setRescueData({
          message: "Take a deep breath. When everything feels urgent, doing anything is better than doing nothing.",
          suggested_task: suggested
        });
      }
    } catch (e) {
      console.error("Error triggering Focus Rescue:", e);
      setRescueData({
        message: "Take a deep breath. Let's simplify your day and focus on one single task.",
        suggested_task: "Identify your next tiny step"
      });
    } finally {
      setLoadingRescue(false);
    }
  };

  const handleRescueStartTiny = () => {
    if (!rescueData) return;
    const taskTitle = rescueData.suggested_task;
    const existing = matrixTasks.find(
      (t) =>
        t.title.toLowerCase().includes(taskTitle.toLowerCase()) ||
        taskTitle.toLowerCase().includes(t.title.toLowerCase())
    );
    if (existing) {
      setTinyMode(true, existing.id);
    } else {
      addMatrixTask(taskTitle, "q1");
      setTimeout(() => {
        const newlyAdded = useAppStore.getState().matrixTasks.find((t) => t.title === taskTitle);
        if (newlyAdded) {
          setTinyMode(true, newlyAdded.id);
        }
      }, 50);
    }
    setRescueData(null);
  };

  function getMaxStreak(): number {
    let best = 0;
    for (const h of habits) {
      if (h.completedDates.length === 0) continue;
      const sorted = [...h.completedDates].sort().reverse();
      let streak = 0;
      const td = new Date();
      td.setHours(0, 0, 0, 0);
      for (let i = 0; i < 365; i++) {
        const d = new Date(td);
        d.setDate(d.getDate() - i);
        if (sorted.includes(d.toISOString().slice(0, 10))) streak++;
        else if (i === 0) continue;
        else break;
      }
      if (streak > best) best = streak;
    }
    return best;
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
  const displayUserName = user ? user.name : settings.userName;

  if (tinyModeActive) {
    const tinyTask = matrixTasks.find((t) => t.id === tinyModeTaskId);
    const isFallback = !tinyModeTaskId || !tinyTask;
    const taskTitle = isFallback ? "Take one small action" : tinyTask.title;

    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 sm:px-6 py-12 animate-fade-in relative overflow-hidden">
        {/* Breathing Animation Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full animate-pulse blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg w-full text-center space-y-8 widget-card p-8 sm:p-10 border border-indigo-500/20 bg-gradient-to-br from-surface to-surface/90 dark:from-[#0C0C1E]/50 dark:to-indigo-950/10 shadow-[0_8px_32px_rgba(99,102,241,0.06)] rounded-3xl">
          {/* Calming Breathing Ring */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 flex items-center justify-center animate-spin" style={{ animationDuration: '6s' }}>
              <Zap size={32} className="text-indigo-500 animate-pulse" />
            </div>
            {tinyStepData ? (
              <p className="text-xs text-success font-semibold tracking-wider uppercase animate-pulse">
                {tinyStepData.celebration}
              </p>
            ) : (
              <p className="text-xs text-indigo-400 font-semibold tracking-widest uppercase mt-4 animate-pulse">
                Breathe In... Breathe Out...
              </p>
            )}
          </div>

          {/* Single Task Focus */}
          <div className="space-y-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#6B6B8A]">
              {tinyStepData ? "Next Tiny Step" : "One Single Action"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-dark dark:text-dark-text leading-tight tracking-tight">
              {taskTitle}
            </h1>
            {tinyStepData && (
              <div className="mt-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 max-w-md mx-auto">
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                  Tiny Low-Pressure Step
                </span>
                <p className="text-sm font-semibold text-indigo-200">{tinyStepData.tiny_step}</p>
              </div>
            )}
          </div>

          {/* Calming atmosphere description */}
          <p className="text-xs text-text-muted dark:text-dark-text-muted max-w-sm mx-auto leading-relaxed">
            Focus only on this single action. Everything else can wait. Take your time, there is no rush.
          </p>

          {/* Calming buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={async () => {
                if (isFallback) {
                  setTinyMode(false, null);
                  setTinyStepData(null);
                  return;
                }
                setLoadingNext(true);
                try {
                  const taskId = tinyTask.id;
                  toggleMatrixTask(taskId, true); // Mark current task as done

                  // Find remaining pending tasks
                  const remaining = matrixTasks.filter((t) => !t.done && t.id !== taskId);
                  if (remaining.length === 0) {
                    setTinyMode(false, null);
                    setTinyStepData(null);
                    showToast("All tasks complete! You're amazing! 🎉");
                    return;
                  }

                  // Get next task and step from backend
                  const headers: Record<string, string> = { "Content-Type": "application/json" };
                  if (token) headers["Authorization"] = `Bearer ${token}`;

                  const res = await fetch(`${API_URL}/api/tiny-mode/next`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                      completed_task_title: tinyTask.title,
                      remaining_tasks: remaining.map((t) => ({ id: t.id, title: t.title, quadrant: t.quadrant }))
                    })
                  });

                  if (res.ok) {
                    const data = await res.json();
                    if (data.next_task_id) {
                      setTinyMode(true, data.next_task_id);
                      setTinyStepData({
                        celebration: data.celebration,
                        tiny_step: data.tiny_step
                      });
                    } else {
                      setTinyMode(false, null);
                      setTinyStepData(null);
                    }
                  } else {
                    const nextTask = remaining[0];
                    setTinyMode(true, nextTask.id);
                    setTinyStepData({
                      celebration: "Excellent step, well done!",
                      tiny_step: "Start the next step calmly."
                    });
                  }
                } catch (err) {
                  const remaining = matrixTasks.filter((t) => !t.done && t.id !== tinyTask.id);
                  if (remaining.length > 0) {
                    const nextTask = remaining[0];
                    setTinyMode(true, nextTask.id);
                    setTinyStepData({
                      celebration: "Excellent step, well done!",
                      tiny_step: "Start the next step calmly."
                    });
                  } else {
                    setTinyMode(false, null);
                    setTinyStepData(null);
                  }
                } finally {
                  setLoadingNext(false);
                }
              }}
              disabled={loadingNext}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-success hover:bg-success/90 text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loadingNext ? <Loader2 size={16} className="animate-spin" /> : "Complete & Next Step ⚡"}
            </button>
            <button
              onClick={() => {
                if (!isFallback && tinyTask) {
                  toggleMatrixTask(tinyTask.id, false);
                }
                setTinyMode(false, null);
                setTinyStepData(null);
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center"
            >
              Complete & Exit Focus
            </button>
            <button
              onClick={() => {
                setTinyMode(false, null);
                setTinyStepData(null);
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-border dark:border-white/[0.08] hover:bg-surface dark:hover:bg-white/[0.04] text-text-muted dark:text-dark-text-muted font-semibold text-sm transition-all"
            >
              Leave Tiny Mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 animate-fade-in space-y-6">
      {/* Header Panel */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border dark:border-white/[0.08] pb-4 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-dark dark:text-dark-text tracking-tight">
            Good {greeting}, {displayUserName.split(" ")[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-text-muted dark:text-dark-text-muted mt-1">
            {q1Tasks.length > 0
              ? `You have ${q1Tasks.length} urgent task${q1Tasks.length > 1 ? "s" : ""} today.`
              : "All clear! Great job staying on top of things."}
          </p>
        </div>
        <span className="text-xs text-text-muted dark:text-dark-text-muted self-start md:self-end">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </span>
      </header>

      {/* Cognitive Context Bar */}
      {cognitiveContext && (
        <div className="flex flex-wrap gap-2 p-3 bg-surface/50 dark:bg-dark-bg/30 border border-border dark:border-white/[0.04] rounded-xl text-xs">
          <span className="text-text-muted dark:text-[#6B6B8A] font-semibold self-center">Cognitive State:</span>
          {cognitiveContext.current_pressure && (
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                cognitiveContext.current_pressure === "high"
                  ? "bg-danger-light text-danger dark:bg-red-950/30 dark:text-red-400"
                  : cognitiveContext.current_pressure === "medium"
                  ? "bg-warning-light text-warning dark:bg-amber-950/30 dark:text-amber-400"
                  : "bg-success-light text-success dark:bg-emerald-950/30 dark:text-emerald-400"
              }`}
            >
              {cognitiveContext.current_pressure} Pressure
            </span>
          )}
          {cognitiveContext.active_focus?.map((f: string, idx: number) => (
            <span
              key={`f-${idx}`}
              className="px-2.5 py-0.5 rounded-full bg-primary-light text-primary dark:bg-indigo-950/30 dark:text-indigo-400 font-medium"
            >
              🎯 {f}
            </span>
          ))}
          {cognitiveContext.active_stressors?.map((s: string, idx: number) => (
            <span
              key={`s-${idx}`}
              className="px-2.5 py-0.5 rounded-full bg-danger-light text-danger dark:bg-red-950/30 dark:text-red-400 font-medium"
            >
              ⚡ {s}
            </span>
          ))}
        </div>
      )}

      {/* AI Focus Recovery Center (Always Visible fallback component) */}
      <AIFocusRecovery
        rescueData={rescueData}
        setRescueData={setRescueData}
        loading={loadingRescue}
        triggerFocusRescue={triggerFocusRescue}
        showCustomInput={showCustomInput}
        setShowCustomInput={setShowCustomInput}
      />

      {/* AI Daily Reflection */}
      {dailyReflection && (
        <div className="widget-card bg-gradient-to-r from-primary/5 to-indigo-500/5 border border-indigo-500/10 shadow-sm p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="text-indigo-500 shrink-0 mt-0.5 animate-pulse" size={16} />
            <div>
              <p className="text-[10px] sm:text-xs uppercase text-indigo-500 dark:text-indigo-400 font-extrabold tracking-wider">
                AI Focus Insight
              </p>
              <p className="text-xs sm:text-sm text-text-dark dark:text-dark-text mt-1.5 italic font-medium leading-relaxed">
                "{dailyReflection}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Eat The Frog Widget */}
      <EatTheFrog />

      {/* Stats Cards Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            icon: Brain,
            color: "text-primary",
            bg: "bg-primary-light dark:bg-dark-primary-light",
            val: todayPomodoros.length,
            label: "Pomodoros Today"
          },
          {
            icon: CheckCircle2,
            color: "text-success",
            bg: "bg-success-light dark:bg-dark-success-light",
            val: `${habitPct}%`,
            label: "Habits Done"
          },
          {
            icon: Flame,
            color: "text-warning",
            bg: "bg-warning-light dark:bg-dark-warning-light",
            val: getMaxStreak(),
            label: "Best Streak"
          },
          {
            icon: Target,
            color: "text-danger",
            bg: "bg-danger-light dark:bg-dark-danger-light",
            val: totalDoneTasks,
            label: "Tasks Completed"
          }
        ].map((s, i) => (
          <div key={i} className="widget-card flex items-center gap-3 sm:gap-4 p-3 sm:p-5">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-text-dark dark:text-dark-text">{s.val}</p>
              <p className="text-[10px] sm:text-xs text-text-muted dark:text-dark-text-muted leading-tight truncate">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Priority Tasks + Focus Timer */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Priority Tasks list */}
        <div className="lg:col-span-2 widget-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs sm:text-sm font-bold text-text-dark dark:text-dark-text uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={15} className="text-danger" /> Priority Tasks
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={triggerFocusRescue}
                  disabled={loadingRescue}
                  className="text-xs font-semibold text-danger hover:text-danger-hover flex items-center gap-1 transition-colors mr-2 border border-danger/20 px-2.5 py-1 rounded-lg bg-danger-light/10 disabled:opacity-50"
                >
                  {loadingRescue ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  Focus Rescue
                </button>
                <Link
                  href="/matrix"
                  className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
                >
                  Matrix <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            {q1Tasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 size={32} className="mx-auto text-success mb-2" />
                <p className="text-sm text-text-muted dark:text-dark-text-muted font-medium">No urgent tasks! 🎉</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {q1Tasks.slice(0, 5).map((task) => (
                  <li key={task.id} className="flex items-center justify-between p-3 bg-surface dark:bg-dark-bg rounded-xl gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-danger shrink-0 animate-pulse" />
                      <span className="text-xs sm:text-sm font-medium text-text-dark dark:text-dark-text truncate">
                        {task.title}
                      </span>
                    </div>
                    <button
                      onClick={() => setTinyMode(true, task.id)}
                      className="text-[10px] font-bold text-primary dark:text-indigo-400 border border-primary/20 hover:bg-primary/5 px-2 py-0.5 rounded transition-colors shrink-0"
                    >
                      Tiny Step
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Focus Timer panel */}
        <div className="widget-card flex flex-col items-center justify-center text-center py-6 sm:py-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-light dark:bg-dark-primary-light flex items-center justify-center mb-3 sm:mb-4">
            <Clock size={28} className="text-primary animate-pulse" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-text-dark dark:text-dark-text mb-1">Focus Timer</h3>
          <p className="text-xs text-text-muted dark:text-dark-text-muted mb-4">
            {totalFocusMin > 0 ? `${totalFocusMin} min focused today` : "Start your first session"}
          </p>
          <Link
            href="/pomodoro"
            className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Zap size={14} /> Start Pomodoro
          </Link>
        </div>
      </section>

      {/* Today's Habits Section */}
      <section className="widget-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs sm:text-sm font-bold text-text-dark dark:text-dark-text uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 size={15} className="text-success" /> Today's Habits
          </h2>
          <Link
            href="/habits"
            className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight size={12} />
          </Link>
        </div>
        <div className="w-full h-2 bg-surface dark:bg-dark-bg rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-700"
            style={{ width: `${habitPct}%` }}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {habits.slice(0, 6).map((h) => {
            const done = h.completedDates.includes(todayStr);
            return (
              <div
                key={h.id}
                className={`p-2.5 sm:p-3 rounded-xl text-center border transition-all ${
                  done
                    ? "bg-success-light dark:bg-dark-success-light/40 border-success/20 text-success"
                    : "bg-surface dark:bg-dark-bg/60 border-transparent text-text-dark dark:text-dark-text"
                }`}
              >
                <p className="text-[10px] sm:text-xs font-bold truncate leading-tight">{h.name}</p>
                <span className="text-base sm:text-lg mt-1 block leading-none">{done ? "✅" : "⬜"}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}