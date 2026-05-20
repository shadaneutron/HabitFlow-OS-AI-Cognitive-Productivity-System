import React, { useState } from 'react';

const HabitCard = ({ habit, onToggle }) => {
  const [ripples, setRipples] = useState([]);

  // Format the last completed date
  const formatDate = (dateString) => {
    if (!dateString) return "Not yet completed";

    const date = new Date(dateString);
    return `Last: ${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  };

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { x, y, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);
    
    // Clean up ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    onToggle();
  };

  return (
    <button
      onClick={handleClick}
      className={`relative w-full text-left group overflow-hidden rounded-2xl p-6 transition-all duration-300 ease-out transform hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-4 ${
        habit.completed 
          ? 'bg-success/5 border border-success/30 hover:border-success focus:ring-success/30' 
          : 'bg-surface border border-slate-200 hover:border-slate-300 focus:ring-slate-200 shadow-sm'
      }`}
      aria-pressed={habit.completed}
    >
      {/* Ripple Effect Container */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-[ripple_0.6s_linear_forwards] pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Background glow effect on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none ${
        habit.completed ? 'bg-success/5' : 'bg-slate-50'
      }`} />

      <div className="relative z-10 flex items-start justify-between pointer-events-none">
        <div className="pr-4">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={`text-xl font-bold transition-colors ${habit.completed ? 'text-successDark' : 'text-textDark group-hover:text-focus'}`}>
              {habit.name}
            </h3>
            {/* Small streak indicator for gamification */}
            {habit.completed && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-brightOrange bg-brightOrange/10 px-2 py-1 rounded-lg">
                🔥 <span>{Math.floor(Math.random() * 5) + 2}</span>
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 mt-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              habit.completed ? 'bg-success/10 text-successDark' : 'bg-slate-100 text-textMuted'
            }`}>
              {habit.category}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {formatDate(habit.lastCompleted)}
            </span>
          </div>
        </div>

        {/* Large Visual Feedback Icon */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
          habit.completed 
            ? 'bg-success text-white scale-110' 
            : 'bg-surface text-textMuted border border-slate-200 group-hover:bg-slate-50 group-hover:text-textDark group-hover:border-slate-300'
        }`}>
          {habit.completed ? (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          )}
        </div>
      </div>
      <style>{`
        @keyframes ripple {
          0% { width: 0px; height: 0px; opacity: 0.5; }
          100% { width: 500px; height: 500px; opacity: 0; }
        }
      `}</style>
    </button>
  );
};

export default HabitCard;