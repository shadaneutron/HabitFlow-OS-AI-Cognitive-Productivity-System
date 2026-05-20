import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, TrendingUp, CheckCircle } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-textWarm flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-3xl animate-slide-up">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-success to-successDark">
          Master your habits,<br/>ace your studies.
        </h1>
        <p className="text-xl md:text-2xl text-textMuted mb-12">
          HabitFlow is the simple, powerful way for students to build routines that stick.
        </p>
        
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-success text-background font-bold text-xl py-4 px-12 rounded-full hover:shadow-[0_0_20px_rgba(163,230,181,0.4)] transition-all duration-300 hover:-translate-y-1"
        >
          Get Started
        </button>
      </div>

      <div className="mt-32 max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up" style={{animationDelay: '0.2s'}}>
        <div className="bg-card p-8 rounded-3xl border border-white/5 text-left">
          <div className="w-14 h-14 rounded-full bg-success/10 text-success flex items-center justify-center mb-6">
            <Target size={28} />
          </div>
          <h3 className="text-2xl font-bold mb-3">1. Add Habit</h3>
          <p className="text-textMuted leading-relaxed">
            Set clear, achievable goals. Whether it's studying, exercising, or hydrating, track what matters to you.
          </p>
        </div>
        
        <div className="bg-card p-8 rounded-3xl border border-white/5 text-left">
          <div className="w-14 h-14 rounded-full bg-success/10 text-success flex items-center justify-center mb-6">
            <CheckCircle size={28} />
          </div>
          <h3 className="text-2xl font-bold mb-3">2. Track Daily</h3>
          <p className="text-textMuted leading-relaxed">
            Check off your habits each day with satisfying, large touch targets designed for quick logging.
          </p>
        </div>

        <div className="bg-card p-8 rounded-3xl border border-white/5 text-left">
          <div className="w-14 h-14 rounded-full bg-success/10 text-success flex items-center justify-center mb-6">
            <TrendingUp size={28} />
          </div>
          <h3 className="text-2xl font-bold mb-3">3. Build Streaks</h3>
          <p className="text-textMuted leading-relaxed">
            Watch your progress grow. Maintain your streaks and review your analytics to stay motivated.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
