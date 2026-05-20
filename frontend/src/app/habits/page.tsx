"use client";

import { useState } from "react";
import { Plus, Trash2, Flame, CheckCircle2, Dumbbell, BookOpen, Heart, User, X } from "lucide-react";
import { useAppStore, Habit } from "../store";

const CATS: { key: Habit["category"]; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { key: "study",    label: "Study",    icon: <BookOpen size={13} />, color: "text-primary", bg: "bg-primary-light dark:bg-dark-primary-light" },
  { key: "health",   label: "Health",   icon: <Heart size={13} />,   color: "text-success", bg: "bg-success-light dark:bg-dark-success-light" },
  { key: "fitness",  label: "Fitness",  icon: <Dumbbell size={13} />,color: "text-danger",  bg: "bg-danger-light dark:bg-dark-danger-light"  },
  { key: "personal", label: "Personal", icon: <User size={13} />,    color: "text-warning", bg: "bg-warning-light dark:bg-dark-warning-light" },
];

function getStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const sorted = [...dates].sort().reverse();
  const today = new Date(); today.setHours(0,0,0,0);
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    if (sorted.includes(d.toISOString().slice(0,10))) streak++;
    else if (i === 0) continue; else break;
  }
  return streak;
}

function getLast7(): string[] {
  const today = new Date(); today.setHours(0,0,0,0);
  return Array.from({length:7},(_,i)=>{ const d=new Date(today); d.setDate(d.getDate()-(6-i)); return d.toISOString().slice(0,10); });
}
const DAYS = ["S","M","T","W","T","F","S"];

