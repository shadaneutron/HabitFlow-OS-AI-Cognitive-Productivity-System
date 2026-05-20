import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, Timer, Grid, BookOpen, Plus, Settings } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { label: 'Dashboard', icon: <Home size={18} />, path: '/dashboard' },
    { label: 'Habits', icon: <CheckSquare size={18} />, path: '/habits' },
    { label: 'Pomodoro', icon: <Timer size={18} />, path: '/focus' },
    { label: 'Eisenhower', icon: <Grid size={18} />, path: '/matrix' },
    { label: 'Journal', icon: <BookOpen size={18} />, path: '/analytics' },
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-surface border-r border-slate-200 flex flex-col pt-6 pb-6 shadow-sm z-50">
      {/* Student Profile */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-textDark border border-slate-300">
          S
        </div>
        <div>
          <h2 className="text-sm font-bold text-textDark">Student Workspace</h2>
          <p className="text-xs text-textMuted">Free Plan</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 space-y-1">
        <p className="px-2 text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Workspace</p>
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-slate-100 text-textDark font-semibold' 
                  : 'text-textMuted hover:bg-slate-50 hover:text-textDark'
              }`
            }
          >
            <span className="text-slate-400">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Add Button & Settings */}
      <div className="px-4 mt-auto space-y-2">
        <NavLink 
          to="/integration"
          className={({ isActive }) => 
            `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive 
                ? 'bg-slate-100 text-textDark font-semibold' 
                : 'text-textMuted hover:bg-slate-50 hover:text-textDark'
            }`
          }
        >
          <span className="text-slate-400"><Settings size={18} /></span>
          Integrations & Settings
        </NavLink>
        <button className="w-full flex items-center gap-2 justify-center px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-textDark hover:bg-slate-50 transition-colors shadow-sm mt-2">
          <Plus size={16} /> Add New Task
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
