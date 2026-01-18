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
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        {trend && (
          <p className={`text-xs mt-2 font-medium ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
            {trend}
          </p>
        )}
      </div>
      <div className={`p-4 rounded-full bg-${color}-50`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
  );
};