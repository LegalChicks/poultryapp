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
    { to: '/', icon: LayoutDashboard, label: 'Command Center' },
    { to: '/ai-tools', icon: Sparkles, label: 'Gemini AI Assistant', isAI: true },
    { to: '/flock', icon: Bird, label: 'Flock Manager' },
    { to: '/health', icon: Stethoscope, label: 'Health Records' },
    { to: '/eggs', icon: Egg, label: 'Egg Collection' },
    { to: '/incubation', icon: Thermometer, label: 'Incubation Lab' },
    { to: '/finance', icon: DollarSign, label: 'Financial Hub' },
    { to: '/inventory', icon: Package, label: 'Supplies & Inventory' },
  ];

  return (
    <aside className={`h-screen bg-[#020617] text-white fixed left-0 top-0 flex flex-col border-r border-slate-800 transition-all duration-300 z-30 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Brand Header */}
      <div className={`p-6 border-b border-slate-800 flex items-center gap-3 relative overflow-hidden`}>
        <div className="w-10 h-10 gradient-accent rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-amber-900/20">
          <Bird size={24} className="text-white" />
        </div>
        <div className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 scale-90 translate-x-10 hidden' : 'opacity-100 scale-100 translate-x-0'}`}>
          <h1 className="font-extrabold text-xl leading-none tracking-tight">PoultryPro</h1>
          <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mt-1">Systems v1.5</p>
        </div>
        
        {/* Shimmer effect for brand */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" style={{ animationDuration: '4s' }}></div>
      </div>

       {/* Collapse Toggle */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-8 bg-slate-800 text-slate-400 hover:text-white border border-slate-700 rounded-full p-1 shadow-xl transition-colors z-50 focus:outline-none"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-semibold text-sm whitespace-nowrap
              ${isActive 
                ? 'bg-amber-500/10 text-amber-500 shadow-inner-soft' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
              ${isCollapsed ? 'justify-center px-2' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={`flex-shrink-0 ${item.isAI && !isActive ? 'text-indigo-400' : ''}`} />
                <span className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100'}`}>
                  {item.label}
                </span>
                {isActive && !isCollapsed && (
                  <div className="absolute left-0 top-1/4 h-1/2 w-1 bg-amber-500 rounded-r-full shadow-lg shadow-amber-500/50"></div>
                )}
                {item.isAI && !isCollapsed && (
                   <span className="ml-auto text-[8px] font-black bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded uppercase tracking-widest border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">Beta</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-800 space-y-1">
        <NavLink 
          to="/settings"
          className={({ isActive }) =>
              `flex w-full items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-sm font-semibold whitespace-nowrap
              ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
               ${isCollapsed ? 'justify-center px-2' : ''}`
          }
        >
          <Settings size={20} className="flex-shrink-0" />
          <span className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100'}`}>System Settings</span>
        </NavLink>
        <button 
            onClick={onLogout}
            className={`flex w-full items-center gap-3 px-4 py-3.5 text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all text-sm font-semibold whitespace-nowrap ${isCollapsed ? 'justify-center px-2' : ''}`}
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100'}`}>Terminate Session</span>
        </button>
      </div>
    </aside>
  );
};