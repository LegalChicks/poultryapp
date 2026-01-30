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
import { usePersistentState } from './hooks/usePersistentState';
import { Bird, InventoryItem } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = usePersistentState<boolean>('poultry_auth_status', false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Automatic Feed Consumption Logic
  useEffect(() => {
    const processAutoFeed = () => {
      try {
        const birdsJson = localStorage.getItem('poultry_birds');
        const invJson = localStorage.getItem('poultry_inventory');
        
        if (!birdsJson || !invJson) return;

        const birds: Bird[] = JSON.parse(birdsJson);
        let inventory: InventoryItem[] = JSON.parse(invJson);
        const today = new Date().toISOString().split('T')[0];
        
        const activeBirdCount = birds.reduce((acc, bird) => {
          return acc + (bird.status === 'Active' ? bird.count : 0);
        }, 0);

        let hasChanges = false;

        inventory = inventory.map(item => {
          if (item.isAutoFeed && item.dailyRatePerBird && activeBirdCount > 0) {
             // If never set (newly configured), start tracking from today without deducting yet.
             if (!item.lastAutoDeductDate) {
                 hasChanges = true;
                 return { ...item, lastAutoDeductDate: today };
             }

             // Calculate days elapsed since last deduction
             // This handles weekends/holidays by calculating the full gap in days
             if (item.lastAutoDeductDate !== today) {
                 const lastDate = new Date(item.lastAutoDeductDate);
                 const currDate = new Date(today);
                 
                 // Use UTC timestamps to ensure accurate day difference regardless of DST or timezone shifts
                 const utc1 = Date.UTC(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
                 const utc2 = Date.UTC(currDate.getFullYear(), currDate.getMonth(), currDate.getDate());
                 
                 const msPerDay = 1000 * 60 * 60 * 24;
                 const diffDays = Math.floor((utc2 - utc1) / msPerDay);
                 
                 if (diffDays > 0) {
                     const consumption = diffDays * item.dailyRatePerBird * activeBirdCount;
                     const newQty = Math.max(0, item.quantity - consumption);
                     
                     // Only log if meaningful consumption happened
                     if (consumption > 0) {
                        hasChanges = true;
                        console.log(`Auto-deducting ${consumption.toFixed(2)} ${item.unit} of ${item.name} for ${diffDays} days (${activeBirdCount} birds)`);
                        return { 
                            ...item, 
                            quantity: Number(newQty.toFixed(2)), 
                            lastAutoDeductDate: today,
                            lastUpdated: today
                        };
                     }
                 }
             }
          }
          return item;
        });

        if (hasChanges) {
            localStorage.setItem('poultry_inventory', JSON.stringify(inventory));
        }
      } catch (e) {
          console.error("Auto-feed error", e);
      }
    };

    if (isAuthenticated) {
        processAutoFeed();
    }
  }, [isAuthenticated]); // Run once when user authenticates/app loads

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
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