import React, { useState, useEffect } from 'react';

const Header = () => {
  // In a real app, this would come from user data
  const userName = "Alex";

  // Motivational messages that rotate
  const motivationalMessages = [
    "Great job yesterday! Keep building momentum! 🚀",
    "Small habits, big results! 🌱",
    "You're on a roll! Keep it up! ⚡",
    "Consistency is key! 🔑",
    "Every day is a new opportunity! 🌅",
    "Progress, not perfection! 🎯"
  ];

  const [message, setMessage] = useState(motivationalMessages[0]);

  // Use useEffect to set a random message on mount to avoid hydration mismatch if SSR (though this is CRA)
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
    setMessage(motivationalMessages[randomIndex]);
  }, []);

  return (
    <header className="glass sticky top-0 z-50 shadow-xl border-b border-white/5 py-4 mb-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          
          {/* Logo & Greeting */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neonGreen to-emerald-600 flex items-center justify-center text-background font-bold text-xl shadow-[0_0_15px_rgba(57,255,20,0.3)]">
                  H
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">HabitFlow</h1>
              </div>
              <p className="text-gray-300 mt-2 text-lg font-medium">Ready to crush it today, <span className="text-neonGreen font-semibold">{userName}</span>?</p>
            </div>
            {/* Mobile Avatar */}
            <div className="md:hidden">
              <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden shadow-lg">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt="User Avatar" />
              </div>
            </div>
          </div>

          {/* Motivational Message */}
          <div className="mt-6 md:mt-0 md:text-right flex items-center gap-4">
            <div className="bg-white/5 px-6 py-3 rounded-full border border-white/10 shadow-inner">
              <p className="text-gray-200 text-sm md:text-base font-medium animate-pulse-fast">{message}</p>
            </div>
            
            {/* Desktop Avatar & Level System */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-brightOrange uppercase tracking-wider">Level 5</span>
                <span className="text-xs text-gray-400 font-medium">1,250 / 2,000 XP</span>
              </div>
              <div className="relative cursor-pointer group">
                {/* SVG Progress Ring for Leveling */}
                <svg className="w-16 h-16 transform -rotate-90 absolute -top-1 -left-1 drop-shadow-[0_0_8px_rgba(255,149,0,0.5)] transition-transform duration-500 group-hover:scale-105" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="transparent" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="4" />
                  <circle cx="50" cy="50" r="46" fill="transparent" stroke="#FF9500" strokeWidth="4" strokeDasharray="289" strokeDashoffset="108" strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="w-14 h-14 rounded-full border-2 border-background bg-gray-800 overflow-hidden shadow-lg transition-transform duration-500 group-hover:scale-105 relative z-10">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt="User Avatar" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;