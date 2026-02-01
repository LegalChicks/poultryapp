import React, { useState, useMemo } from 'react';
import { MOCK_EGG_LOG, DEFAULT_BREED_PROFILES } from '../constants';
import { EggLogEntry, BreedProfile } from '../types';
import { Egg, AlertCircle, Calendar, Plus, Save, X, Edit2, TrendingUp, Trash2, Filter, CheckSquare, Square, Search, PieChart } from 'lucide-react';
import { usePersistentState, withAudit } from '../hooks/usePersistentState';

type DateFilter = '7days' | '30days' | 'month' | 'all';

export const EggLogManager: React.FC = () => {
  const [logs, setLogs] = usePersistentState<EggLogEntry[]>('poultry_eggs', MOCK_EGG_LOG);
  const [breeds] = usePersistentState<BreedProfile[]>('poultry_breeds', DEFAULT_BREED_PROFILES);

  // Filters
  const [dateFilter, setDateFilter] = useState<DateFilter>('30days');
  const [breedFilter, setBreedFilter] = useState<string>('All');
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<EggLogEntry>>({
    date: new Date().toISOString().split('T')[0],
    count: 0,
    damaged: 0,
    notes: '',
    breed: 'Mixed'
  });

  // Delete Confirmation State
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);

  // Filter Logic
  const filteredLogs = useMemo(() => {
    let data = [...logs];
    const now = new Date();
    
    // Date Filtering
    if (dateFilter === '7days') {
        const cutoff = new Date();
        cutoff.setDate(now.getDate() - 7);
        data = data.filter(l => new Date(l.date) >= cutoff);
    } else if (dateFilter === '30days') {
        const cutoff = new Date();
        cutoff.setDate(now.getDate() - 30);
        data = data.filter(l => new Date(l.date) >= cutoff);
    } else if (dateFilter === 'month') {
        data = data.filter(l => {
            const d = new Date(l.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
    }

    // Breed Filtering
    if (breedFilter !== 'All') {
        data = data.filter(l => (l.breed || 'Mixed') === breedFilter);
    }

    return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, dateFilter, breedFilter]);

  // Statistics based on Filtered Data
  const stats = useMemo(() => {
    const total = filteredLogs.reduce((acc, curr) => acc + curr.count, 0);
    const damaged = filteredLogs.reduce((acc, curr) => acc + curr.damaged, 0);
    const good = total - damaged;
    const distinctDays = new Set(filteredLogs.map(l => l.date)).size;
    const avg = distinctDays > 0 ? Math.round(total / distinctDays) : 0;
    const efficiency = total > 0 ? Math.round((good / total) * 100) : 0;

    return { total, damaged, avg, efficiency };
  }, [filteredLogs]);

  // CRUD Operations
  const handleSave = () => {
     if(!currentEntry.date || currentEntry.count === undefined) return;
     
     const entryPayload: EggLogEntry = withAudit({
         id: (isEditing && currentEntry.id) ? currentEntry.id : `log-${Date.now()}`,
         date: currentEntry.date,
         count: Math.max(0, Number(currentEntry.count)),
         damaged: Math.max(0, Number(currentEntry.damaged || 0)),
         notes: currentEntry.notes,
         breed: currentEntry.breed || 'Mixed'
     });

     if(isEditing) {
         setLogs(prev => prev.map(l => l.id === entryPayload.id ? entryPayload : l));
     } else {
         setLogs(prev => [entryPayload, ...prev]);
     }
     setShowModal(false);
  };

  const confirmDelete = (ids: string[]) => {
      setDeleteIds(ids);
  };

  const executeDelete = () => {
      if (deleteIds && deleteIds.length > 0) {
          const idsToDelete = new Set(deleteIds);
          setLogs(prev => prev.filter(l => !idsToDelete.has(l.id)));
          setSelectedIds(prev => {
              const newSet = new Set(prev);
              idsToDelete.forEach(id => newSet.delete(id));
              return newSet;
          });
          setDeleteIds(null);
          // If we were in the edit modal, close it
          if (showModal) setShowModal(false);
      }
  };

  const toggleSelection = (id: string) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
      if (selectedIds.size === filteredLogs.length && filteredLogs.length > 0) {
          setSelectedIds(new Set());
      } else {
          setSelectedIds(new Set(filteredLogs.map(l => l.id)));
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

  const deleteBatch = () => {
      confirmDelete(Array.from(selectedIds));
  };

  return (
    <div className="space-y-6 pb-2 relative animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Egg Collection</h1>
                <p className="text-slate-500 font-medium text-sm">Track production and quality metrics.</p>
            </div>
            <button onClick={openAddModal} className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 font-bold w-full md:w-auto justify-center">
                <Plus size={20} /> Log Collection
            </button>
        </div>
        
        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="bg-white p-5 rounded-3xl shadow-premium border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Egg size={64} /></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Collected</p>
                <p className="text-3xl font-black text-slate-900 leading-none">{stats.total}</p>
            </div>
             <div className="bg-white p-5 rounded-3xl shadow-premium border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><AlertCircle size={64} /></div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Damaged / Lost</p>
                 <p className="text-3xl font-black text-rose-500 leading-none">{stats.damaged}</p>
            </div>
             <div className="bg-white p-5 rounded-3xl shadow-premium border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp size={64} /></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Daily Average</p>
                <p className="text-3xl font-black text-indigo-600 leading-none">{stats.avg}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-premium border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><PieChart size={64} /></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Efficiency (Quality)</p>
                <p className={`text-3xl font-black leading-none ${stats.efficiency > 90 ? 'text-emerald-500' : stats.efficiency > 75 ? 'text-amber-500' : 'text-rose-500'}`}>{stats.efficiency}%</p>
            </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
             <button 
                onClick={toggleSelectAll}
                className={`p-4 rounded-2xl border transition-all flex items-center gap-2 font-bold text-sm
                ${selectedIds.size > 0 && selectedIds.size === filteredLogs.length 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
                title="Select All"
            >
                {selectedIds.size > 0 && selectedIds.size === filteredLogs.length ? <CheckSquare size={20} /> : <Square size={20} />}
            </button>

            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 w-full sm:w-auto">
                <button onClick={() => setDateFilter('7days')} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${dateFilter === '7days' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>7 Days</button>
                <button onClick={() => setDateFilter('30days')} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${dateFilter === '30days' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>30 Days</button>
                <button onClick={() => setDateFilter('month')} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${dateFilter === 'month' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>This Month</button>
                <button onClick={() => setDateFilter('all')} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${dateFilter === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>All Time</button>
            </div>

            <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border border-slate-200 w-full sm:w-auto">
                <Filter size={16} className="text-slate-400" />
                <select 
                    value={breedFilter} 
                    onChange={(e) => setBreedFilter(e.target.value)}
                    className="bg-transparent outline-none text-sm font-bold text-slate-700 w-full cursor-pointer"
                >
                    <option value="All">All Breeds</option>
                    <option value="Mixed">Mixed / General</option>
                    {breeds.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
            </div>
        </div>

        {/* List View */}
        <div className="space-y-3 pb-24">
            {filteredLogs.map(log => {
                const isSelected = selectedIds.has(log.id);
                const qualityPercent = log.count > 0 ? ((log.count - log.damaged) / log.count) * 100 : 0;
                
                return (
                    <div 
                        key={log.id} 
                        onClick={() => selectedIds.size > 0 ? toggleSelection(log.id) : null}
                        className={`p-5 rounded-3xl border transition-all duration-200 relative overflow-hidden group
                        ${isSelected ? 'bg-slate-50 border-slate-300 ring-1 ring-slate-300' : 'bg-white border-slate-100 shadow-premium hover:shadow-lg'}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleSelection(log.id); }}
                                    className={`p-2 rounded-xl transition-all ${isSelected ? 'text-slate-900' : 'text-slate-200 hover:text-slate-400'}`}
                                >
                                    {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                                </button>
                                
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-xl text-slate-900 leading-none">{log.count} <span className="text-sm text-slate-400 font-bold">Eggs</span></h3>
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                                            {log.breed || 'Mixed'}
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(log.date).toLocaleDateString(undefined, {weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'})}
                                    </p>
                                </div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); openEditModal(log); }} className="text-slate-300 hover:text-slate-900 p-2 bg-slate-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                        </div>
                        
                        {/* Visual Bar */}
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex mb-2">
                            <div className="bg-emerald-400 h-full" style={{ width: `${qualityPercent}%` }} title={`${log.count - log.damaged} Good`}></div>
                            <div className="bg-rose-400 h-full" style={{ width: `${100 - qualityPercent}%` }} title={`${log.damaged} Damaged`}></div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="flex gap-4 text-xs font-bold">
                                <div className="flex items-center gap-1.5 text-emerald-600">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    {log.count - log.damaged} Good
                                </div>
                                {log.damaged > 0 && (
                                    <div className="flex items-center gap-1.5 text-rose-500">
                                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                        {log.damaged} Damaged
                                    </div>
                                )}
                            </div>
                            {log.notes && <span className="text-xs text-slate-400 italic max-w-[200px] truncate">"{log.notes}"</span>}
                        </div>
                    </div>
                );
            })}
            
            {filteredLogs.length === 0 && (
                <div className="text-center py-20 border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
                    <Search size={48} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">No logs found for this period.</p>
                </div>
            )}
        </div>

        {/* Batch Action Bar */}
        {selectedIds.size > 0 && (
            <div className="fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
                <div className="bg-slate-900 text-white p-2 pl-6 pr-2 rounded-[2rem] shadow-2xl flex items-center justify-between md:gap-8 gap-4 border border-slate-800">
                    <div className="flex items-center gap-3">
                        <span className="bg-emerald-500 text-white text-xs font-black px-2 py-1 rounded-lg min-w-[2rem] text-center">{selectedIds.size}</span>
                        <span className="font-bold text-sm hidden sm:inline">Selected</span>
                    </div>
                    <button 
                        onClick={deleteBatch}
                        className="p-3 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 px-4"
                    >
                        <Trash2 size={18} />
                        <span className="text-xs font-bold uppercase tracking-wide">Delete</span>
                    </button>
                    <button 
                        onClick={() => setSelectedIds(new Set())}
                        className="p-3 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 overflow-y-auto max-h-[90vh]">
                   <div className="flex justify-between items-center mb-8">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{isEditing ? 'Edit Log' : 'Log Eggs'}</h3>
                        <p className="text-slate-400 font-medium text-sm mt-0.5">Record production details</p>
                      </div>
                      <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 p-3 bg-slate-50 rounded-2xl transition-all">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="space-y-6">
                      {/* Date Selection */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                              <Calendar size={12} /> Collection Date
                          </label>
                          <input 
                              type="date" 
                              value={currentEntry.date}
                              max={new Date().toISOString().split('T')[0]}
                              onChange={(e) => setCurrentEntry({...currentEntry, date: e.target.value})}
                              className="w-full bg-transparent border-none p-0 text-lg font-bold text-slate-900 outline-none focus:ring-0"
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Total Collected</label>
                              <div className="relative">
                                <input 
                                    type="number" 
                                    value={currentEntry.count}
                                    min="0"
                                    onChange={(e) => setCurrentEntry({...currentEntry, count: parseInt(e.target.value) || 0})}
                                    className="w-full px-5 py-4 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl outline-none text-slate-900 font-black text-2xl"
                                />
                              </div>
                          </div>
                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 text-rose-400">Damaged / Lost</label>
                              <input 
                                  type="number" 
                                  value={currentEntry.damaged}
                                  min="0"
                                  onChange={(e) => setCurrentEntry({...currentEntry, damaged: parseInt(e.target.value) || 0})}
                                  className="w-full px-5 py-4 bg-rose-50 border border-rose-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 rounded-2xl outline-none text-rose-600 font-black text-2xl"
                              />
                          </div>
                      </div>

                      {/* Live Calc */}
                      {(currentEntry.count || 0) > 0 && (
                          <div className="flex justify-between items-center px-2">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Yield Efficiency</span>
                              <span className={`text-sm font-black ${
                                  ((currentEntry.count! - (currentEntry.damaged || 0)) / currentEntry.count!) > 0.9 ? 'text-emerald-500' : 'text-amber-500'
                              }`}>
                                  {Math.round(((currentEntry.count! - (currentEntry.damaged || 0)) / currentEntry.count!) * 100)}%
                              </span>
                          </div>
                      )}

                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Source Breed</label>
                          <select 
                                value={currentEntry.breed}
                                onChange={(e) => setCurrentEntry({...currentEntry, breed: e.target.value as any})}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-2xl outline-none text-slate-900 font-bold appearance-none cursor-pointer"
                            >
                                <option value="Mixed">Mixed / All Flock</option>
                                {breeds.map(b => (
                                    <option key={b.id} value={b.name}>{b.name}</option>
                                ))}
                            </select>
                      </div>

                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Observation Notes</label>
                          <textarea 
                              rows={3}
                              value={currentEntry.notes}
                              onChange={(e) => setCurrentEntry({...currentEntry, notes: e.target.value})}
                              placeholder="e.g. Found hidden nest, soft shells..."
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-2xl outline-none resize-none text-slate-900 font-medium"
                          />
                      </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-10">
                       <button 
                              onClick={handleSave}
                              className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] text-lg font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3"
                          >
                              <Save size={20} />
                              Save Record
                          </button>
                      
                      <div className="flex gap-3">
                          <button 
                              onClick={() => setShowModal(false)}
                              className="flex-1 py-4 bg-slate-100 rounded-[1.5rem] text-sm font-black text-slate-500 hover:bg-slate-200 transition-all uppercase tracking-widest"
                          >
                              Cancel
                          </button>
                          {isEditing && (
                            <button 
                                onClick={() => confirmDelete([currentEntry.id!])}
                                className="flex-1 py-4 bg-rose-50 text-rose-600 rounded-[1.5rem] text-sm font-black hover:bg-rose-100 transition-all uppercase tracking-widest"
                            >
                                Delete
                            </button>
                          )}
                      </div>
                  </div>
              </div>
            </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteIds && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Delete Records?</h3>
              <p className="text-slate-500 font-medium mb-8">
                You are about to delete <strong className="text-slate-900">{deleteIds.length}</strong> record{deleteIds.length > 1 ? 's' : ''}. This cannot be undone.
              </p>
              <div className="flex flex-col gap-3">
                 <button 
                    onClick={executeDelete}
                    className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-900/10"
                 >
                    Yes, Delete
                 </button>
                 <button 
                    onClick={() => setDeleteIds(null)}
                    className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                 >
                    Cancel
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};