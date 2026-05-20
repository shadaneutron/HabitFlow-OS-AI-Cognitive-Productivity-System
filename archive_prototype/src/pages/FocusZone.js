import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, Coffee } from 'lucide-react';

const FocusZone = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' or 'break'

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play a sound or show a notification here in a real app
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = mode === 'focus' 
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-textDark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Subtle ambient background elements */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 pointer-events-none transition-colors duration-1000 ${
        mode === 'focus' ? 'bg-focus' : 'bg-success'
      }`}></div>

      <div className="z-10 text-center animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">Focus Zone</h1>
        <p className="text-textMuted mb-12">Deep work without distractions.</p>

        {/* Mode Switcher */}
        <div className="flex justify-center gap-4 mb-10">
          <button 
            onClick={() => switchMode('focus')}
            className={`px-6 py-2 rounded-full font-semibold transition-all shadow-sm ${
              mode === 'focus' 
                ? 'bg-focus text-white' 
                : 'bg-surface text-textMuted hover:bg-slate-50 border border-slate-200'
            }`}
          >
            Pomodoro (25m)
          </button>
          <button 
            onClick={() => switchMode('break')}
            className={`px-6 py-2 rounded-full font-semibold transition-all shadow-sm ${
              mode === 'break' 
                ? 'bg-success text-white' 
                : 'bg-surface text-textMuted hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Coffee size={16} className="inline mr-2" /> Short Break (5m)
          </button>
        </div>

        {/* Timer Circle */}
        <div className="relative w-80 h-80 mx-auto mb-12 flex items-center justify-center bg-surface rounded-full shadow-lg border border-slate-100">
          <svg className="absolute w-full h-full transform -rotate-90 pointer-events-none p-4">
            <circle cx="160" cy="160" r="140" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
            <circle 
              cx="160" cy="160" r="140" stroke="currentColor" strokeWidth="8" fill="transparent" 
              strokeDasharray={880}
              strokeDashoffset={880 - (880 * progressPercentage) / 100}
              className={`${mode === 'focus' ? 'text-focus' : 'text-success'} transition-all duration-1000 ease-linear`} 
            />
          </svg>
          
          <div className="flex flex-col items-center">
            <span className="text-7xl font-extrabold tracking-tighter text-textDark mb-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-sm font-bold text-textMuted uppercase tracking-widest">
              {mode === 'focus' ? 'Focusing' : 'Resting'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-6 mb-16">
          <button 
            onClick={toggleTimer}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-md hover:-translate-y-1 transition-all ${
              mode === 'focus' ? 'bg-focus hover:bg-blue-600' : 'bg-success hover:bg-emerald-600'
            }`}
          >
            {isActive ? <Pause size={32} /> : <Play size={32} className="ml-2" />}
          </button>
          
          <button 
            onClick={resetTimer}
            className="w-20 h-20 rounded-full flex items-center justify-center bg-surface text-textMuted border border-slate-200 hover:bg-slate-50 hover:text-textDark shadow-sm hover:-translate-y-1 transition-all"
          >
            <RefreshCw size={28} />
          </button>
        </div>

        {/* Current Task Indicator */}
        <div className="bg-surface/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm inline-block min-w-[300px]">
          <p className="text-xs font-bold text-textMuted uppercase tracking-wider mb-2">Current Task</p>
          <p className="text-lg font-semibold text-textDark">Finish HCI essay draft</p>
        </div>

      </div>
    </div>
  );
};

export default FocusZone;
