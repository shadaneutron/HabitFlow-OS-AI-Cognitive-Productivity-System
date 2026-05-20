"use client";

import { useState } from "react";
import { CalendarClock, ChevronLeft, ChevronRight, Plus, X, Trash2 } from "lucide-react";
import { useAppStore } from "../store";

const HOURS = Array.from({ length: 19 }, (_, i) => i + 6); // 06–24
const BLOCK_COLORS = [
  { label: "Focus",   value: "#2563EB" },
  { label: "Urgent",  value: "#EF4444" },
  { label: "Meeting", value: "#8B5CF6" },
  { label: "Break",   value: "#10B981" },
  { label: "Study",   value: "#F59E0B" },
];

function fmtHour(h: number) {
  if (h === 0 || h === 24) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

export default function TimeBlockPage() {
  const { timeBlocks, addTimeBlock, removeTimeBlock, matrixTasks } = useAppStore();
  const [dateOffset, setDateOffset] = useState(0);
  const [modal, setModal] = useState<{ hour: number } | null>(null);
  const [blockTitle, setBlockTitle] = useState("");
  const [blockColor, setBlockColor] = useState(BLOCK_COLORS[0].value);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const base = new Date(); base.setDate(base.getDate() + dateOffset);
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, "0");
  const day = String(base.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;
  const dayLabel = base.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const dayLabelFull = base.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const isToday = dateOffset === 0;
  const currentHour = new Date().getHours();
  const dayBlocks = timeBlocks.filter((b) => b.date === dateStr);
  const undoneTasks = matrixTasks.filter((t) => !t.done);

  const handleAdd = () => {
    if (!blockTitle.trim() || !modal) return;
    addTimeBlock({
      date: dateStr,
      hour: modal.hour,
      taskTitle: blockTitle.trim(),
      color: blockColor,
      taskId: selectedTaskId || undefined
    });
    setBlockTitle("");
    setSelectedTaskId(null);
    setModal(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 animate-fade-in">
      <header className="mb-6 sm:mb-8 border-b border-border dark:border-white/[0.06] pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-dark dark:text-dark-text tracking-tight flex items-center gap-3"><CalendarClock size={24} className="text-primary" /> Time Blocking</h1>
        <p className="text-xs sm:text-sm text-text-muted dark:text-dark-text-muted mt-1">Plan your day hour by hour.</p>
      </header>

      {/* Date Nav */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <button onClick={() => setDateOffset((d) => d - 1)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface dark:bg-dark-surface hover:bg-surface-hover dark:hover:bg-dark-surface-hover flex items-center justify-center text-text-muted transition-colors"><ChevronLeft size={18} /></button>
        <div className="text-center">
          <h2 className="text-sm sm:text-base font-bold text-text-dark dark:text-dark-text hidden sm:block">{dayLabelFull}</h2>
          <h2 className="text-sm font-bold text-text-dark dark:text-dark-text sm:hidden">{dayLabel}</h2>
          {isToday && <span className="text-xs font-semibold text-primary">Today</span>}
        </div>
        <button onClick={() => setDateOffset((d) => d + 1)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface dark:bg-dark-surface hover:bg-surface-hover dark:hover:bg-dark-surface-hover flex items-center justify-center text-text-muted transition-colors"><ChevronRight size={18} /></button>
      </div>

      {/* Time Grid */}
      <div className="widget-card p-0 overflow-hidden">
        {HOURS.map((hour) => {
          const block = dayBlocks.find((b) => b.hour === hour);
          const isPast = isToday && hour < currentHour;
          const isCurrent = isToday && hour === currentHour;
          return (
            <div key={hour} className={`flex border-b border-border dark:border-white/[0.05] last:border-b-0 transition-colors ${isPast ? "opacity-40" : ""} ${isCurrent ? "bg-primary-light/20 dark:bg-dark-primary-light" : ""}`}>
              <div className="w-16 sm:w-24 shrink-0 py-3 sm:py-4 px-2 sm:px-4 text-[10px] sm:text-xs font-semibold text-text-muted dark:text-dark-text-muted border-r border-border dark:border-white/[0.05] flex items-center gap-1.5">
                {fmtHour(hour)}
                {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />}
              </div>
              <div className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 min-h-[48px] sm:min-h-[56px] flex items-center group">
                {block ? (() => {
                  const isCompleted = block.taskId
                    ? matrixTasks.find((t) => t.id === block.taskId)?.done
                    : matrixTasks.find((t) => t.title.toLowerCase() === block.taskTitle.toLowerCase() || block.taskTitle.toLowerCase().includes(t.title.toLowerCase()))?.done;
                  return (
                    <div className={`flex items-center gap-2 sm:gap-3 w-full animate-slide-right p-1 rounded-lg ${isCompleted ? "bg-success/5 dark:bg-emerald-950/10" : ""}`}>
                      <div className="w-1 sm:w-1.5 h-7 sm:h-8 rounded-full shrink-0" style={{ backgroundColor: isCompleted ? "#10B981" : block.color }} />
                      <span className={`text-xs sm:text-sm font-medium flex-1 truncate ${isCompleted ? "line-through text-success/80 dark:text-emerald-400/80" : "text-text-dark dark:text-dark-text"}`}>
                        {block.taskTitle} {isCompleted && "✓"}
                      </span>
                      <button onClick={() => removeTimeBlock(block.id)} className="opacity-0 group-hover:opacity-100 w-6 h-6 sm:w-7 sm:h-7 rounded-lg hover:bg-danger-light text-text-light hover:text-danger flex items-center justify-center transition-all shrink-0"><Trash2 size={12} /></button>
                    </div>
                  );
                })() : (
                  <button onClick={() => { setModal({ hour }); setBlockTitle(""); setBlockColor(BLOCK_COLORS[0].value); }} className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs font-medium text-text-light dark:text-dark-text-light hover:text-primary transition-all">
                    <Plus size={13} /> Add block
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 animate-fade-in" onClick={() => setModal(null)}>
          <div className="bg-white dark:bg-[#1A1A26] border border-border dark:border-white/[0.08] rounded-2xl shadow-xl p-5 sm:p-8 w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base sm:text-lg font-bold text-text-dark dark:text-dark-text">Block {fmtHour(modal.hour)}</h3>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-lg hover:bg-surface dark:hover:bg-white/[0.06] flex items-center justify-center text-text-muted"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-muted dark:text-dark-text-muted mb-1.5 block">Task / Activity</label>
                <input value={blockTitle} onChange={(e) => { setBlockTitle(e.target.value); setSelectedTaskId(null); }} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="e.g. Deep work on project" autoFocus className="w-full bg-surface dark:bg-dark-bg border border-border dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-sm font-medium text-text-dark dark:text-dark-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
              </div>
              {undoneTasks.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-text-muted dark:text-dark-text-muted mb-1.5 block">Pick from Matrix</label>
                  <div className="max-h-28 overflow-y-auto space-y-1">
                    {undoneTasks.slice(0, 6).map((t) => (
                      <button key={t.id} onClick={() => { setBlockTitle(t.title); setSelectedTaskId(t.id); }} className={`w-full text-left p-2 rounded-lg text-xs font-medium transition-colors ${blockTitle === t.title ? "bg-primary-light dark:bg-dark-primary-light text-primary" : "bg-surface dark:bg-dark-bg text-text-dark dark:text-dark-text hover:bg-surface-hover dark:hover:bg-dark-surface-hover"}`}>{t.title}</button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-text-muted dark:text-dark-text-muted mb-1.5 block">Color</label>
                <div className="flex flex-wrap gap-2">
                  {BLOCK_COLORS.map((c) => (
                    <button key={c.value} onClick={() => setBlockColor(c.value)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${blockColor === c.value ? "border-primary" : "border-transparent bg-surface dark:bg-dark-bg"}`}>
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.value }} />{c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 mt-5 sm:mt-6">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 sm:py-3 rounded-xl border border-border dark:border-white/[0.08] text-xs sm:text-sm font-semibold text-text-muted hover:bg-surface transition-colors">Cancel</button>
              <button onClick={handleAdd} className="flex-1 py-2.5 sm:py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold transition-all">Add Block</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
