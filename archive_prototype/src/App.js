import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HabitProvider } from './context/HabitContext';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import HabitsPage from './pages/HabitsPage';
import FocusZone from './pages/FocusZone';
import TaskMatrix from './pages/TaskMatrix';
import AnalyticsPage from './pages/AnalyticsPage';
import IntegrationPage from './pages/IntegrationPage';

const AppContent = () => {
  return (
    <div className="min-h-screen bg-background text-textDark font-sans selection:bg-focus/20 selection:text-textDark flex">
      <Sidebar />
      <main className="flex-1 ml-64">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/habits" element={<HabitsPage />} />
          <Route path="/focus" element={<FocusZone />} />
          <Route path="/matrix" element={<TaskMatrix />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/integration" element={<IntegrationPage />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <HabitProvider>
      <Router>
        <AppContent />
      </Router>
    </HabitProvider>
  );
}

export default App;