import React, { useMemo } from 'react';
import { Bird as BirdIcon, Egg, DollarSign, Activity, AlertCircle, Package, CheckSquare, Trash2, Check } from 'lucide-react';
import { StatCard } from './StatCard';
import { MOCK_BIRDS, MOCK_EGG_LOG, MOCK_TRANSACTIONS, MOCK_INVENTORY, MOCK_INCUBATION } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TransactionType, Bird, EggLogEntry, Transaction, InventoryItem, IncubationBatch, ManualTask } from '../types';
import { usePersistentState } from '../hooks/usePersistentState';

export const Dashboard: React.FC = () => {
  // Load persistent data using the same keys as the managers
  const [birds] = usePersistentState<Bird[]>('poultry_birds', MOCK_BIRDS);
  const [eggLogs] = usePersistentState<EggLogEntry[]>('poultry_eggs', MOCK_EGG_LOG);
  const [transactions] = usePersistentState<Transaction[]>('poultry_finance', MOCK_TRANSACTIONS);
  const [inventory] = usePersistentState<InventoryItem[]>('poultry_inventory', MOCK_INVENTORY);
  const [incubations] = usePersistentState<IncubationBatch[]>('poultry_incubation', MOCK_INCUBATION);
  const [manualTasks, setManualTasks] = usePersistentState<ManualTask[]>('poultry_tasks', []);

  // 1. Flock Stats
  const totalBirds = birds
    .filter(b => b.status === 'Active')
    .reduce((acc, curr) => acc + curr.count, 0);
  
  const activeHens = birds
    .filter(b => b.stage === 'Hen' && b.status === 'Active')
    .reduce((acc, curr) => acc + curr.count, 0);

  // 2. Egg Stats
  const today = new Date().toISOString().split('T')[0];
  // Sum all logs for today, as there might be separate logs for different breeds
  const todaysEggs = eggLogs
    .filter(l => l.date === today)
    .reduce((acc, curr) => acc + curr.count, 0);
  
  // 3. Finance Stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyIncome = transactions
    .filter(t => {
      const d = new Date(t.date);
      return t.type === TransactionType.Income && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, curr) => acc + curr.amount, 0);

  // 4. Incubation Stats
  // Find the most recent finished batch
  const recentHatch = [...incubations]
      .filter(i => i.status === 'Hatched' || i.status === 'Failed')
      .sort((a,b) => new Date(b.projectedHatchDate).getTime() - new Date(a.projectedHatchDate).getTime())[0];
      
  const hatchRate = recentHatch && recentHatch.fertileCount 
    ? Math.round(((recentHatch.hatchedCount || 0) / recentHatch.fertileCount) * 100) 
    : 0;

  // 5. Chart Data (Last 14 days, aggregated)
  const chartData = useMemo(() => {
    // Group by date first
    const grouped = eggLogs.reduce((acc, log) => {
        acc[log.date] = (acc[log.date] || 0) + log.count;
        return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort
    return Object.entries(grouped)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-14);
  }, [eggLogs]);

  // 6. Dynamic Tasks / Alerts
  const lowStockItems = inventory.filter(i => i.quantity <= i.restockThreshold);
  
  const activeIncubations = incubations.filter(i => i.status === 'Incubating').map(batch => {
      const start = new Date(batch.startDate);
      const now = new Date();
      const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return { ...batch, daysElapsed: diff };
  });

  const completeTask = (taskId: string) => {
      setManualTasks(manualTasks.filter(t => t.id !== taskId));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Farm Overview</h1>
          <p className="text-gray-500">Welcome back to PoultryPro.</p>
        </div>
        <button 
            onClick={() => window.location.hash = '#/eggs'}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          + Quick Log Eggs
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Flock" 
          value={totalBirds} 
          icon={BirdIcon} 
          trend={`${activeHens} Active Hens`}
          trendUp={true}
          color="amber"
        />
        <StatCard 
          title="Today's Eggs" 
          value={todaysEggs} 
          icon={Egg} 
          trend="Target: 14" 
          trendUp={todaysEggs >= 10}
          color="yellow"
        />
        <StatCard 
          title="Monthly Income" 
          value={`$${monthlyIncome.toFixed(0)}`} 
          icon={DollarSign} 
          trend="Current Month"
          trendUp={true}
          color="green"
        />
        <StatCard 
          title="Avg Hatch Rate" 
          value={recentHatch ? `${hatchRate}%` : "N/A"} 
          icon={Activity} 
          trend={recentHatch ? "Last batch" : "No recent data"}
          trendUp={hatchRate > 80}
          color="blue"
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Egg Production Trend (Last 14 Days)</h2>
          {chartData.length > 0 ? (
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
          ) : (
             <div className="h-80 w-full flex items-center justify-center text-gray-400 border border-dashed rounded-lg bg-gray-50">
                <p>No egg data available yet</p>
             </div>
          )}
        </div>

        {/* Quick Alerts/Tasks */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Pending Tasks</h2>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px]">
            
            {/* Manual Tasks from AI/User */}
            {manualTasks.map(task => (
                 <div key={task.id} className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100 group">
                    <button 
                        onClick={() => completeTask(task.id)}
                        className="mt-1 text-indigo-400 hover:text-green-600 transition-colors"
                        title="Mark as Complete"
                    >
                        <CheckSquare size={18} />
                    </button>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{task.description}</p>
                        <p className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                 </div>
            ))}

            {/* Inventory Alerts */}
            {lowStockItems.map(item => (
                <div key={item.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="w-2 h-2 mt-2 bg-red-500 rounded-full flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-gray-800">Restock {item.name}</p>
                        <p className="text-xs text-gray-500">Only {item.quantity} {item.unit} remaining (Threshold: {item.restockThreshold})</p>
                    </div>
                </div>
            ))}

            {/* Incubation Alerts */}
            {activeIncubations.map(batch => {
                let action = '';
                const d = batch.daysElapsed;
                // Simple logic for key incubation events
                if (d >= 7 && d <= 8) action = 'Candling (Day 7)';
                else if (d >= 14 && d <= 15) action = 'Candling (Day 14)';
                else if (d >= 18 && d < 21) action = 'Stop Turning (Lockdown)';
                else if (d >= 21) action = 'Hatching Expected';
                
                if (action) {
                    return (
                        <div key={batch.id} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                            <div className="w-2 h-2 mt-2 bg-amber-500 rounded-full flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-800">Incubation Batch {batch.breed}</p>
                                <p className="text-xs text-gray-500">Day {d}: {action}</p>
                            </div>
                        </div>
                    );
                }
                return null;
            })}

            {/* Default Maintenance Tasks if list is empty or small */}
            {lowStockItems.length === 0 && manualTasks.length === 0 && (
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="w-2 h-2 mt-2 bg-green-500 rounded-full flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-gray-800">Status Check</p>
                        <p className="text-xs text-gray-500">No urgent alerts.</p>
                    </div>
                </div>
            )}
            
             <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
               <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">Coop Maintenance</p>
                <p className="text-xs text-gray-500">Weekly cleaning check recommended.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};