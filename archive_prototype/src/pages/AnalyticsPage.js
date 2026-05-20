import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AnalyticsPage = () => {
  const { streak } = useHabits();
  const [reflection, setReflection] = useState('');

  // Mock data for the chart
  const data = [
    { name: 'Mon', focusHours: 2, habits: 3 },
    { name: 'Tue', focusHours: 3.5, habits: 4 },
    { name: 'Wed', focusHours: 1.5, habits: 2 },
    { name: 'Thu', focusHours: 4, habits: 4 },
    { name: 'Fri', focusHours: 3, habits: 3 },
    { name: 'Sat', focusHours: 5, habits: 5 },
    { name: 'Sun', focusHours: 2, habits: 4 },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-textDark pb-24 md:pb-12 pt-8 p-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 animate-slide-up">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Analytics & Reflection</h1>
          <p className="text-textMuted text-lg">Measure your progress. Reflect on your journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Streak Master */}
          <div className="bg-surface p-8 rounded-3xl border border-slate-200 shadow-md flex flex-col justify-center items-center animate-slide-up relative overflow-hidden" style={{animationDelay: '0.1s'}}>
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-urgency/10 rounded-full blur-2xl"></div>
            <h3 className="text-textMuted font-bold mb-4 uppercase text-sm tracking-wider">Streak Master</h3>
            <div className="flex items-center gap-4 z-10">
              <span className="text-6xl drop-shadow-md">🔥</span>
              <span className="text-6xl font-black text-textDark tracking-tighter">{streak}</span>
            </div>
            <p className="text-urgency mt-4 text-sm font-bold bg-urgency/10 px-3 py-1 rounded-full">Consecutive Days</p>
          </div>
          
          {/* Line Charts */}
          <div className="md:col-span-2 bg-surface p-8 rounded-3xl border border-slate-200 shadow-md animate-slide-up" style={{animationDelay: '0.2s'}}>
            <h3 className="text-lg font-bold mb-6 text-textDark">Focus & Consistency Trends</h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                  <YAxis stroke="#64748B" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 600 }}
                  />
                  <Line type="monotone" dataKey="focusHours" name="Focus Hours" stroke="#3B82F6" strokeWidth={4} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="habits" name="Habits Done" stroke="#10B981" strokeWidth={4} dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-6 mt-4 justify-center">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-focus"></div><span className="text-sm font-medium text-textMuted">Focus Hours</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-success"></div><span className="text-sm font-medium text-textMuted">Habits Completed</span></div>
            </div>
          </div>
        </div>

        {/* Weekly Review Area */}
        <div className="bg-surface p-8 rounded-3xl border border-slate-200 shadow-md animate-slide-up" style={{animationDelay: '0.3s'}}>
          <h3 className="text-lg font-bold mb-2 text-textDark">Weekly Review</h3>
          <p className="text-textMuted text-sm mb-6">What went well? What could be improved for next week?</p>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="I managed to hit my focus goals on Thursday, but the weekend was a bit unstructured..."
            className="w-full h-40 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-textDark focus:outline-none focus:ring-2 focus:ring-focus/50 transition-all resize-none shadow-inner"
          ></textarea>
          <div className="flex justify-end mt-4">
            <button className="bg-textDark text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-sm">
              Save Reflection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
