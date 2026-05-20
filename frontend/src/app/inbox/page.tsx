"use client";

import { useState } from "react";
import { Inbox, Plus, ArrowRight, Trash2, Check, Brain, CalendarClock, Target, X } from "lucide-react";
import { useAppStore } from "../store";

export default function InboxPage() {
  const { inboxItems, addInboxItem, processInboxItem, deleteInboxItem, addMatrixTask, addNote, addTimeBlock, cognitiveContext } = useAppStore();
  const [newItem, setNewItem] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [destination, setDestination] = useState<"matrix" | "brain" | "timeblock" | null>(null);
  const [extraInfo, setExtraInfo] = useState("");

  const unprocessed = inboxItems.filter(i => !i.processed);
  const processed = inboxItems.filter(i => i.processed);

  const isRecommended = (content: string) => {
    if (!cognitiveContext) return false;
    const lowerContent = content.toLowerCase();
    const focuses = cognitiveContext.active_focus || [];
    const stressors = cognitiveContext.active_stressors || [];
    return [...focuses, ...stressors].some(term => {
      const words = term.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      if (words.length === 0) return lowerContent.includes(term.toLowerCase());
      return words.some(word => lowerContent.includes(word));
    });
  };

  const sortedUnprocessed = [...unprocessed].sort((a, b) => {
    const aRec = isRecommended(a.content);
    const bRec = isRecommended(b.content);
    if (aRec && !bRec) return -1;
    if (!aRec && bRec) return 1;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const handleAdd = () => {
    if (!newItem.trim()) return;
    addInboxItem(newItem.trim());
    setNewItem("");
  };

  const handleProcess = (item: typeof inboxItems[0]) => {
    if (!destination) return;
    if (destination === "matrix") addMatrixTask(item.content, "q2");
    else if (destination === "brain") addNote(item.content, extraInfo, ["inbox"]);
    else if (destination === "timeblock") {
      const hour = new Date().getHours() + 1;
      addTimeBlock({ date: new Date().toISOString().slice(0, 10), hour: Math.min(hour, 23), taskTitle: item.content, color: "#2563EB" });
    }
    processInboxItem(item.id);
    setSelectedId(null); setDestination(null); setExtraInfo("");
  };

  const selectedItem = inboxItems.find(i => i.id === selectedId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 animate-fade-in">
      <header className="mb-5 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-border dark:border-white/[0.06] pb-4 gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-dark dark:text-dark-text tracking-tight flex items-center gap-3"><Inbox size={24} className="text-primary"/> GTD Inbox</h1>
          <p className="text-xs sm:text-sm text-text-muted dark:text-dark-text-muted mt-1">Capture everything. Process intentionally.</p>
        </div>
        {unprocessed.length > 0 && <span className="self-start sm:self-auto px-3 py-1.5 rounded-full bg-danger text-white text-xs font-bold shrink-0">{unprocessed.length} to process</span>}
      </header>

      {/* Capture */}
      <div className="widget-card mb-5 sm:mb-8 p-4 sm:p-6">
        <h2 className="text-xs sm:text-sm font-bold text-text-dark dark:text-dark-text mb-3 flex items-center gap-2"><Plus size={14} className="text-primary"/> Quick Capture</h2>
        <div className="flex gap-2 sm:gap-3">
          <input value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()} placeholder="What's on your mind? Capture it now..." className="flex-1 bg-surface dark:bg-dark-bg border border-border dark:border-white/[0.08] rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-text-dark dark:text-dark-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-text-light dark:placeholder:text-dark-text-light"/>
          <button onClick={handleAdd} className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 shrink-0">Capture</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Unprocessed */}
        <div className="lg:col-span-2 widget-card p-4 sm:p-6">
          <h2 className="text-xs sm:text-sm font-bold text-text-dark dark:text-dark-text mb-4 flex items-center gap-2"><Inbox size={14} className="text-warning"/> Inbox ({unprocessed.length})</h2>
          {unprocessed.length === 0 ? (
            <div className="text-center py-8 sm:py-12"><Check size={36} className="mx-auto text-success mb-2"/><p className="text-sm font-semibold text-text-dark dark:text-dark-text">Inbox Zero!</p><p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">All items processed.</p></div>
          ) : (
            <ul className="space-y-2">
              {sortedUnprocessed.map(item => {
                const rec = isRecommended(item.content);
                return (
                  <li
                    key={item.id}
                    className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl transition-colors group cursor-pointer border ${
                      selectedId === item.id
                        ? "bg-primary-light dark:bg-dark-primary-light border-primary/30"
                        : rec
                        ? "bg-indigo-500/[0.02] dark:bg-indigo-950/[0.08] border-indigo-500/15 hover:bg-indigo-500/[0.04]"
                        : "bg-surface dark:bg-dark-bg hover:bg-surface-hover dark:hover:bg-dark-surface-hover border-transparent"
                    }`}
                    onClick={() => { setSelectedId(item.id); setDestination(null); setExtraInfo(""); }}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${rec ? "bg-indigo-500 animate-pulse" : "bg-warning"}`} />
                    <span className="flex-1 text-xs sm:text-sm font-medium text-text-dark dark:text-dark-text truncate flex items-center gap-1.5">
                      {item.content}
                      {rec && (
                        <span className="inline-flex items-center text-[9px] font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                          Focus
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); deleteInboxItem(item.id); setSelectedId(null); }} className="w-6 h-6 rounded-lg hover:bg-danger-light dark:hover:bg-dark-danger-light text-text-light hover:text-danger flex items-center justify-center"><Trash2 size={11}/></button>
                      <ArrowRight size={13} className="text-primary"/>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {processed.length > 0 && (
            <div className="mt-5 sm:mt-6 pt-4 border-t border-border dark:border-white/[0.06]">
              <h3 className="text-[10px] font-bold text-text-light dark:text-dark-text-light uppercase tracking-wider mb-2">Processed</h3>
              <ul className="space-y-1.5">
                {processed.slice().reverse().slice(0,5).map(item => (
                  <li key={item.id} className="flex items-center gap-2 p-2 rounded-lg opacity-50">
                    <Check size={12} className="text-success shrink-0"/>
                    <span className="text-xs text-text-muted dark:text-dark-text-muted line-through truncate flex-1">{item.content}</span>
                    <button onClick={() => deleteInboxItem(item.id)} className="w-5 h-5 rounded hover:bg-surface dark:hover:bg-white/[0.04] text-text-light flex items-center justify-center transition-colors shrink-0"><X size={10}/></button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Process panel */}
        <div className="widget-card p-4 sm:p-6">
          <h2 className="text-xs sm:text-sm font-bold text-text-dark dark:text-dark-text mb-4 flex items-center gap-2"><ArrowRight size={14} className="text-success"/> Process Item</h2>
          {selectedItem ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="p-2.5 sm:p-3 bg-surface dark:bg-dark-bg rounded-xl"><p className="text-xs sm:text-sm font-medium text-text-dark dark:text-dark-text">{selectedItem.content}</p></div>
              <p className="text-[10px] sm:text-xs font-semibold text-text-muted dark:text-dark-text-muted uppercase tracking-wider">Send to...</p>
              {[
                { key: "matrix", icon: <Target size={15}/>, label: "Eisenhower Matrix", sub: "Add as Q2 task", color: "text-primary", bg: "bg-primary-light dark:bg-dark-primary-light" },
                { key: "brain", icon: <Brain size={15}/>, label: "Second Brain", sub: "Save as a note", color: "text-indigo-500 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
                { key: "timeblock", icon: <CalendarClock size={15}/>, label: "Time Blocker", sub: "Block time for it", color: "text-success", bg: "bg-success-light dark:bg-dark-success-light" },
              ].map(opt => (
                <button key={opt.key} onClick={() => setDestination(opt.key as typeof destination)} className={`w-full flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl border-2 transition-all ${destination===opt.key?`border-primary ${opt.bg}`:"border-border dark:border-white/[0.08] hover:border-primary/30"}`}>
                  <div className={`w-8 h-8 rounded-lg ${opt.bg} flex items-center justify-center ${opt.color} shrink-0`}>{opt.icon}</div>
                  <div className="text-left min-w-0"><p className={`text-xs font-bold ${opt.color}`}>{opt.label}</p><p className="text-[10px] text-text-muted dark:text-dark-text-muted">{opt.sub}</p></div>
                </button>
              ))}
              {destination === "brain" && <textarea value={extraInfo} onChange={e=>setExtraInfo(e.target.value)} placeholder="Optional content..." rows={2} className="w-full bg-surface dark:bg-dark-bg border border-border dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs text-text-dark dark:text-dark-text focus:outline-none focus:border-primary transition-colors resize-none"/>}
              <button onClick={() => selectedItem && handleProcess(selectedItem)} disabled={!destination} className={`w-full py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${destination?"bg-success hover:bg-success/90 text-white shadow-sm":"bg-surface dark:bg-dark-bg text-text-light dark:text-dark-text-light cursor-not-allowed"}`}>
                {destination ? `Send to ${destination==="matrix"?"Matrix":destination==="brain"?"Brain":"Time Blocker"}` : "Select a destination"}
              </button>
              <button onClick={() => { deleteInboxItem(selectedItem.id); setSelectedId(null); setDestination(null); }} className="w-full py-2 rounded-xl text-xs font-semibold text-danger hover:bg-danger-light dark:hover:bg-dark-danger-light transition-colors flex items-center justify-center gap-1.5"><Trash2 size={12}/> Delete</button>
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12"><ArrowRight size={32} className="mx-auto text-text-light dark:text-dark-text-light mb-2"/><p className="text-xs sm:text-sm text-text-muted dark:text-dark-text-muted">Select an inbox item<br/>to process it.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
