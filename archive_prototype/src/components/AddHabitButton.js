import React, { useState } from 'react';

const AddHabitButton = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [category, setCategory] = useState('Study');

  const handleAddHabit = () => {
    if (habitName.trim()) {
      onAdd(habitName, category);
      setHabitName('');
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen && (
        <div className="absolute bottom-24 right-0 glass rounded-2xl shadow-2xl p-6 w-80 sm:w-96 transition-all duration-300 animate-fadeIn origin-bottom-right">
          <h3 className="text-xl font-bold mb-5 text-white flex items-center gap-2">
            <span>✨</span> Add New Habit
          </h3>

          <div className="mb-5">
            <label htmlFor="habitName" className="block text-sm font-semibold text-gray-300 mb-2">
              Habit Name
            </label>
            <input
              type="text"
              id="habitName"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neonGreen focus:border-transparent transition-all"
              placeholder="e.g., Study 2 hours"
              autoFocus
            />
          </div>

          <div className="mb-8">
            <label htmlFor="category" className="block text-sm font-semibold text-gray-300 mb-2">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-neonGreen focus:border-transparent transition-all appearance-none"
            >
              <option value="Study">📚 Study</option>
              <option value="Health">💧 Health</option>
              <option value="Fitness">🏋️ Fitness</option>
              <option value="Mindfulness">🧘 Mindfulness</option>
              <option value="Productivity">⚡ Productivity</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-5 py-2.5 text-gray-400 font-medium hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAddHabit}
              className="px-6 py-2.5 bg-neonGreen text-background font-bold rounded-xl hover:bg-emerald-400 hover:shadow-[0_0_15px_rgba(57,255,20,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-neonGreen focus:ring-offset-2 focus:ring-offset-background"
            >
              Save Habit
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background ${
          isOpen 
            ? 'bg-softRed text-white hover:shadow-[0_0_20px_rgba(255,107,107,0.6)] focus:ring-softRed rotate-45' 
            : 'bg-neonGreen text-background hover:shadow-[0_0_20px_rgba(57,255,20,0.6)] focus:ring-neonGreen'
        }`}
        aria-label={isOpen ? "Close add habit form" : "Add new habit"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  );
};

export default AddHabitButton;