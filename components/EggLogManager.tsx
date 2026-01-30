import React, { useState } from 'react';
import { MOCK_EGG_LOG, DEFAULT_BREED_PROFILES } from '../constants';
import { EggLogEntry, BreedProfile } from '../types';
import { Egg, AlertCircle, Calendar, Plus, Save, X, Edit2, TrendingUp, Trash2 } from 'lucide-react';
import { usePersistentState } from '../hooks/usePersistentState';

export const EggLogManager: React.FC = () => {
  const [logs, setLogs] = usePersistentState<EggLogEntry[]>('poultry_eggs', MOCK_EGG_LOG);
  const [breeds] = usePersistentState<BreedProfile[]>('poultry_breeds', DEFAULT_BREED_PROFILES);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<EggLogEntry>>({
    date: new Date().toISOString().split('T')[0],
    count: 0,
    damaged: 0,
    notes: '',
    breed: 'Mixed'
  });

  const handleSave = () => {
     if(!currentEntry.date || currentEntry.count === undefined) return;
     
     if(isEditing && currentEntry.id) {
         setLogs(logs.map(l => l.id === currentEntry.id ? {...l, ...currentEntry} as EggLogEntry : l));
     } else {
         const newLog: EggLogEntry = {
             id: `log-${Date.now()}`,
             date: currentEntry.date,
             count: Number(currentEntry.count),
             damaged: Number(currentEntry.damaged || 0),
             notes: currentEntry.notes,
             breed: currentEntry.breed as any
         };
         setLogs([newLog, ...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
     }
     setShowModal(false);
  };

  const handleDelete = () => {
      if(currentEntry.id && confirm("Delete this egg log?")) {
          setLogs(logs.filter(l => l.id !== currentEntry.id));
          setShowModal(false);
      }
  };

  const openAddModal = () => {
      setIsEditing(false);
      setCurrentEntry({
        date: new Date().toISOString().split('T')[0],
        count: 0,
        damaged: 0,
        notes: '',
        breed: 'Mixed'
      });
      setShowModal(true);
  };

  const openEditModal = (entry: EggLogEntry) => {
      setIsEditing(true);
      setCurrentEntry({...entry});
      setShowModal(true);
  };
  
  // Stats
  const totalEggs = logs.reduce((acc, curr) => acc + curr.count, 0);
  const totalDamaged = logs.reduce((acc, curr) => acc + curr.damaged, 0);
  const distinctDays = new Set(logs.map(l => l.date)).size;
  const avgEggs = distinctDays > 0 ? Math.round(totalEggs / distinctDays) : 0;

  return (
    <div className="space-y-6 pb-2">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-black text-black tracking-tight">Egg Logs</h1>
            <button onClick={openAddModal} className="bg-black text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200 font-bold">
                <Plus size={20} /> Log
            </button>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
             <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-full mb-2"><Egg size={20}/></div>
                <p className="text-xl font-black text-black leading-none">{totalEggs}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">Total</p>
            </div>
             <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="p-2 bg-red-50 text-red-600 rounded-full mb-2"><AlertCircle size={20}/></div>
                 <p className="text-xl font-black text-black leading-none">{totalDamaged}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">Cracked</p>
            </div>
             <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="p-2 bg-green-50 text-green-600 rounded-full mb-2"><TrendingUp size={20}/></div>
                <p className="text-xl font-black text-black leading-none">{avgEggs}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">Daily Avg</p>
            </div>
        </div>

        {/* List View */}
        <div className="space-y-3">
            {logs.map(log => (
                <div key={log.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center">
                                <Egg size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="font-black text-2xl text-black leading-none">{log.count}</h3>
                                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wide">
                                    {new Date(log.date).toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'})}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => openEditModal(log)} className="text-gray-300 hover:text-black p-2 bg-gray-50 rounded-xl"><Edit2 size={18} /></button>
                    </div>
                    
                    <div className="flex gap-2">
                        <span className="flex-1 py-2 bg-gray-50 rounded-lg text-center text-xs font-bold text-gray-600 uppercase tracking-wide">
                        {log.breed || 'Mixed'}
                        </span>
                        <span className={`flex-1 py-2 rounded-lg text-center text-xs font-bold uppercase tracking-wide ${log.damaged > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {log.damaged} Damaged
                        </span>
                    </div>
                    {log.notes && (
                         <div className="mt-3 pt-3 border-t border-gray-50">
                             <p className="text-xs font-medium text-gray-500 italic">"{log.notes}"</p>
                         </div>
                    )}
                </div>
            ))}
        </div>

        {/* Modal */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-black text-black tracking-tight">{isEditing ? 'Edit Log' : 'Log Eggs'}</h3>
                      <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black p-2 bg-gray-50 rounded-full">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="space-y-5">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
                          <input 
                              type="date" 
                              value={currentEntry.date}
                              onChange={(e) => setCurrentEntry({...currentEntry, date: e.target.value})}
                              className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl outline-none text-black font-bold"
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Collected</label>
                              <input 
                                  type="number" 
                                  value={currentEntry.count}
                                  onChange={(e) => setCurrentEntry({...currentEntry, count: parseInt(e.target.value) || 0})}
                                  className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl outline-none text-black font-black text-lg"
                              />
                          </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Damaged</label>
                              <input 
                                  type="number" 
                                  value={currentEntry.damaged}
                                  onChange={(e) => setCurrentEntry({...currentEntry, damaged: parseInt(e.target.value) || 0})}
                                  className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl outline-none text-red-600 font-black text-lg"
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Breed Source</label>
                          <select 
                                value={currentEntry.breed}
                                onChange={(e) => setCurrentEntry({...currentEntry, breed: e.target.value as any})}
                                className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl outline-none text-black font-bold"
                            >
                                <option value="Mixed">Mixed / All Flock</option>
                                {breeds.map(b => (
                                    <option key={b.id} value={b.name}>{b.name}</option>
                                ))}
                            </select>
                      </div>

                       <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Notes</label>
                          <textarea 
                              rows={3}
                              value={currentEntry.notes}
                              onChange={(e) => setCurrentEntry({...currentEntry, notes: e.target.value})}
                              placeholder="e.g. Found hidden nest, soft shells..."
                              className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl outline-none resize-none text-black font-medium"
                          />
                      </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-8">
                       <button 
                              onClick={handleSave}
                              className="w-full py-4 bg-black text-white rounded-xl text-base font-bold hover:bg-gray-800 transition-colors shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
                          >
                              <Save size={20} />
                              Save Log
                          </button>
                      
                      <div className="flex gap-3">
                          <button 
                              onClick={() => setShowModal(false)}
                              className="flex-1 py-3 bg-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                          >
                              Cancel
                          </button>
                          {isEditing && (
                            <button 
                                onClick={handleDelete}
                                className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
                            >
                                Delete
                            </button>
                          )}
                      </div>
                  </div>
              </div>
            </div>
        )}
    </div>
  );
};