import React from 'react';
import { useHabits } from '../context/HabitContext';

const MatrixWidget = () => {
  const { matrixTasks } = useHabits();

  const Quadrant = ({ id, title, bgColor, textColor }) => {
    const tasks = matrixTasks.filter(t => t.quadrant === id).slice(0, 2); // Show only top 2
    return (
      <div className={`p-3 rounded-lg border border-slate-200 shadow-sm ${bgColor}`}>
        <h4 className={`text-xs font-bold mb-2 ${textColor}`}>{title}</h4>
        <div className="space-y-2">
          {tasks.length > 0 ? tasks.map(task => (
            <div key={task.id} className="bg-surface text-xs font-medium text-textDark p-2 rounded border border-slate-100 truncate shadow-sm">
              {task.content}
            </div>
          )) : (
            <div className="text-[10px] text-slate-400 italic py-1">Empty</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-surface rounded-xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
      <h3 className="text-sm font-bold text-textDark mb-4 flex items-center gap-2">
        <span>🗂️</span> Eisenhower Matrix
      </h3>
      
      <div className="grid grid-cols-2 gap-3 flex-1">
        <Quadrant id="urgent-important" title="Do Now" bgColor="bg-[#FEF3C7]" textColor="text-amber-800" />
        <Quadrant id="important-not-urgent" title="Schedule" bgColor="bg-[#DBEAFE]" textColor="text-blue-800" />
        <Quadrant id="urgent-not-important" title="Delegate" bgColor="bg-[#D1FAE5]" textColor="text-emerald-800" />
        <Quadrant id="neither" title="Eliminate" bgColor="bg-slate-50" textColor="text-slate-600" />
      </div>
    </div>
  );
};

export default MatrixWidget;
