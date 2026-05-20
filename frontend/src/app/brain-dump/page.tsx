"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, ArrowRight, Loader2, Plus, CheckCircle2, Wind, Zap, History, Calendar, ChevronDown, ChevronUp, Pin, Archive, Trash2 } from "lucide-react";
import { useAppStore } from "../store";
import { API_URL } from "@/lib/api";


export default function BrainDumpPage() {
  const router = useRouter();
  const { token, addInboxItem, addMatrixTask, setTinyMode } = useAppStore();

  const [activeTab, setActiveTab] = useState<"dump" | "history">("dump");
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    calming_response: string;
    extracted_tasks: string[];
    focus_suggestion: string;
  } | null>(null);

  const [addedTasks, setAddedTasks] = useState<Set<number>>(new Set());
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedDump, setExpandedDump] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const handleDelete = async (item: any) => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/brain-dumps/${item.id}`, {
        method: "DELETE",
        headers
      });

      if (res.ok) {
        setHistory(prev => prev.filter(x => x.id !== item.id));
        useAppStore.getState().showToast("Deleted brain dump", async () => {
          try {
            const restoreRes = await fetch(`${API_URL}/api/brain-dumps/restore`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
              },
              body: JSON.stringify(item)
            });
            if (restoreRes.ok) {
              fetchHistory();
            }
          } catch (err) {
            console.error("Failed to restore brain dump:", err);
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleArchive = async (item: any) => {
    const nextArchived = !item.is_archived;
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/brain-dumps/${item.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ is_archived: nextArchived })
      });

      if (res.ok) {
        setHistory(prev => prev.map(x => x.id === item.id ? { ...x, is_archived: nextArchived } : x));
        useAppStore.getState().showToast(nextArchived ? "Archived brain dump" : "Restored brain dump", async () => {
          await fetch(`${API_URL}/api/brain-dumps/${item.id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify({ is_archived: !nextArchived })
          });
          fetchHistory();
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePin = async (item: any) => {
    const nextPinned = !item.is_pinned;
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/brain-dumps/${item.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ is_pinned: nextPinned })
      });

      if (res.ok) {
        setHistory(prev => {
          const updated = prev.map(x => x.id === item.id ? { ...x, is_pinned: nextPinned } : x);
          return updated.sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
        });
        useAppStore.getState().showToast(nextPinned ? "Pinned brain dump to top" : "Unpinned brain dump", async () => {
          await fetch(`${API_URL}/api/brain-dumps/${item.id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify({ is_pinned: !nextPinned })
          });
          fetchHistory();
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/brain-dumps`, { headers });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error("Error fetching brain dumps:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    setResult(null);
    setAddedTasks(new Set());

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/brain-dump`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: input }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        fetchHistory(); // Refresh history
      }
    } catch (e) {
      console.error(e);
      setResult({
        calming_response: "I hear you. Take a deep breath. It's okay to feel overwhelmed.",
        extracted_tasks: ["Break things down into smaller steps", "Drink some water"],
        focus_suggestion: "Just take a 5 minute break."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddTask = (task: string, index: number) => {
    addInboxItem(task);
    setAddedTasks((prev) => new Set(prev).add(index));
  };

  const reset = () => {
    setInput("");
    setResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-[calc(100vh-80px)] flex flex-col justify-center animate-fade-in">
      <header className="mb-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center mx-auto mb-4">
          <Wind size={24} className="text-indigo-500 dark:text-indigo-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-dark dark:text-dark-text tracking-tight mb-2">
          Brain Dump AI
        </h1>
        <p className="text-sm text-text-muted dark:text-dark-text-muted max-w-md mx-auto">
          Untangle your mental noise. Write exactly how you feel, what you need to do, and we'll help you sort it out gently.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab("dump")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeTab === "dump"
              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
              : "border-transparent text-text-muted hover:bg-surface dark:hover:bg-white/[0.04]"
          }`}
        >
          Untangle thoughts
        </button>
        <button
          onClick={() => {
            setActiveTab("history");
            fetchHistory();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeTab === "history"
              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
              : "border-transparent text-text-muted hover:bg-surface dark:hover:bg-white/[0.04]"
          }`}
        >
          Past dumps ({history.length})
        </button>
      </div>

      {activeTab === "dump" ? (
        <>
          {!result && (
            <div className="space-y-4 animate-slide-up">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="I'm overwhelmed because..."
                className="w-full h-48 sm:h-64 bg-white dark:bg-[#1A1A26] border-2 border-border dark:border-white/[0.08] rounded-2xl p-5 text-sm sm:text-base font-medium text-text-dark dark:text-dark-text focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] placeholder:text-text-light dark:placeholder:text-dark-text-light leading-relaxed"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={isProcessing || !input.trim()}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Processing Chaos...
                    </>
                  ) : (
                    <>
                      Sort My Thoughts <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-scale-in">
              {/* Calming Response */}
              <div className="p-5 sm:p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-500/20 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-400" />
                <MessageSquare size={20} className="text-indigo-400 mx-auto mb-3" />
                <p className="text-sm sm:text-base font-medium text-indigo-900 dark:text-indigo-200 leading-relaxed max-w-xl mx-auto">
                  "{result.calming_response}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Extracted Tasks */}
                <div className="widget-card p-5 border border-border dark:border-white/[0.06]">
                  <h3 className="text-xs font-bold text-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-success" /> Actionable Steps
                  </h3>
                  {result.extracted_tasks.length > 0 ? (
                    <ul className="space-y-2">
                      {result.extracted_tasks.map((task, idx) => {
                        const isAdded = addedTasks.has(idx);
                        return (
                          <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-surface dark:bg-dark-bg group transition-colors">
                            <button
                              onClick={() => !isAdded && handleAddTask(task, idx)}
                              disabled={isAdded}
                              className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                                isAdded
                                  ? "bg-success text-white"
                                  : "bg-white dark:bg-white/[0.05] border border-border dark:border-white/[0.1] text-text-light hover:border-success hover:text-success"
                              }`}
                              title="Add to Inbox"
                            >
                              {isAdded ? <CheckCircle2 size={12} /> : <Plus size={12} />}
                            </button>
                            <span className={`text-sm font-medium ${isAdded ? "text-text-muted line-through" : "text-text-dark dark:text-dark-text"}`}>
                              {task}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-text-muted dark:text-dark-text-muted text-center py-4">
                      No concrete tasks extracted. That's okay!
                    </p>
                  )}
                </div>

                {/* Focus Suggestion */}
                <div className="widget-card p-5 border border-border dark:border-white/[0.06] flex flex-col justify-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mx-auto mb-4">
                    <Wind size={20} className="text-amber-500" />
                  </div>
                  <h3 className="text-xs font-bold text-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-2">
                    Suggested Focus
                  </h3>
                  <p className="text-sm sm:text-base font-bold text-text-dark dark:text-dark-text mb-6">
                    {result.focus_suggestion}
                  </p>

                  <div className="space-y-2 mt-auto">
                    <button
                      onClick={() => {
                        const customId = "bd-" + Date.now();
                        addMatrixTask(result.focus_suggestion, "q1", customId);
                        setTinyMode(true, customId);
                        router.push("/");
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <Zap size={14} /> Focus on this now 🎯
                    </button>

                    <button
                      onClick={reset}
                      className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-white/[0.08] text-xs font-semibold text-text-muted dark:text-dark-text-muted hover:bg-surface dark:hover:bg-white/[0.04] transition-colors"
                    >
                      Dump More Thoughts
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center justify-between pb-2 border-b border-border dark:border-white/[0.06]">
            <span className="text-xs font-semibold text-text-muted dark:text-dark-text-muted">
              {showArchived ? "Viewing Archived Dumps" : "Viewing Active Dumps"}
            </span>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="text-xs font-bold text-indigo-500 dark:text-indigo-400 hover:underline transition-all flex items-center gap-1 bg-indigo-500/5 dark:bg-indigo-950/20 px-3 py-1.5 rounded-xl border border-indigo-500/10"
            >
              {showArchived ? "Show Active Dumps" : "Show Archived Dumps"}
            </button>
          </div>

          {loadingHistory ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-indigo-500" size={24} />
            </div>
          ) : history.filter(item => showArchived ? item.is_archived : !item.is_archived).length === 0 ? (
            <div className="text-center py-12 p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
              <History size={32} className="mx-auto text-[#6B6B8A] mb-3" />
              <p className="text-sm font-semibold text-text-dark dark:text-dark-text">
                {showArchived ? "No archived brain dumps" : "No active brain dumps"}
              </p>
              <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
                {showArchived ? "Your archived mental maps will appear here." : "Dumps you process will appear here for continuity."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history
                .filter(item => showArchived ? item.is_archived : !item.is_archived)
                .map((item) => {
                  const isExpanded = expandedDump === item.id;
                  const formattedDate = new Date(item.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl bg-white/[0.02] dark:bg-white/[0.01] border transition-all cursor-pointer ${
                        item.is_pinned 
                          ? "border-indigo-500/30 bg-indigo-500/[0.01] hover:border-indigo-500/50" 
                          : "border-border dark:border-white/[0.05] hover:border-indigo-500/30"
                      }`}
                      onClick={() => setExpandedDump(isExpanded ? null : item.id)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-400">
                          <Calendar size={12} />
                          <span>{formattedDate}</span>
                          {item.is_pinned && (
                            <span className="bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded text-[9px] font-bold border border-indigo-500/20">Pinned</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleTogglePin(item)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              item.is_pinned
                                ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                                : "border-transparent text-text-light hover:bg-surface dark:hover:bg-white/[0.04] hover:text-indigo-400"
                            }`}
                            title={item.is_pinned ? "Unpin dump" : "Pin dump"}
                          >
                            <Pin size={12} />
                          </button>
                          <button
                            onClick={() => handleToggleArchive(item)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              item.is_archived
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                : "border-transparent text-text-light hover:bg-surface dark:hover:bg-white/[0.04] hover:text-amber-400"
                            }`}
                            title={item.is_archived ? "Unarchive dump" : "Archive dump"}
                          >
                            <Archive size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 rounded-lg border border-transparent text-text-light hover:bg-danger-light hover:text-danger dark:hover:bg-dark-danger-light transition-colors"
                            title="Delete dump"
                          >
                            <Trash2 size={12} />
                          </button>
                          {isExpanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                        </div>
                      </div>

                      <p className={`text-xs sm:text-sm text-text-dark dark:text-dark-text mt-2 font-medium ${!isExpanded && "truncate"}`}>
                        {item.original_text}
                      </p>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-white/[0.04] space-y-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                          {/* Response */}
                          <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block">AI Calming Guide</span>
                            <p className="text-xs sm:text-sm text-indigo-200 mt-1 italic">"{item.calming_response}"</p>
                          </div>

                          {/* Tasks */}
                          {item.extracted_tasks.length > 0 && (
                            <div>
                              <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-2">Extracted Actions</span>
                              <ul className="space-y-1.5">
                                {item.extracted_tasks.map((task: string, i: number) => (
                                  <li key={i} className="flex items-center gap-2 p-2 rounded-lg bg-surface dark:bg-[#1A1A26]">
                                    <button
                                      onClick={() => addInboxItem(task)}
                                      className="w-4 h-4 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 flex items-center justify-center"
                                      title="Add to Inbox"
                                    >
                                      <Plus size={10} />
                                    </button>
                                    <span className="text-xs text-text-dark dark:text-dark-text font-medium">{task}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Suggestion */}
                          <div>
                            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest block">Focus Point</span>
                            <p className="text-xs sm:text-sm text-text-dark dark:text-dark-text font-bold mt-1">{item.focus_suggestion}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
