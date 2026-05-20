import React, { useState } from 'react';
import { Bell, ShieldCheck, GraduationCap, Lock, AlertCircle, PlusCircle, Power } from 'lucide-react';

const IntegrationPage = () => {
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [autoDownload, setAutoDownload] = useState(true);
  const [browserPush, setBrowserPush] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  // Reusable custom toggle switch component
  const Toggle = ({ enabled, onChange }) => (
    <div 
      onClick={() => onChange(!enabled)}
      className={`w-11 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${
        enabled ? 'bg-successDark' : 'bg-slate-300'
      }`}
    >
      <div 
        className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-textDark pb-24 relative overflow-hidden">
      
      {/* Top Local Navigation */}
      <div className="w-full bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shadow-sm relative z-10 animate-slide-up">
        <h1 className="font-bold text-lg text-textDark">Integration Center</h1>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-successDark"></span>
            </span>
            <span className="text-xs font-bold text-textDark tracking-wide">Auto-Sync: ON</span>
          </div>
          
          <div className="relative cursor-pointer hover:bg-slate-100 p-2 rounded-full transition-colors">
            <Bell className="text-slate-600" size={20} />
            <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white">
              3
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 pt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLUMN 1: Secure LMS Integration */}
          <section className="animate-slide-up" style={{animationDelay: '0.1s'}}>
            <h2 className="text-sm font-bold text-textDark uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-slate-500" /> University Integration & Privacy
            </h2>
            
            <div className="bg-surface border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
              {/* Connection Card */}
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-textDark text-lg">Delta University LMS</h3>
                    <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-successDark bg-success/20 px-2 py-0.5 rounded-full inline-flex">
                      <span className="w-1.5 h-1.5 rounded-full bg-successDark"></span>
                      Securely Connected
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex gap-3 mb-6">
                <Lock className="text-slate-500 shrink-0" size={18} />
                <p className="text-xs text-textMuted leading-relaxed font-medium">
                  Your credentials are end-to-end encrypted and stored locally. HabitFlow only reads deadlines and course materials to populate your dashboard.
                </p>
              </div>

              {/* Toggles */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-textDark">Real-time background sync</p>
                    <p className="text-xs text-textMuted">Checks for new quizzes & deadlines hourly</p>
                  </div>
                  <Toggle enabled={syncEnabled} onChange={setSyncEnabled} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-textDark">Auto-download course materials</p>
                    <p className="text-xs text-textMuted">Fetch new PDFs to local storage</p>
                  </div>
                  <Toggle enabled={autoDownload} onChange={setAutoDownload} />
                </div>
              </div>

              {/* Disconnect Button */}
              <button className="w-full py-3 flex justify-center items-center gap-2 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors">
                <Power size={16} /> Disconnect LMS
              </button>
            </div>
          </section>

          {/* COLUMN 2: Smart Notification System */}
          <section className="animate-slide-up" style={{animationDelay: '0.2s'}}>
            <h2 className="text-sm font-bold text-textDark uppercase tracking-wider mb-4 flex items-center gap-2">
              <Bell size={18} className="text-slate-500" /> Automated Reminders
            </h2>
            
            <div className="bg-surface border border-slate-200 rounded-xl p-6 shadow-sm">
              
              {/* Upcoming Deadlines */}
              <div className="mb-6 border-b border-slate-100 pb-6">
                <p className="text-sm font-semibold text-textDark mb-3">Upcoming Deadlines</p>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-textMuted">Warn me</span>
                  <select className="bg-slate-50 border border-slate-200 text-sm font-medium text-textDark rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-focus/50">
                    <option>24 hours</option>
                    <option>48 hours</option>
                    <option>1 week</option>
                  </select>
                  <span className="text-sm text-textMuted">before a quiz or assignment.</span>
                </div>
              </div>

              {/* Habit Reminders */}
              <div className="mb-6 border-b border-slate-100 pb-6">
                <p className="text-sm font-semibold text-textDark mb-3">Habit Reminders</p>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-textMuted">Push notification at</span>
                  <input 
                    type="time" 
                    defaultValue="20:00"
                    className="bg-slate-50 border border-slate-200 text-sm font-medium text-textDark rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-focus/50"
                  />
                  <span className="text-sm text-textMuted">if daily habits are incomplete.</span>
                </div>
              </div>

              {/* Notification Channels */}
              <div>
                <p className="text-sm font-semibold text-textDark mb-3">Notification Channels</p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={browserPush} 
                      onChange={() => setBrowserPush(!browserPush)}
                      className="w-4 h-4 text-focusDark rounded border-slate-300 focus:ring-focus"
                    />
                    <span className="text-sm font-medium text-textDark group-hover:text-focusDark transition-colors">Browser Push Notifications</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={emailAlerts} 
                      onChange={() => setEmailAlerts(!emailAlerts)}
                      className="w-4 h-4 text-focusDark rounded border-slate-300 focus:ring-focus"
                    />
                    <span className="text-sm font-medium text-textDark group-hover:text-focusDark transition-colors">Daily Email Digest Alerts</span>
                  </label>
                </div>
              </div>

            </div>
          </section>

        </div>
      </div>

      {/* FLOATING SMART ALERT */}
      {showAlert && (
        <div className="fixed bottom-8 right-8 w-96 bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-50 animate-slide-up flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
              <AlertCircle size={16} /> Delta LMS Update
            </div>
            <button onClick={() => setShowAlert(false)} className="text-slate-400 hover:text-slate-600">
              &times;
            </button>
          </div>
          <p className="text-sm text-textDark font-medium leading-snug">
            New Assignment posted in <span className="font-bold">HCI Course</span>. Due in 5 days.
          </p>
          <button className="self-start text-xs font-bold text-focusDark bg-focus/10 hover:bg-focus/20 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 mt-1">
            <PlusCircle size={12} /> Add to Kanban Board
          </button>
        </div>
      )}

    </div>
  );
};

export default IntegrationPage;