export default function HabitsPage() {
  const { habits, addHabit, deleteHabit, toggleHabitToday } = useAppStore();
  const [filter, setFilter] = useState<Habit["category"] | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState<Habit["category"]>("study");

  const todayStr = new Date().toISOString().slice(0,10);
  const last7 = getLast7();
  const filtered = filter === "all" ? habits : habits.filter(h => h.category === filter);
  const done = habits.filter(h => h.completedDates.includes(todayStr)).length;
  const pct = habits.length > 0 ? Math.round((done/habits.length)*100) : 0;
  const handleAdd = () => { if (!newName.trim()) return; addHabit(newName.trim(), newCat); setNewName(""); setShowModal(false); };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 animate-fade-in">
      <header className="mb-5 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-border dark:border-white/[0.06] pb-4 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-dark dark:text-dark-text tracking-tight flex items-center gap-3"><CheckCircle2 size={24} className="text-success"/> Habit Tracker</h1>
          <p className="text-xs sm:text-sm text-text-muted dark:text-dark-text-muted mt-1">Build consistency, one day at a time.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="self-start sm:self-auto flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 shrink-0"><Plus size={15}/> New Habit</button>
      </header>

      <div className="widget-card mb-5 sm:mb-8 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-2"><h2 className="text-xs sm:text-sm font-bold text-text-dark dark:text-dark-text">Today&apos;s Progress</h2><span className="text-sm font-bold text-primary">{pct}%</span></div>
        <div className="w-full h-2.5 bg-surface dark:bg-dark-bg rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-700" style={{width:`${pct}%`}}/></div>
        <p className="text-xs text-text-muted dark:text-dark-text-muted mt-2">{done} of {habits.length} habits completed</p>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {["all",...CATS.map(c=>c.key)].map(k => {
          const cat = CATS.find(c=>c.key===k);
          const active = filter === k;
          return <button key={k} onClick={() => setFilter(k as Habit["category"]|"all")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${active ? cat ? `${cat.bg} ${cat.color}` : "bg-text-dark dark:bg-dark-text text-white dark:text-dark-bg" : "bg-surface dark:bg-dark-surface text-text-muted dark:text-dark-text-muted hover:bg-surface-hover dark:hover:bg-dark-surface-hover"}`}>{cat?.icon} {k==="all"?"All":cat?.label}</button>;
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {filtered.map(habit => {
          const isDone = habit.completedDates.includes(todayStr);
          const streak = getStreak(habit.completedDates);
          const cat = CATS.find(c=>c.key===habit.category)!;
          return (
            <div key={habit.id} className={`widget-card relative group p-4 sm:p-5 ${isDone?"ring-2 ring-success/30":""}`}>
              <button onClick={() => deleteHabit(habit.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg hover:bg-danger-light dark:hover:bg-dark-danger-light text-text-light hover:text-danger flex items-center justify-center transition-all"><Trash2 size={12}/></button>
              <div className="flex items-start gap-2.5 mb-3">
                <div className={`w-9 h-9 rounded-xl ${cat.bg} flex items-center justify-center ${cat.color} shrink-0`}>{cat.icon}</div>
                <div className="min-w-0"><h3 className="text-xs sm:text-sm font-bold text-text-dark dark:text-dark-text truncate">{habit.name}</h3><span className={`text-[10px] font-semibold ${cat.color}`}>{cat.label}</span></div>
              </div>
              {streak > 0 && <div className="flex items-center gap-1 mb-3"><Flame size={13} className="text-warning animate-streak"/><span className="text-xs font-bold text-text-dark dark:text-dark-text">{streak}d</span><span className="text-[10px] text-text-muted dark:text-dark-text-muted"> streak</span></div>}
              <div className="flex gap-1 mb-3">
                {last7.map(d => {
                  const done2 = habit.completedDates.includes(d);
                  const isToday2 = d === todayStr;
                  return <div key={d} className="flex flex-col items-center gap-0.5 flex-1"><div className={`w-full aspect-square rounded transition-all ${done2?"bg-success":isToday2?"border-2 border-primary bg-surface dark:bg-dark-surface":"bg-surface dark:bg-dark-surface"}`}/><span className="text-[8px] text-text-light dark:text-dark-text-light">{DAYS[new Date(d+"T00:00:00").getDay()]}</span></div>;
                })}
              </div>
              <button onClick={() => toggleHabitToday(habit.id)} className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${isDone?"bg-success text-white":"bg-surface dark:bg-dark-bg text-text-dark dark:text-dark-text border border-border dark:border-white/[0.08] hover:bg-surface-hover dark:hover:bg-dark-surface-hover"}`}>{isDone?"✓ Done":"Mark Done"}</button>
            </div>
          );
        })}
      </div>
      {filtered.length===0 && <div className="text-center py-12"><CheckCircle2 size={40} className="mx-auto text-text-light dark:text-dark-text-light mb-3"/><p className="text-text-muted dark:text-dark-text-muted">No habits yet</p></div>}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-[#1A1A26] border border-border dark:border-white/[0.08] rounded-2xl shadow-xl p-5 sm:p-8 w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5"><h3 className="text-base font-bold text-text-dark dark:text-dark-text">New Habit</h3><button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-surface dark:hover:bg-white/[0.06] flex items-center justify-center text-text-muted"><X size={16}/></button></div>
            <div className="space-y-4">
              <div><label className="text-xs font-semibold text-text-muted dark:text-dark-text-muted mb-1.5 block">Name</label><input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAdd()} placeholder="e.g. Morning jog" autoFocus className="w-full bg-surface dark:bg-dark-bg border border-border dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-text-dark dark:text-dark-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"/></div>
              <div><label className="text-xs font-semibold text-text-muted dark:text-dark-text-muted mb-1.5 block">Category</label>
                <div className="grid grid-cols-2 gap-2">{CATS.map(c=><button key={c.key} onClick={()=>setNewCat(c.key)} className={`p-2.5 rounded-xl border-2 text-left flex items-center gap-2 transition-all ${newCat===c.key?`border-primary ${c.bg}`:"border-border dark:border-white/[0.08]"}`}><span className={c.color}>{c.icon}</span><span className="text-xs font-semibold text-text-dark dark:text-dark-text">{c.label}</span></button>)}</div>
              </div>
            </div>
            <div className="flex gap-2 mt-6"><button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-border dark:border-white/[0.08] text-xs font-semibold text-text-muted hover:bg-surface transition-colors">Cancel</button><button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all">Create</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
