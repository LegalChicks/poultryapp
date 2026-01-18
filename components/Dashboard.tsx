import React, { useMemo } from 'react';
import { Bird, Egg, DollarSign, Activity } from 'lucide-react';
import { StatCard } from './StatCard';
import { MOCK_BIRDS, MOCK_EGG_LOG, MOCK_TRANSACTIONS } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TransactionType } from '../types';

export const Dashboard: React.FC = () => {
  const totalBirds = MOCK_BIRDS.length;
  const activeHens = MOCK_BIRDS.filter(b => b.stage === 'Hen' && b.status === 'Active').length;
  
  const today = new Date().toISOString().split('T')[0];
  const todaysEggs = MOCK_EGG_LOG.find(l => l.date === today)?.count || 0;
  
  const totalIncome = MOCK_TRANSACTIONS
    .filter(t => t.type === TransactionType.Income)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const chartData = useMemo(() => {
    return [...MOCK_EGG_LOG].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Farm Overview</h1>
          <p className="text-gray-500">Welcome back to PoultryPro.</p>
        </div>
        <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          + Quick Log Eggs
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Flock" 
          value={totalBirds} 
          icon={Bird} 
          trend={`${activeHens} Active Hens`}
          trendUp={true}
          color="amber"
        />
        <StatCard 
          title="Today's Eggs" 
          value={todaysEggs} 
          icon={Egg} 
          trend="Target: 14" 
          trendUp={todaysEggs >= 14}
          color="yellow"
        />
        <StatCard 
          title="Monthly Income" 
          value={`$${totalIncome}`} 
          icon={DollarSign} 
          trend="+12% vs last month"
          trendUp={true}
          color="green"
        />
        <StatCard 
          title="Avg Hatch Rate" 
          value="85%" 
          icon={Activity} 
          trend="Last batch"
          trendUp={true}
          color="blue"
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Egg Production Trend</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEggs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Area type="monotone" dataKey="count" stroke="#d97706" strokeWidth={2} fillOpacity={1} fill="url(#colorEggs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Alerts/Tasks */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Pending Tasks</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="w-2 h-2 mt-2 bg-red-500 rounded-full flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">Restock Layer Pellets</p>
                <p className="text-xs text-gray-500">Inventory low (50kg remaining)</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
               <div className="w-2 h-2 mt-2 bg-amber-500 rounded-full flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">Candle Batch #Inc-1</p>
                <p className="text-xs text-gray-500">Day 10 Check required</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
               <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">Clean Coop B</p>
                <p className="text-xs text-gray-500">Scheduled maintenance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};