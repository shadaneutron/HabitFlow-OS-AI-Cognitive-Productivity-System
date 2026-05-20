import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { PlusCircle, Trash2, Check, X } from 'lucide-react';

const HabitsPage = () => {
  const { habits, addHabit, deleteHabit, toggleHabit, calculateCompletion } = useHabits();
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('📚 Study');

  const categories = ['📚 Study', '💧 Health', '🏋️ Fitness', '🧘 Mindfulness', '⚡ Productivity'];

  const handleAdd = (e) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      addHabit(newHabitName, newHabitCategory);
      setNewHabitName('');
    }
  };

  const completionRate = calculateCompletion();

  return (
    <div className="min-h-screen bg-background text-textDark pb-24 pt-8 p-6 lg:p-12 overflow-x-hidden">
      <div className="max-w-5xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-slate-200 pb-8 animate-slide-up">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-textDark mb-2">Habits Database</h1>
            <p className="text-textMuted text-lg">Build routines that stick. Track your daily progress.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-surface p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                <circle 
                  cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" 
                  strokeDasharray={175}
                  strokeDashoffset={175 - (175 * completionRate) / 100}
                  className="text-success transition-all duration-1000 ease-out" 
                />
              </svg>
              <div className="absolute font-bold text-sm text-textDark">{completionRate}%</div>
            </div>
            <div>
              <p className="text-sm font-bold text-textDark uppercase tracking-wider">Today's Progress</p>
              <p className="text-xs text-textMuted">{habits.filter(h => h.completed).length} of {habits.length} completed</p>
            </div>
          </div>
        </div>

        {/* Add New Habit Inline Form */}
        <section className="mb-12 animate-slide-up" style={{animationDelay: '0.1s'}}>
          <div className="bg-surface border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-textDark uppercase tracking-wider mb-4 flex items-center gap-2">
              <PlusCircle size={16} className="text-successDark" /> Quick Add
            </h2>
            <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="E.g., Read 10 pages..."
                className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-focus/50 transition-shadow shadow-inner"
              />
              <select 
                value={newHabitCategory}
                onChange={(e) => setNewHabitCategory(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-textDark focus:outline-none focus:ring-2 focus:ring-focus/50 shadow-inner"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button 
                type="submit"
                className="bg-textDark text-white font-semibold rounded-lg px-6 py-3 hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
              >
                Add Habit
              </button>
            </form>
          </div>
        </section>

        {/* Habits List */}
        <section className="animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="bg-surface border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-textMuted uppercase tracking-wider">
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-5 md:col-span-6">Habit Name</div>
              <div className="col-span-4 md:col-span-3">Category</div>
              <div className="col-span-2 text-right pr-2">Action</div>
            </div>

            {/* List Items */}
            <div className="divide-y divide-slate-100">
              {habits.map((habit) => (
                <div key={habit.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors group">
                  {/* Status Toggle */}
                  <div className="col-span-1 flex justify-center">
                    <button 
                      onClick={() => toggleHabit(habit.id)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        habit.completed 
                          ? 'bg-success border-success text-white scale-110 shadow-sm' 
                          : 'bg-white border-slate-300 text-transparent hover:border-slate-400'
                      }`}
                    >
                      <Check strokeWidth={3} size={16} />
                    </button>
                  </div>
                  
                  {/* Name */}
                  <div className="col-span-5 md:col-span-6 font-medium text-textDark">
                    <span className={habit.completed ? 'line-through text-textMuted' : ''}>
                      {habit.name}
                    </span>
                    {habit.completed && (
                      <span className="ml-3 inline-flex items-center gap-1 text-[10px] font-bold text-urgency bg-urgency/10 px-2 py-0.5 rounded-md">
                        🔥 {Math.floor(Math.random() * 5) + 2}
                      </span>
                    )}
                  </div>
                  
                  {/* Category */}
                  <div className="col-span-4 md:col-span-3">
                    <span className="inline-block bg-slate-100 border border-slate-200 text-textMuted text-xs px-2 py-1 rounded-md">
                      {habit.category}
                    </span>
                  </div>
                  
                  {/* Action */}
                  <div className="col-span-2 text-right">
                    <button 
                      onClick={() => deleteHabit(habit.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Habit"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              
              {habits.length === 0 && (
                <div className="p-12 text-center text-textMuted">
                  <div className="text-4xl mb-3 grayscale opacity-50">🍃</div>
                  <p>Your habit database is empty. Add a habit above to start tracking!</p>
                </div>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default HabitsPage;
