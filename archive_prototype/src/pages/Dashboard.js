import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import PomodoroWidget from '../components/PomodoroWidget';
import MatrixWidget from '../components/MatrixWidget';

const Dashboard = () => {
  const { habits, toggleHabit } = useHabits();
  const [reflection, setReflection] = useState('');

  // We take the top 3 items for the "Habit Database" grid
  const displayHabits = habits.slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-textDark pb-24">
      {/* Page Header (Cover Image & Title) */}
      <div className="w-full h-48 bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-200"></div>
      
      <div className="max-w-4xl mx-auto px-8 -mt-12 relative z-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-textDark mb-12 bg-surface inline-block px-2 py-1 rounded">
          Student Master Workspace
        </h1>

        {/* Section 1: 80/20 Impact Zone */}
        <section className="mb-12">
          <div className="bg-surface border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-textDark mb-4 border-b border-slate-100 pb-2">Top 20% Impact Tasks</h2>
            <div className="space-y-3">
              {[
                "Finish HCI essay draft",
                "Review algorithms chapter for midterm",
                "Outline next week's project schedule"
              ].map((task, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors cursor-pointer group">
                  <div className="w-5 h-5 rounded border-2 border-slate-300 flex items-center justify-center group-hover:border-focus transition-colors"></div>
                  <span className="text-sm font-medium text-textDark">{task}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Habit Database */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-textDark mb-4 px-1">Habit Database</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayHabits.map((habit) => (
              <div key={habit.id} className="bg-surface border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-textDark">{habit.name}</h3>
                    {habit.completed && (
                      <span className="inline-block mt-1 text-xs font-bold text-urgency bg-urgency/20 px-2 py-0.5 rounded-full">
                        🔥 {Math.floor(Math.random() * 5) + 2}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Large clickable Done circle (Fitts's Law) */}
                <button 
                  onClick={() => toggleHabit(habit.id)}
                  className={`self-end w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors ${
                    habit.completed 
                      ? 'bg-success border-success text-white' 
                      : 'bg-white border-slate-300 text-transparent hover:border-slate-400'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Productivity Tools (2 Columns) */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-textDark mb-4 px-1">Execution & Prioritization</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
            <PomodoroWidget />
            <MatrixWidget />
          </div>
        </section>

        {/* Section 4: Daily Journaling */}
        <section className="mb-12">
          <div className="bg-surface border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-textDark mb-2 flex items-center gap-2">
              Daily Reflection ✍️
            </h2>
            <p className="text-sm text-textMuted mb-4">Capture your thoughts and close out the day.</p>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What went well today? Brain dump your thoughts here..."
              className="w-full h-32 bg-white border border-slate-200 rounded-lg p-4 text-sm text-textDark focus:outline-none focus:ring-1 focus:ring-focus transition-all resize-none shadow-inner"
            ></textarea>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;
