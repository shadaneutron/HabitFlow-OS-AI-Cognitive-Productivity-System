import React from 'react';

const StreakCounter = ({ days }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 glass rounded-2xl h-full shadow-lg group transition-transform hover:scale-105 duration-300">
      <div className="relative">
        <div className="absolute inset-0 bg-brightOrange/20 blur-xl rounded-full animate-pulse-fast"></div>
        <div className="text-7xl mb-3 relative z-10 drop-shadow-[0_0_15px_rgba(255,149,0,0.8)] transform group-hover:scale-110 transition-transform duration-300">
          🔥
        </div>
      </div>
      <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brightOrange to-yellow-400 drop-shadow-sm mb-1">
        {days} Days
      </div>
      <p className="text-gray-400 font-medium tracking-wide uppercase text-sm">Current streak</p>
    </div>
  );
};

export default StreakCounter;