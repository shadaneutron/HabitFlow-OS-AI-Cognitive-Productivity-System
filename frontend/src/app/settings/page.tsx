"use client";

import { Settings, Save, Trash2, Download } from "lucide-react";
import { useAppStore } from "../store";
import { useState } from "react";

export default function SettingsPage() {
  const { settings, updateSettings, clearAllData } = useAppStore();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const data = JSON.stringify(useAppStore.getState(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "habitflow-backup.json"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 animate-fade-in">
      <header className="mb-6 sm:mb-8 border-b border-border dark:border-white/[0.06] pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-dark dark:text-dark-text tracking-tight flex items-center gap-3"><Settings size={24} className="text-primary"/> Settings</h1>
        <p className="text-xs sm:text-sm text-text-muted dark:text-dark-text-muted mt-1">Customize your HabitFlow experience.</p>
      </header>

      <div className="space-y-4 sm:space-y-6">
        {/* Profile */}
        <div className="widget-card p-4 sm:p-6">
          <h2 className="text-xs sm:text-sm font-bold text-text-dark dark:text-dark-text mb-4 uppercase tracking-wider">Profile</h2>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="text-xs font-semibold text-text-muted dark:text-dark-text-muted mb-1.5 block">Your Name</label>
              <input value={settings.userName} onChange={e => updateSettings({ userName: e.target.value })} placeholder="John Doe" className="w-full bg-surface dark:bg-dark-bg border border-border dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-sm font-medium text-text-dark dark:text-dark-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"/>
            </div>
          </div>
        </div>

        {/* Pomodoro */}
        <div className="widget-card p-4 sm:p-6">
          <h2 className="text-xs sm:text-sm font-bold text-text-dark dark:text-dark-text mb-4 uppercase tracking-wider">Pomodoro Timer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: "Work (min)", key: "workDuration" as const, min: 1, max: 90 },
              { label: "Short Break", key: "shortBreak" as const, min: 1, max: 30 },
              { label: "Long Break",  key: "longBreak"  as const, min: 1, max: 60 },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-text-muted dark:text-dark-text-muted mb-1.5 block">{f.label}</label>
                <div className="flex items-center gap-2 bg-surface dark:bg-dark-bg border border-border dark:border-white/[0.08] rounded-xl overflow-hidden">
                  <button onClick={() => updateSettings({ [f.key]: Math.max(f.min, (settings[f.key] as number) - 1) })} className="px-3 sm:px-4 py-2.5 text-text-muted dark:text-dark-text-muted hover:text-text-dark dark:hover:text-dark-text font-bold transition-colors text-base">−</button>
                  <span className="flex-1 text-center text-sm font-bold text-text-dark dark:text-dark-text">{settings[f.key]}</span>
                  <button onClick={() => updateSettings({ [f.key]: Math.min(f.max, (settings[f.key] as number) + 1) })} className="px-3 sm:px-4 py-2.5 text-text-muted dark:text-dark-text-muted hover:text-text-dark dark:hover:text-dark-text font-bold transition-colors text-base">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Management */}
        <div className="widget-card p-4 sm:p-6">
          <h2 className="text-xs sm:text-sm font-bold text-text-dark dark:text-dark-text mb-4 uppercase tracking-wider">Data</h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border dark:border-white/[0.08] text-xs sm:text-sm font-semibold text-text-muted dark:text-dark-text-muted hover:bg-surface dark:hover:bg-white/[0.04] transition-colors"><Download size={15}/> Export Data</button>
            <button onClick={() => { if (confirm("Delete ALL data? This cannot be undone.")) clearAllData(); }} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-danger-light dark:bg-dark-danger-light text-danger text-xs sm:text-sm font-semibold hover:bg-danger hover:text-white transition-all"><Trash2 size={15}/> Clear All Data</button>
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} className={`w-full py-3 sm:py-3.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${saved ? "bg-success text-white" : "bg-primary hover:bg-primary-hover text-white"}`}>
          <Save size={16}/> {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
