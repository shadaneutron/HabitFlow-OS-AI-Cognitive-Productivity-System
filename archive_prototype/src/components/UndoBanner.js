import React from 'react';

const UndoBanner = ({ onUndo }) => {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 glass border border-white/10 rounded-full flex items-center shadow-2xl animate-slide-up overflow-hidden group">
      <div className="px-6 py-3 flex items-center bg-background/80 relative z-10 w-full">
        <span className="text-white font-medium mr-6">Action completed</span>
        <button
          onClick={onUndo}
          className="flex items-center text-brightOrange font-bold hover:text-white hover:bg-brightOrange/20 px-4 py-1.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brightOrange"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <span>UNDO</span>
        </button>
      </div>
      
      {/* Animated shrinking progress bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-brightOrange animate-shrink-x origin-left z-20 rounded-full"></div>
    </div>
  );
};

export default UndoBanner;