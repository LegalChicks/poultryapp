import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { FlockManager } from './components/FlockManager';
import { Incubation } from './components/Incubation';
import { Finance } from './components/Finance';
import { InventoryManager } from './components/InventoryManager';
import { HealthManager } from './components/HealthManager';
import { EggLogManager } from './components/EggLogManager';
import { Settings } from './components/Settings';
import { AIHub } from './components/AIHub';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex bg-gray-50 font-sans">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ai-tools" element={<AIHub />} />
              <Route path="/flock" element={<FlockManager />} />
              <Route path="/health" element={<HealthManager />} />
              <Route path="/eggs" element={<EggLogManager />} />
              <Route path="/incubation" element={<Incubation />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/inventory" element={<InventoryManager />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;