import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Bird, Egg, Thermometer, DollarSign, Package, Settings, LogOut, Stethoscope, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar, onLogout }) => {
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
    <aside className={`h-screen bg-gray-900 text-white fixed left-0 top-0 flex flex-col border-r border-gray-800 transition-all duration-300 z-20 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`p-6 border-b border-gray-800 flex items-center justify-between relative`}>
        <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-10 h-10 bg-amber-600 rounded-lg flex-shrink-0 flex items-center justify-center">
            <Bird size={24} className="text-white" />
          </div>
          <div className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
            <h1 className="font-bold text-lg leading-tight whitespace-nowrap">PoultryPro</h1>
            <p className="text-xs text-gray-400 whitespace-nowrap">Farm Manager</p>
          </div>
        </div>
      </div>

       {/* Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-9 bg-gray-800 text-gray-400 hover:text-white border border-gray-700 rounded-full p-1 shadow-md transition-colors z-50 focus:outline-none"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm whitespace-nowrap
              ${isActive 
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
              ${isCollapsed ? 'justify-center px-2' : ''}`
            }
            title={isCollapsed ? item.label : ''}
          >
            <item.icon size={20} className="flex-shrink-0" />
            <span className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-1 overflow-x-hidden">
        <NavLink 
          to="/settings"
          className={({ isActive }) =>
              `flex w-full items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium whitespace-nowrap
              ${isActive 
                ? 'text-white bg-gray-800' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'}
               ${isCollapsed ? 'justify-center px-2' : ''}`
          }
           title={isCollapsed ? "Settings" : ""}
        >
          <Settings size={20} className="flex-shrink-0" />
          <span className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>Settings</span>
        </NavLink>
        <button 
            onClick={onLogout}
            className={`flex w-full items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium whitespace-nowrap ${isCollapsed ? 'justify-center px-2' : ''}`}
             title={isCollapsed ? "Sign Out" : ""}
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};