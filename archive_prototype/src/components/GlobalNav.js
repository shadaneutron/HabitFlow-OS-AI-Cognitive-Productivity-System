import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Timer, Grid, BarChart2 } from 'lucide-react';

const GlobalNav = () => {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { path: '/focus', label: 'Focus Zone', icon: <Timer size={18} /> },
    { path: '/matrix', label: 'Task Matrix', icon: <Grid size={18} /> },
    { path: '/analytics', label: 'Analytics', icon: <BarChart2 size={18} /> },
  ];

  return (
    <nav className="sticky top-0 w-full bg-surface/80 backdrop-blur-md border-b border-slate-200 z-50 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-success flex items-center justify-center text-white font-bold shadow-sm">
              H
            </div>
            <h1 className="text-xl font-bold text-textDark tracking-tight hidden sm:block">HabitFlow</h1>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto scrollbar-hide flex-1 justify-center px-4 sm:justify-end sm:flex-none">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'text-focus bg-focus/10 shadow-sm'
                      : 'text-textMuted hover:text-textDark hover:bg-slate-50'
                  }`
                }
              >
                {item.icon}
                <span className="hidden sm:block">{item.label}</span>
              </NavLink>
            ))}
          </div>
          
          <div className="hidden md:flex items-center ml-4 pl-4 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-success to-focus shadow-sm"></div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GlobalNav;
