import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { PlusCircle, Trash2 } from 'lucide-react';

const TaskMatrix = () => {
  const { matrixTasks, updateTaskQuadrant, addMatrixTask, deleteMatrixTask } = useHabits();
  const [newTaskInput, setNewTaskInput] = useState('');

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (e, quadrant) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      updateTaskQuadrant(parseInt(taskId), quadrant);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTaskInput.trim()) {
      // Default to important-not-urgent quadrant
      addMatrixTask(newTaskInput, 'important-not-urgent');
      setNewTaskInput('');
    }
  };

  const Quadrant = ({ id, title, subtitle, bgColor, borderColor, textColor }) => {
    const tasks = matrixTasks.filter(t => t.quadrant === id);
    
    return (
      <div 
        className={`rounded-2xl p-6 border-2 transition-colors min-h-[250px] flex flex-col shadow-sm ${bgColor} ${borderColor}`}
        onDrop={(e) => handleDrop(e, id)}
        onDragOver={handleDragOver}
      >
        <div className="mb-4">
          <h3 className={`font-bold text-lg ${textColor}`}>{title}</h3>
          <p className="text-xs font-semibold uppercase tracking-wider text-textMuted">{subtitle}</p>
        </div>
        
        <div className="flex-1 space-y-3">
          {tasks.map(task => (
            <div 
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, task.id)}
              className="bg-surface p-3 rounded-xl border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group flex justify-between items-start"
            >
              <span className="text-sm font-medium text-textDark pr-2">{task.content}</span>
              <button 
                onClick={() => deleteMatrixTask(task.id)}
                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="h-full w-full flex items-center justify-center pt-8">
              <span className="text-slate-300 text-sm italic">Drop tasks here</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-textDark pb-24 md:pb-12 pt-8 p-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-6 animate-slide-up">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-textDark">Eisenhower Matrix</h1>
            <p className="text-textMuted text-lg">Prioritize tasks by urgency and importance.</p>
          </div>
          
          <form onSubmit={handleAddTask} className="flex gap-2 w-full md:w-96">
            <input 
              type="text" 
              value={newTaskInput}
              onChange={(e) => setNewTaskInput(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 bg-surface border border-slate-200 rounded-xl px-4 py-2 text-textDark focus:outline-none focus:ring-2 focus:ring-focus/50 transition-all shadow-sm"
            />
            <button 
              type="submit"
              className="bg-focus text-white p-2 px-4 rounded-xl hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center gap-2 font-bold"
            >
              <PlusCircle size={20} /> <span className="hidden sm:inline">Add</span>
            </button>
          </form>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
          <Quadrant 
            id="urgent-important" 
            title="Do Now" 
            subtitle="Urgent & Important"
            bgColor="bg-amber-50" 
            borderColor="border-amber-200"
            textColor="text-amber-700"
          />
          <Quadrant 
            id="important-not-urgent" 
            title="Schedule" 
            subtitle="Important, Not Urgent"
            bgColor="bg-blue-50" 
            borderColor="border-blue-200"
            textColor="text-blue-700"
          />
          <Quadrant 
            id="urgent-not-important" 
            title="Delegate" 
            subtitle="Urgent, Not Important"
            bgColor="bg-emerald-50" 
            borderColor="border-emerald-200"
            textColor="text-emerald-700"
          />
          <Quadrant 
            id="neither" 
            title="Eliminate" 
            subtitle="Neither"
            bgColor="bg-slate-100" 
            borderColor="border-slate-200"
            textColor="text-slate-600"
          />
        </div>

      </div>
    </div>
  );
};

export default TaskMatrix;
