import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const PomodoroWidget = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-surface rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center h-full">
      <h3 className="text-sm font-bold text-textDark mb-4 w-full flex items-center gap-2">
        <span>🍅</span> Pomodoro Focus
      </h3>
      
      <div className="text-5xl font-black text-textDark tracking-tighter mb-6 font-mono">
        {formatTime(timeLeft)}
      </div>
      
      <div className="flex gap-4">
        <button 
          onClick={toggleTimer}
          className="bg-textDark text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm"
        >
          {isActive ? <Pause size={16} /> : <Play size={16} />} 
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button 
          onClick={resetTimer}
          className="p-2 border border-slate-200 text-textMuted rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
};

export default PomodoroWidget;
