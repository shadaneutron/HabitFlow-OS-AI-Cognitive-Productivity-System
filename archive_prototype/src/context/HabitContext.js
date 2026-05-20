import React, { createContext, useContext, useState, useEffect } from 'react';

const HabitContext = createContext();
const API_URL = 'http://localhost:5000/api';

export const HabitProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);
  const [matrixTasks, setMatrixTasks] = useState([]);
  const [streak, setStreak] = useState(0);

  // Fetch initial data
  useEffect(() => {
    fetchHabits();
    fetchTasks();
  }, []);

  const fetchHabits = async () => {
    try {
      const res = await fetch(`${API_URL}/habits`);
      const data = await res.json();
      setHabits(data);
      calculateStreak(data);
    } catch (err) {
      console.error("Failed to fetch habits", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_URL}/tasks`);
      const data = await res.json();
      setMatrixTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  const calculateStreak = (currentHabits) => {
    const allDone = currentHabits.length > 0 && currentHabits.every(h => h.completed);
    setStreak(allDone ? 12 : 11); // Simplified mock streak logic for now
  };

  const addHabit = async (name, category) => {
    try {
      const res = await fetch(`${API_URL}/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category })
      });
      const newHabit = await res.json();
      setHabits([...habits, newHabit]);
    } catch (err) {
      console.error("Failed to add habit", err);
    }
  };

  const toggleHabit = async (id) => {
    try {
      const res = await fetch(`${API_URL}/habits/${id}/toggle`, { method: 'PUT' });
      const data = await res.json();
      setHabits(habits.map(h => 
        h.id === id ? { ...h, completed: data.completed } : h
      ));
    } catch (err) {
      console.error("Failed to toggle habit", err);
    }
  };

  const deleteHabit = async (id) => {
    try {
      await fetch(`${API_URL}/habits/${id}`, { method: 'DELETE' });
      setHabits(habits.filter(h => h.id !== id));
    } catch (err) {
      console.error("Failed to delete habit", err);
    }
  };

  const addMatrixTask = async (content, quadrant) => {
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, quadrant })
      });
      const newTask = await res.json();
      setMatrixTasks([...matrixTasks, newTask]);
    } catch (err) {
      console.error("Failed to add task", err);
    }
  };

  const updateTaskQuadrant = async (id, newQuadrant) => {
    try {
      await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quadrant: newQuadrant })
      });
      setMatrixTasks(matrixTasks.map(t => 
        t.id === id ? { ...t, quadrant: newQuadrant } : t
      ));
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  const deleteMatrixTask = async (id) => {
    try {
      await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
      setMatrixTasks(matrixTasks.filter(t => t.id !== id));
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const calculateCompletion = () => {
    if (habits.length === 0) return 0;
    const completed = habits.filter(h => h.completed).length;
    return Math.round((completed / habits.length) * 100);
  };

  return (
    <HabitContext.Provider value={{
      habits,
      streak,
      matrixTasks,
      addHabit,
      toggleHabit,
      deleteHabit,
      addMatrixTask,
      updateTaskQuadrant,
      deleteMatrixTask,
      calculateCompletion
    }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => useContext(HabitContext);
