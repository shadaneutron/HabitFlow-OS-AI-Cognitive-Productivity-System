"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Check, ArrowRight, Target, Calendar, AlertTriangle, X, Sparkles, Loader2, Brain, Zap } from "lucide-react";
import { useAppStore, Quadrant } from "../store";
import { API_URL } from "@/lib/api";


const QUADRANTS: { key: Quadrant; label: string; subtitle: string; color: string; bg: string; icon: React.ReactNode }[] = [
  { key: "q1", label: "Do First",  subtitle: "Urgent & Important",         color: "text-q1", bg: "bg-danger-light dark:bg-dark-danger-light",   icon: <AlertTriangle size={16} /> },
  { key: "q2", label: "Schedule",  subtitle: "Not Urgent & Important",     color: "text-q2", bg: "bg-primary-light dark:bg-dark-primary-light", icon: <Calendar size={16} /> },
  { key: "q3", label: "Delegate",  subtitle: "Urgent & Not Important",     color: "text-q3", bg: "bg-warning-light dark:bg-dark-warning-light", icon: <ArrowRight size={16} /> },
  { key: "q4", label: "Eliminate", subtitle: "Not Urgent & Not Important", color: "text-q4", bg: "bg-surface dark:bg-dark-surface",             icon: <X size={16} /> },
];

