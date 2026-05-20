"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, RotateCcw, SkipForward, Coffee, Brain, Zap } from "lucide-react";
import { useAppStore } from "../store";

type SessionType = "work" | "short-break" | "long-break";

const SESSION_COLORS: Record<SessionType, { ring: string; text: string; label: string }> = {
  work:          { ring: "#2563EB", text: "text-primary",  label: "Focus Time"  },
  "short-break": { ring: "#10B981", text: "text-success",  label: "Short Break" },
  "long-break":  { ring: "#F59E0B", text: "text-warning",  label: "Long Break"  },
};

export default function PomodoroPage() {
  const { settings, pomodoroSessions, addPomodoroSession } = useAppStore();
  const durations: Record<SessionType, number> = {
    work: settings.workDuration * 60,
    "short-break": settings.shortBreak * 60,
    "long-break": settings.longBreak * 60,
  };

  const [sessionType, setSessionType] = useState<SessionType>("work");
  const [timeLeft, setTimeLeft] = useState(durations.work);
  const [running, setRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [taskLabel, setTaskLabel] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const theme = useAppStore((s) => s.settings.theme);

  const totalTime = durations[sessionType];
  const progress = (totalTime - timeLeft) / totalTime;
  const cfg = SESSION_COLORS[sessionType];
  const ringBg = theme === "dark" ? "#1E1E2A" : "#E2E8F0";

  useEffect(() => { if (!running) setTimeLeft(durations[sessionType]); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [settings.workDuration, settings.shortBreak, settings.longBreak]);

  const stopInterval = useCallback(() => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } }, []);

  const handleSessionEnd = useCallback(() => {
    stopInterval(); setRunning(false);
    addPomodoroSession({ label: taskLabel || (sessionType === "work" ? "Focus session" : "Break"), duration: totalTime, completedAt: new Date().toISOString(), type: sessionType });
    if (sessionType === "work") {
      const next = pomodoroCount + 1; setPomodoroCount(next);
      if (next % 4 === 0) { setSessionType("long-break"); setTimeLeft(durations["long-break"]); }
      else { setSessionType("short-break"); setTimeLeft(durations["short-break"]); }
    } else { setSessionType("work"); setTimeLeft(durations.work); }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [sessionType, pomodoroCount, taskLabel, totalTime]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => { setTimeLeft((p) => { if (p <= 1) { handleSessionEnd(); return 0; } return p - 1; }); }, 1000);
    return () => stopInterval();
  }, [running, handleSessionEnd, stopInterval]);

  const toggleRun = () => setRunning((r) => !r);
  const reset = () => { stopInterval(); setRunning(false); setTimeLeft(durations[sessionType]); };
  const skip = () => handleSessionEnd();
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const R = 100, C = 2 * Math.PI * R, offset = C * (1 - progress);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySessions = pomodoroSessions.filter((s) => s.completedAt.slice(0, 10) === todayStr && s.type === "work");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 animate-fade-in">
      <header className="mb-6 sm:mb-10 border-b border-border dark:border-white/[0.06] pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-dark dark:text-dark-text tracking-tight flex items-center gap-3"><Brain size={24} className="text-primary" /> Pomodoro Timer</h1>
        <p className="text-xs sm:text-sm text-text-muted dark:text-dark-text-muted mt-1">Focus deeply, rest strategically.</p>
      </header>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Timer */}
        <div className="lg:col-span-2 flex flex-col items-center">
          {/* Session Tabs */}
          <div className="flex gap-1.5 sm:gap-2 mb-6 sm:mb-8 bg-surface dark:bg-dark-surface rounded-xl p-1.5 w-full sm:w-auto">
            {(["work", "short-break", "long-break"] as SessionType[]).map((t) => (
              <button key={t} onClick={() => { if (!running) { setSessionType(t); setTimeLeft(durations[t]); } }} className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${sessionType === t ? `bg-white dark:bg-dark-bg shadow-sm ${SESSION_COLORS[t].text}` : "text-text-muted dark:text-dark-text-muted hover:text-text-dark dark:hover:text-dark-text"}`}>
                {t === "work" ? "Focus" : t === "short-break" ? "Short" : "Long"}
              </button>
            ))}
          </div>

          {/* Circular Timer */}
          <div className="relative w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] mb-6 sm:mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
              <circle cx="120" cy="120" r={R} fill="none" stroke={ringBg} strokeWidth="8" />
              <circle cx="120" cy="120" r={R} fill="none" stroke={cfg.ring} strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.5s ease" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-dark-text-muted mb-1">{cfg.label}</span>
              <span className="text-5xl sm:text-6xl font-bold text-text-dark dark:text-dark-text font-mono tracking-tight">{mm}:{ss}</span>
              {sessionType === "work" && <span className="text-xs text-text-muted dark:text-dark-text-muted mt-1">Session #{pomodoroCount + 1}</span>}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <button onClick={reset} className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-surface dark:bg-dark-surface hover:bg-surface-hover dark:hover:bg-dark-surface-hover flex items-center justify-center text-text-muted transition-colors"><RotateCcw size={18} /></button>
            <button onClick={toggleRun} className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-105 active:scale-95 ${running ? "bg-danger hover:bg-danger/90" : "bg-primary hover:bg-primary-hover"} ${!running && timeLeft > 0 ? "animate-pulse-glow" : ""}`}>
              {running ? <Pause size={22} /> : <Play size={22} className="ml-1" />}
            </button>
            <button onClick={skip} className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-surface dark:bg-dark-surface hover:bg-surface-hover dark:hover:bg-dark-surface-hover flex items-center justify-center text-text-muted transition-colors"><SkipForward size={18} /></button>
          </div>

          {/* Task label */}
          <div className="w-full max-w-xs sm:max-w-md">
            <input value={taskLabel} onChange={(e) => setTaskLabel(e.target.value)} placeholder="What are you focusing on?" className="w-full bg-surface dark:bg-dark-surface border border-border dark:border-white/[0.08] rounded-xl px-4 py-2.5 sm:py-3 text-sm font-medium text-text-dark dark:text-dark-text text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-text-light dark:placeholder:text-dark-text-light" />
          </div>

          {/* Dots */}
          <div className="flex items-center gap-2 sm:gap-3 mt-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}><div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all ${i < pomodoroCount % 4 ? "bg-primary scale-110 shadow-md" : "bg-border dark:bg-dark-border"}`} /></div>
            ))}
            {pomodoroCount >= 4 && (
              <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-warning-light dark:bg-dark-warning-light rounded-full"><Coffee size={12} className="text-warning" /><span className="text-xs font-bold text-warning">×{Math.floor(pomodoroCount / 4)}</span></div>
            )}
          </div>
        </div>

        {/* History */}
        <div className="widget-card">
          <h2 className="text-xs sm:text-sm font-bold text-text-dark dark:text-dark-text uppercase tracking-wider mb-4 flex items-center gap-2"><Zap size={14} className="text-warning" /> Today&apos;s Sessions</h2>
          {todaySessions.length === 0 ? (
            <div className="text-center py-8 sm:py-12"><Coffee size={32} className="mx-auto text-text-light dark:text-dark-text-light mb-3" /><p className="text-sm text-text-muted dark:text-dark-text-muted">No sessions yet today.</p></div>
          ) : (
            <ul className="space-y-2.5 max-h-[280px] sm:max-h-[380px] overflow-y-auto">
              {todaySessions.slice().reverse().map((s) => (
                <li key={s.id} className="flex items-center gap-3 p-2.5 sm:p-3 bg-surface dark:bg-dark-bg rounded-lg">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary-light dark:bg-dark-primary-light flex items-center justify-center shrink-0"><Brain size={12} className="text-primary" /></div>
                  <div className="flex-1 min-w-0"><p className="text-xs sm:text-sm font-medium text-text-dark dark:text-dark-text truncate">{s.label}</p><p className="text-xs text-text-muted dark:text-dark-text-muted">{new Date(s.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {Math.round(s.duration / 60)} min</p></div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 pt-4 border-t border-border dark:border-white/[0.06]">
            <div className="flex justify-between text-xs sm:text-sm"><span className="text-text-muted dark:text-dark-text-muted">Total Focus</span><span className="font-bold text-text-dark dark:text-dark-text">{Math.round(todaySessions.reduce((a, s) => a + s.duration, 0) / 60)} min</span></div>
            <div className="flex justify-between text-xs sm:text-sm mt-1"><span className="text-text-muted dark:text-dark-text-muted">Sessions</span><span className="font-bold text-text-dark dark:text-dark-text">{todaySessions.length}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
