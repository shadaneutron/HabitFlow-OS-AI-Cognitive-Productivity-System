import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { Trash2, PlusCircle } from 'lucide-react';

const SettingsPage = () => {
  const { habits, deleteHabit, addHabit } = useHabits();
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

  return (
    <div className="min-h-screen bg-background text-textWarm pb-24 md:pb-8 md:pl-72 p-6 overflow-x-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 animate-slide-up">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Manage Habits</h1>
          <p className="text-textMuted">Add new goals or remove old ones.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Add Habit Form */}
          <div className="bg-card p-8 rounded-3xl border border-white/5 shadow-lg animate-slide-up" style={{animationDelay: '0.1s'}}>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <PlusCircle className="text-success" /> Add New Habit
            </h3>
            
            <form onSubmit={handleAdd} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Habit Name</label>
                <input 
                  type="text" 
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g. Read for 20 minutes"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-textWarm focus:outline-none focus:ring-2 focus:ring-success/50 transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewHabitCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        newHabitCategory === cat 
                          ? 'bg-success/20 text-success border border-success/50' 
                          : 'bg-background border border-white/10 text-textMuted hover:border-white/30'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-success text-background font-bold rounded-xl py-3 hover:bg-successDark transition-colors shadow-lg"
              >
                Create Habit
              </button>
            </form>
          </div>

          {/* Active Habits List */}
          <div className="bg-card p-8 rounded-3xl border border-white/5 shadow-lg animate-slide-up" style={{animationDelay: '0.2s'}}>
            <h3 className="text-xl font-bold mb-6">Active Habits ({habits.length})</h3>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {habits.map(habit => (
                <div key={habit.id} className="flex items-center justify-between p-4 rounded-2xl bg-background border border-white/5 hover:border-white/10 transition-colors">
                  <div>
                    <h4 className="font-bold">{habit.name}</h4>
                    <span className="text-xs text-textMuted mt-1 block">{habit.category}</span>
                  </div>
                  <button 
                    onClick={() => deleteHabit(habit.id)}
                    className="p-2 text-textMuted hover:text-softRed hover:bg-softRed/10 rounded-lg transition-colors"
                    aria-label="Delete habit"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              
              {habits.length === 0 && (
                <p className="text-textMuted text-center py-8">No active habits. Create one to get started!</p>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