export default function MatrixPage() {
  const router = useRouter();
  const { matrixTasks, addMatrixTask, toggleMatrixTask, deleteMatrixTask, token, setTinyMode } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newQuadrant, setNewQuadrant] = useState<Quadrant>("q1");

  // AI Breakdown states
  const [breakingTask, setBreakingTask] = useState<string | null>(null);
  const [breakdownSteps, setBreakdownSteps] = useState<string[]>([]);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);

  // AI Priority Recommendation state
  const [recommendation, setRecommendation] = useState<{ task_id: string | null; reason: string } | null>(null);

  useEffect(() => {
    const fetchRec = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${API_URL}/api/matrix/recommendations`, { headers });
        if (res.ok) {
          const data = await res.json();
          setRecommendation(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchRec();
  }, [token, matrixTasks]);

  const handleAdd = () => { if (!newTitle.trim()) return; addMatrixTask(newTitle.trim(), newQuadrant); setNewTitle(""); setShowModal(false); };
  
  const handleBreakdown = async (title: string) => {
    setBreakingTask(title);
    setLoadingBreakdown(true);
    setBreakdownSteps([]);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/task-breakdown`, {
        method: "POST",
        headers,
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const data = await res.json();
        setBreakdownSteps(data.steps);
      }
    } catch (e) {
      console.error(e);
      setBreakdownSteps([
        "ابدأ بـ 5 دقائق بس من غير ضغط",
        "اكتب خطة بسيطة للخطوة الأولى",
        "ركز في حاجة واحدة صغيرة واعملها"
      ]);
    } finally {
      setLoadingBreakdown(false);
    }
  };

  const totalDone = matrixTasks.filter((t) => t.done).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 animate-fade-in">
      <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-border dark:border-white/[0.06] pb-4 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-dark dark:text-dark-text tracking-tight flex items-center gap-3"><Target size={24} className="text-primary" /> Eisenhower Matrix</h1>
          <p className="text-xs sm:text-sm text-text-muted dark:text-dark-text-muted mt-1">Prioritize ruthlessly. Focus on what&apos;s truly important.</p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-right shrink-0"><span className="text-xl sm:text-2xl font-bold text-text-dark dark:text-dark-text">{totalDone}</span><span className="text-xs sm:text-sm text-text-muted dark:text-dark-text-muted">/{matrixTasks.length} done</span></div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 sm:gap-2 bg-primary hover:bg-primary-hover text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 shrink-0"><Plus size={16} /> Add Task</button>
        </div>
      </header>

      {/* AI Focus Recommendation */}
      {recommendation && recommendation.task_id && (
        <div className="mb-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-500/10 p-4 sm:p-5 relative overflow-hidden animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-50/10 flex items-center justify-center text-indigo-500 shrink-0">
              <Sparkles size={18} className="text-indigo-500 dark:text-indigo-400 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">AI Priority Recommendation</span>
              <p className="text-sm font-semibold text-text-dark dark:text-dark-text mt-0.5">
                Focus on: <span className="text-primary dark:text-indigo-300">"{matrixTasks.find(t => t.id === recommendation.task_id)?.title || 'Selected task'}"</span>
              </p>
              <p className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5 leading-relaxed">
                {recommendation.reason}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (recommendation.task_id) {
                setTinyMode(true, recommendation.task_id);
                router.push("/");
              }
            }}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5"
          >
            <Zap size={13} /> Start Tiny Step
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {QUADRANTS.map((q) => {
          const tasks = matrixTasks.filter((t) => t.quadrant === q.key);
          const done = tasks.filter((t) => t.done).length;
          return (
            <div key={q.key} className="widget-card">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${q.bg} flex items-center justify-center ${q.color}`}>{q.icon}</div>
                  <div>
                    <h2 className={`text-xs sm:text-sm font-bold ${q.color}`}>{q.label}</h2>
                    <p className="text-[10px] sm:text-xs text-text-light dark:text-dark-text-light">{q.subtitle}</p>
                  </div>
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-text-muted dark:text-dark-text-muted bg-surface dark:bg-dark-bg px-2 py-1 rounded-full">{done}/{tasks.length}</span>
              </div>
              {tasks.length === 0 ? (
                <div className="text-center py-6"><p className="text-xs sm:text-sm text-text-light dark:text-dark-text-light">No tasks here yet</p></div>
              ) : (
                <ul className="space-y-2">
                  {tasks.map((task) => (
                    <li key={task.id} className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl transition-all group ${task.done ? "bg-surface/60 dark:bg-dark-bg/60" : "bg-surface dark:bg-dark-bg hover:bg-surface-hover dark:hover:bg-dark-surface-hover"}`}>
                      <button onClick={() => toggleMatrixTask(task.id)} className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${task.done ? "bg-success border-success text-white" : "border-border dark:border-white/[0.15]"}`}>
                        {task.done && <Check size={12} />}
                      </button>
                      <span className={`flex-1 text-xs sm:text-sm font-medium truncate ${task.done ? "line-through text-text-light dark:text-dark-text-light" : "text-text-dark dark:text-dark-text"}`}>{task.title}</span>
                      
                      {/* AI smart breakdown trigger */}
                      {!task.done && (
                        <button
                          onClick={() => handleBreakdown(task.title)}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 sm:w-7 sm:h-7 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-[#8A8AAA] hover:text-indigo-500 flex items-center justify-center transition-all shrink-0"
                          title="Break down with AI"
                        >
                          <Sparkles size={12} />
                        </button>
                      )}
                      
                      <button onClick={() => deleteMatrixTask(task.id)} className="opacity-0 group-hover:opacity-100 w-6 h-6 sm:w-7 sm:h-7 rounded-lg hover:bg-danger-light dark:hover:bg-dark-danger-light text-text-light hover:text-danger flex items-center justify-center transition-all shrink-0"><Trash2 size={12} /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-[#1A1A26] border border-border dark:border-white/[0.08] rounded-2xl shadow-xl dark:shadow-[0_24px_64px_rgba(0,0,0,0.6)] p-5 sm:p-8 w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base sm:text-lg font-bold text-text-dark dark:text-dark-text mb-5 sm:mb-6">Add New Task</h3>
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="text-xs font-semibold text-text-muted dark:text-dark-text-muted mb-1.5 block">Task Title</label>
                <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="e.g. Finish lab report" autoFocus className="w-full bg-surface dark:bg-dark-bg border border-border dark:border-white/[0.08] rounded-xl px-4 py-2.5 sm:py-3 text-sm font-medium text-text-dark dark:text-dark-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted dark:text-dark-text-muted mb-1.5 block">Quadrant</label>
                <div className="grid grid-cols-2 gap-2">
                  {QUADRANTS.map((q) => (
                    <button key={q.key} onClick={() => setNewQuadrant(q.key)} className={`p-2.5 sm:p-3 rounded-xl border-2 text-left transition-all ${newQuadrant === q.key ? `border-primary ${q.bg}` : "border-border dark:border-white/[0.08]"}`}>
                      <span className={`text-xs sm:text-sm font-semibold ${q.color}`}>{q.label}</span>
                      <p className="text-[10px] sm:text-xs text-text-light dark:text-dark-text-light mt-0.5">{q.subtitle}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 mt-6 sm:mt-8">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 sm:py-3 rounded-xl border border-border dark:border-white/[0.08] text-xs sm:text-sm font-semibold text-text-muted hover:bg-surface dark:hover:bg-white/[0.04] transition-colors">Cancel</button>
              <button onClick={handleAdd} className="flex-1 py-2.5 sm:py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold transition-all shadow-sm">Add Task</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Breakdown Modal */}
      {breakingTask && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 animate-fade-in" onClick={() => setBreakingTask(null)}>
          <div className="bg-white dark:bg-[#1A1A26] border border-border dark:border-white/[0.08] rounded-2xl shadow-xl dark:shadow-[0_24px_64px_rgba(0,0,0,0.6)] p-5 sm:p-8 w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block">AI Smart Breakdown</span>
                <h3 className="text-sm sm:text-base font-bold text-text-dark dark:text-dark-text mt-1">{breakingTask}</h3>
              </div>
              <button onClick={() => setBreakingTask(null)} className="text-text-light hover:text-text-dark dark:hover:text-dark-text"><X size={16} /></button>
            </div>
            
            {loadingBreakdown ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3 animate-fade-in">
                <Loader2 size={24} className="text-indigo-500 animate-spin" />
                <p className="text-xs text-text-muted dark:text-dark-text-muted">Analyzing task and breaking down steps...</p>
              </div>
            ) : (
              <div className="space-y-5 animate-slide-up">
                <ul className="space-y-2">
                  {breakdownSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-surface dark:bg-dark-bg border border-border dark:border-white/[0.04]">
                      <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-500 text-xs font-bold shrink-0">{idx + 1}</div>
                      <span className="text-xs sm:text-sm font-medium text-text-dark dark:text-dark-text leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      breakdownSteps.forEach(step => addMatrixTask(step, "q1"));
                      setBreakingTask(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md"
                  >
                    Add All Steps to Matrix 🎯
                  </button>
                  <button
                    onClick={() => setBreakingTask(null)}
                    className="px-4 py-2.5 rounded-xl border border-border dark:border-white/[0.08] text-xs sm:text-sm font-semibold text-text-muted hover:bg-surface dark:hover:bg-white/[0.04] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
