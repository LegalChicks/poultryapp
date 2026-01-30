import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendUp, color = "blue" }) => {
  const colorMap: Record<string, string> = {
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  const iconColorMap: Record<string, string> = {
    amber: 'bg-amber-500/10 text-amber-600',
    yellow: 'bg-yellow-500/10 text-yellow-600',
    green: 'bg-emerald-500/10 text-emerald-600',
    blue: 'bg-blue-500/10 text-blue-600',
    rose: 'bg-rose-500/10 text-rose-600',
  };

  return (
    <div className="group bg-white p-6 rounded-3xl shadow-premium border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300 overflow-hidden relative">
      <div className="absolute top-0 right-0 -mr-4 -mt-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
         <Icon className="w-24 h-24" />
      </div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`p-3 rounded-2xl ${iconColorMap[color] || 'bg-slate-100 text-slate-600'}`}>
           <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-sm font-semibold text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{value}</h3>
        
        {trend && (
          <div className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            <span className="text-base leading-none">{trendUp ? '󰄿' : '󰅀'}</span> {trend}
          </div>
        )}
      </div>
    </div>
  );
};