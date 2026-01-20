import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Bird, Egg, Thermometer, DollarSign, Package, Settings, LogOut, Stethoscope, Sparkles } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/ai-tools', icon: Sparkles, label: 'AI Assistant' },
    { to: '/flock', icon: Bird, label: 'Flock' },
    { to: '/health', icon: Stethoscope, label: 'Health Records' },
    { to: '/eggs', icon: Egg, label: 'Egg Logs' },
    { to: '/incubation', icon: Thermometer, label: 'Incubation' },
    { to: '/finance', icon: DollarSign, label: 'Finance' },
    { to: '/inventory', icon: Package, label: 'Inventory' },
  ];

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white fixed left-0 top-0 flex flex-col border-r border-gray-800">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
            <Bird size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">PoultryPro</h1>
            <p className="text-xs text-gray-400">Farm Manager</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm
              ${isActive 
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-1">
        <NavLink 
          to="/settings"
          className={({ isActive }) =>
              `flex w-full items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
              ${isActive 
                ? 'text-white bg-gray-800' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'}`
          }
        >
          <Settings size={20} />
          Settings
        </NavLink>
        <button className="flex w-full items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium">
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};