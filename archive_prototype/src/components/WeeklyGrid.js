import React from 'react';

const WeeklyGrid = ({ data }) => {
  // Current day index (0 = Sunday, 1 = Monday, etc.)
  const today = new Date().getDay();

  // Mock trend data points for the SVG chart (0 to 100)
  // We'll map these to a 0-40 y-axis scale for the sparkline
  const trendPoints = [40, 60, 30, 80, 100, 50, 90];
  
  // Calculate SVG path based on points
  // Width: 100%, Height: 60px
  // Let's assume a 7-point width of 600px internally
  const xStep = 100; 
  const pointsString = trendPoints.map((val, i) => {
    const x = i * xStep;
    const y = 60 - (val / 100) * 50; // Invert Y, max height 50
    return `${x},${y}`;
  }).join(' L ');

  const pathD = `M 0,${60 - (trendPoints[0] / 100) * 50} L ${pointsString}`;
  // For the gradient fill area
  const areaD = `${pathD} L 600,60 L 0,60 Z`;

  return (
    <div className="glass p-6 rounded-3xl border border-white/5 shadow-xl">
      {/* Analytics Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📈</span> Completion Trend
          </h3>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">+15% vs last week</p>
        </div>
        <div className="px-3 py-1 bg-neonGreen/20 text-neonGreen rounded-lg text-sm font-bold">
          Excellent
        </div>
      </div>

      {/* SVG Trend Sparkline */}
      <div className="w-full h-20 mb-8 relative">
        <svg viewBox="0 0 600 60" className="w-full h-full overflow-visible drop-shadow-lg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#39FF14" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#39FF14" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#FF9500" />
              <stop offset="100%" stopColor="#39FF14" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#trendGradient)" className="animate-pulse-fast" />
          <path d={pathD} fill="none" stroke="url(#lineGradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" 
                style={{ strokeDasharray: 1000, strokeDashoffset: 0, animation: 'dash 3s ease-out forwards' }} />
          
          {/* Data points */}
          {trendPoints.map((val, i) => (
            <circle key={i} cx={i * xStep} cy={60 - (val / 100) * 50} r="5" fill="#121212" stroke="#39FF14" strokeWidth="3" className="transition-transform duration-300 hover:scale-150 cursor-pointer" />
          ))}
        </svg>
        <style>{`
          @keyframes dash {
            from { stroke-dashoffset: 1000; }
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      </div>

      {/* Day Grid */}
      <div className="flex justify-between items-center px-2">
        {data.map((dayData, index) => {
          // Determine the status color
          let bgColor = 'bg-white/5 border-white/10 text-gray-400'; // Default (future days)
          let glowColor = '';
          if (dayData.completed) {
            bgColor = 'bg-neonGreen/20 border-neonGreen text-neonGreen shadow-[0_0_10px_rgba(57,255,20,0.4)] scale-110'; // Completed
            glowColor = 'bg-neonGreen shadow-[0_0_5px_rgba(57,255,20,0.8)]';
          } else if (index < today) {
            bgColor = 'bg-softRed/20 border-softRed text-softRed'; // Missed
            glowColor = 'bg-softRed';
          }

          // Highlight current day
          const isToday = index === today;
          const ring = isToday ? 'ring-2 ring-white ring-offset-4 ring-offset-background' : '';

          return (
            <div key={index} className="flex flex-col items-center gap-4">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border ${bgColor} ${ring} flex items-center justify-center transition-all duration-500 hover:scale-125 hover:-translate-y-2 cursor-pointer relative group`}>
                {/* Inner glowing dot */}
                <div className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full ${glowColor} opacity-70 group-hover:opacity-100 transition-opacity`}></div>
                {dayData.completed ? (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                ) : (
                  <span className="font-extrabold text-lg sm:text-xl">{dayData.day}</span>
                )}
              </div>
              <span className={`text-sm font-bold ${isToday ? 'text-white' : 'text-gray-500'}`}>{dayData.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyGrid;