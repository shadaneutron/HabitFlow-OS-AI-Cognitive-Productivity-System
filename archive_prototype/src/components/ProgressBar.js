import React from 'react';

const ProgressBar = ({ percentage }) => {
  // Use a continuous animated gradient if 100%, otherwise a sleek green/yellow gradient
  return (
    <div className="relative w-full bg-gray-800/80 rounded-full h-4 overflow-hidden border border-white/5 shadow-inner">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
          percentage === 100 
            ? 'bg-gradient-to-r from-neonGreen via-emerald-400 to-neonGreen animate-pulse-fast shadow-[0_0_10px_rgba(57,255,20,0.8)]' 
            : 'bg-gradient-to-r from-brightOrange to-neonGreen'
        }`}
        style={{ width: `${percentage}%` }}
      >
        {/* Shimmer effect inside the bar */}
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
      </div>
    </div>
  );
};

export default ProgressBar;