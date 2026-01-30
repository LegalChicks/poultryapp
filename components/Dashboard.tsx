import React, { useMemo } from 'react';
import { Bird as BirdIcon, Egg, DollarSign, Activity, CheckSquare, ArrowRight, Bell } from 'lucide-react';
import { StatCard } from './StatCard';
import { MOCK_BIRDS, MOCK_EGG_LOG, MOCK_TRANSACTIONS, MOCK_INVENTORY, MOCK_INCUBATION } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TransactionType, Bird, EggLogEntry, Transaction, InventoryItem, IncubationBatch, ManualTask } from '../types';
import { usePersistentState } from '../hooks/usePersistentState';

export const Dashboard: React.FC = () => {
  // Load persistent data
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
  const recentHatch = [...incubations]
      .filter(i => i.status === 'Hatched' || i.status === 'Failed')
      .sort((a,b) => new Date(b.projectedHatchDate).getTime() - new Date(a.projectedHatchDate).getTime())[0];
      
  const hatchRate = recentHatch && recentHatch.fertileCount 
    ? Math.round(((recentHatch.hatchedCount || 0) / recentHatch.fertileCount) * 100) 
    : 0;

  // 5. Chart Data
  const chartData = useMemo(() => {
    const grouped = eggLogs.reduce((acc, log) => {
        acc[log.date] = (acc[log.date] || 0) + log.count;
        return acc;
    }, {} as Record<string, number>);

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Farm Command</h1>
          <p className="text-slate-500 font-medium mt-1">Efficiently managing your Rhode Island Reds & Australorps.</p>
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <button 
              onClick={() => window.location.hash = '#/eggs'}
              className="flex-1 lg:flex-none gradient-primary hover:opacity-90 text-white px-6 py-4 rounded-2xl text-sm font-bold transition-all shadow-xl shadow-emerald-900/10 flex justify-center items-center gap-2"
          >
            <Egg size={18} />
            Log Daily Collection
          </button>
          <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600 transition-colors shadow-sm">
            <Bell size={20} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Flock" 
          value={totalBirds} 
          icon={BirdIcon} 
          trend={`${activeHens} Productive Hens`}
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
          title="Revenue (Mo)" 
          value={`$${monthlyIncome.toFixed(0)}`} 
          icon={DollarSign} 
          trend="Stable"
          trendUp={true}
          color="green"
        />
        <StatCard 
          title="Hatch Success" 
          value={recentHatch ? `${hatchRate}%` : "N/A"} 
          icon={Activity} 
          trend="Last Batch"
          trendUp={hatchRate > 80}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-8 rounded-4xl shadow-premium border border-slate-100">
          <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Production Trends</h2>
                <p className="text-sm font-medium text-slate-400 mt-0.5">Laying rate over past 14 days</p>
              </div>
              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">Live View</span>
              </div>
          </div>
          {chartData.length > 0 ? (
          <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                  <defs>
                  <linearGradient id="colorEggs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {day:'numeric'})}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  fontWeight={600}
                  dy={10}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={30} fontWeight={600} />
                  <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', fontSize: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#fff', fontWeight: 600 }}
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorEggs)" />
              </AreaChart>
              </ResponsiveContainer>
          </div>
          ) : (
              <div className="h-72 w-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                <Egg size={48} className="mb-4 opacity-20" />
                <p className="font-semibold">No collection data recorded</p>
              </div>
          )}
        </div>

        {/* Action Center */}
        <div className="bg-slate-900 p-8 rounded-4xl shadow-xl border border-slate-800 flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Bell size={20} className="text-amber-500" />
              Action Required
            </h2>
            
            <div className="flex-1 space-y-4">
              {/* Manual Tasks */}
              {manualTasks.length > 0 ? manualTasks.map(task => (
                  <div key={task.id} className="group flex items-start gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
                      <button 
                          onClick={() => completeTask(task.id)}
                          className="mt-1 w-6 h-6 rounded-full border-2 border-slate-600 flex items-center justify-center text-transparent group-hover:border-amber-500 group-hover:text-amber-500 transition-all"
                      >
                          <CheckSquare size={14} />
                      </button>
                      <div className="flex-1">
                          <p className="text-sm font-bold text-slate-200 leading-snug">{task.description}</p>
                          <p className="text-[10px] font-bold text-amber-500 mt-1 uppercase tracking-widest">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                      </div>
                  </div>
              )) : null}

              {/* Inventory Alerts */}
              {lowStockItems.map(item => (
                  <div key={item.id} className="flex items-start gap-4 p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                      <div className="mt-1 w-6 h-6 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold">!</div>
                      <div>
                          <p className="text-sm font-bold text-slate-100">Restock {item.name}</p>
                          <p className="text-[10px] font-bold text-rose-400 mt-1 uppercase">Only {item.quantity} {item.unit} remaining</p>
                      </div>
                  </div>
              ))}

              {/* Empty State */}
              {lowStockItems.length === 0 && manualTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                        <CheckSquare size={32} />
                      </div>
                      <p className="text-slate-300 font-bold">All tasks cleared</p>
                      <p className="text-slate-500 text-xs mt-1">Great job managing the flock!</p>
                  </div>
              )}
            </div>
            
            <button className="mt-6 w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-widest transition-all flex items-center justify-center gap-2">
               View All Records
               <ArrowRight size={14} />
            </button>
        </div>
      </div>
    </div>
  );
};