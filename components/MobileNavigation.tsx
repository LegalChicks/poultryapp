import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Bird, Egg, DollarSign, Menu, X, Sparkles, Stethoscope, Thermometer, Package, Settings, LogOut } from 'lucide-react';

interface MobileNavigationProps {
  onLogout: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mainLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Home' },
    { to: '/flock', icon: Bird, label: 'Flock' },
    { to: '/eggs', icon: Egg, label: 'Eggs' },
    { to: '/finance', icon: DollarSign, label: 'Cash' },
  ];

  const menuLinks = [
    { to: '/ai-tools', icon: Sparkles, label: 'AI Assistant', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { to: '/health', icon: Stethoscope, label: 'Health', color: 'text-rose-600', bg: 'bg-rose-50' },
    { to: '/incubation', icon: Thermometer, label: 'Incubation', color: 'text-amber-600', bg: 'bg-amber-50' },
    { to: '/inventory', icon: Package, label: 'Inventory', color: 'text-blue-600', bg: 'bg-blue-50' },
    { to: '/settings', icon: Settings, label: 'Settings', color: 'text-gray-700', bg: 'bg-gray-100' },
  ];

  const NavItem = ({ to, icon: Icon, label }: any) => (
    <NavLink 
      to={to} 
      className={({ isActive }) => `flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all flex-1
        ${isActive ? 'text-black font-bold' : 'text-gray-500 hover:text-black font-medium'}`
      }
    >
      <Icon size={24} strokeWidth={2} />
      <span className="text-[10px] tracking-tight">{label}</span>
    </NavLink>
  );

  return (
    <>
      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-3 py-2 flex justify-between items-center z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        {mainLinks.map(link => (
          <NavItem key={link.to} {...link} />
        ))}
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="flex flex-col items-center gap-1.5 p-2 text-gray-500 hover:text-black flex-1 font-medium"
        >
          <Menu size={24} strokeWidth={2} />
          <span className="text-[10px] tracking-tight">Menu</span>
        </button>
      </div>

      {/* Full Screen Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-bottom-10 duration-200">
          <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white">
            <div>
              <h2 className="text-2xl font-black text-black tracking-tight">PoultryPro</h2>
              <p className="text-gray-500 text-sm font-medium">Mobile Manager</p>
            </div>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-2 bg-gray-100 rounded-full text-black hover:bg-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pb-24 bg-gray-50/50">
            <div className="grid grid-cols-2 gap-4">
              {menuLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) => 
                    `flex flex-col items-center justify-center p-6 rounded-2xl border transition-all gap-4 shadow-sm
                    ${isActive 
                      ? 'bg-white border-black ring-1 ring-black shadow-md' 
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'}`
                  }
                >
                  <div className={`p-3 rounded-xl ${link.bg}`}>
                    <link.icon size={28} className={link.color} strokeWidth={2} />
                  </div>
                  <span className="text-black font-bold text-sm">{link.label}</span>
                </NavLink>
              ))}
            </div>

             <div className="mt-8">
               <button 
                 onClick={onLogout}
                 className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-white text-red-600 font-bold border border-red-100 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
               >
                 <LogOut size={20} />
                 Sign Out
               </button>
             </div>
             
             <div className="mt-8 text-center">
               <span className="px-3 py-1 rounded-full bg-gray-200/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
                 Version 1.5.0
               </span>
             </div>
          </div>
        </div>
      )}
    </>
  );
};