import React, { useState } from 'react';
import { MOCK_EGG_LOG } from '../constants';
import { EggLogEntry, Breed } from '../types';
import { Egg, AlertCircle, Calendar, Plus, Save, X, Edit2, TrendingUp, Trash2 } from 'lucide-react';
import { usePersistentState } from '../hooks/usePersistentState';

export const EggLogManager: React.FC = () => {
  const [logs, setLogs] = usePersistentState<EggLogEntry[]>('poultry_eggs', MOCK_EGG_LOG);
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
  // Avg calculation logic (approximate distinct days)
  const distinctDays = new Set(logs.map(l => l.date)).size;
  const avgEggs = distinctDays > 0 ? Math.round(totalEggs / distinctDays) : 0;

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Egg Logs</h1>
            <button onClick={openAddModal} className="bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-amber-700 transition-colors shadow-sm">
                <Plus size={18} /> Log Eggs
            </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-full"><Egg size={24}/></div>
                <div>
                    <p className="text-sm text-gray-500">Total Collected</p>
                    <p className="text-2xl font-bold text-gray-800">{totalEggs}</p>
                </div>
            </div>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-full"><AlertCircle size={24}/></div>
                <div>
                    <p className="text-sm text-gray-500">Damaged / Cracked</p>
                    <p className="text-2xl font-bold text-gray-800">{totalDamaged}</p>
                </div>
            </div>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-full"><TrendingUp size={24}/></div>
                <div>
                    <p className="text-sm text-gray-500">Daily Average</p>
                    <p className="text-2xl font-bold text-gray-800">{avgEggs}</p>
                </div>
            </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Breed Source</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Collected</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Damaged</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Good</th>
                         <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Notes</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {logs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 flex items-center gap-2">
                                <Calendar size={14} className="text-gray-400" />
                                {new Date(log.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium 
                                    ${log.breed === Breed.RIR ? 'bg-red-50 text-red-700' : 
                                      log.breed === Breed.BA ? 'bg-gray-100 text-gray-700' : 
                                      'bg-amber-50 text-amber-700'}`}>
                                    {log.breed || 'Mixed'}
                                </span>
                            </td>
                            <td className="px-6 py-4 font-medium">{log.count}</td>
                            <td className={`px-6 py-4 ${log.damaged > 0 ? 'text-red-600 font-medium' : 'text-gray-400'}`}>{log.damaged}</td>
                            <td className="px-6 py-4 text-green-600 font-medium">{log.count - log.damaged}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{log.notes || '-'}</td>
                             <td className="px-6 py-4 text-right">
                                <button onClick={() => openEditModal(log)} className="text-gray-400 hover:text-amber-600 transition-colors">
                                <Edit2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </div>

        {/* Modal */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Egg Log' : 'Log Daily Eggs'}</h3>
                      <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                          <input 
                              type="date" 
                              value={currentEntry.date}
                              onChange={(e) => setCurrentEntry({...currentEntry, date: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Breed / Source</label>
                          <select 
                                value={currentEntry.breed}
                                onChange={(e) => setCurrentEntry({...currentEntry, breed: e.target.value as any})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                            >
                                <option value="Mixed">Mixed / All Flock</option>
                                <option value={Breed.RIR}>{Breed.RIR}</option>
                                <option value={Breed.BA}>{Breed.BA}</option>
                                <option value={Breed.Other}>{Breed.Other}</option>
                            </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Total Collected</label>
                              <input 
                                  type="number" 
                                  value={currentEntry.count}
                                  onChange={(e) => setCurrentEntry({...currentEntry, count: parseInt(e.target.value) || 0})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                              />
                          </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Damaged</label>
                              <input 
                                  type="number" 
                                  value={currentEntry.damaged}
                                  onChange={(e) => setCurrentEntry({...currentEntry, damaged: parseInt(e.target.value) || 0})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-red-600"
                              />
                          </div>
                      </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                          <textarea 
                              rows={3}
                              value={currentEntry.notes}
                              onChange={(e) => setCurrentEntry({...currentEntry, notes: e.target.value})}
                              placeholder="e.g. Found hidden nest, soft shells..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                          />
                      </div>
                  </div>

                  <div className="flex justify-between gap-3 mt-8">
                      {isEditing && (
                        <button 
                            onClick={handleDelete}
                            className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete Log"
                        >
                            <Trash2 size={18} />
                        </button>
                      )}
                      
                      <div className="flex gap-3 flex-1">
                          <button 
                              onClick={() => setShowModal(false)}
                              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={handleSave}
                              className="flex-1 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                          >
                              <Save size={18} />
                              Save Log
                          </button>
                      </div>
                  </div>
              </div>
            </div>
        )}
    </div>
  );
};