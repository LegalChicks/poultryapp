import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MobileNavigation } from './components/MobileNavigation';
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
import { Login } from './components/Login';
import { AutoDeductController } from './components/AutoDeductController';
import { usePersistentState } from './hooks/usePersistentState';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = usePersistentState<boolean>('poultry_auth_status', false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      {/* Background Controller for Inventory Logic */}
      <AutoDeductController />

      <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sidebar 
            isCollapsed={isSidebarCollapsed} 
            toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            onLogout={() => setIsAuthenticated(false)}
          />
        )}

        {/* Content Area */}
        <div className={`flex-1 transition-all duration-300 ${!isMobile ? (isSidebarCollapsed ? 'ml-20' : 'ml-64') : 'mb-20'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        </div>
        
        {/* Mobile Navigation */}
        {isMobile && <MobileNavigation onLogout={() => setIsAuthenticated(false)} />}
      </div>
    </Router>
  );
};

export default App;