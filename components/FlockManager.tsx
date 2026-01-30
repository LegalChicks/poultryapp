import React, { useState, useEffect } from 'react';
import { MOCK_BIRDS, DEFAULT_BREED_PROFILES } from '../constants';
import { Bird, BirdStage, BreedProfile } from '../types';
import { Search, Filter, Plus, X, Save, Edit2, Calendar, Trash2, CheckSquare, Square, Layers, Check } from 'lucide-react';
import { usePersistentState } from '../hooks/usePersistentState';

export const FlockManager: React.FC = () => {
  const [birds, setBirds] = usePersistentState<Bird[]>('poultry_birds', MOCK_BIRDS);
  const [breeds] = usePersistentState<BreedProfile[]>('poultry_breeds', DEFAULT_BREED_PROFILES);
  
  const [filterBreed, setFilterBreed] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal State
  const [showBirdModal, setShowBirdModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [recordType, setRecordType] = useState<'Individual' | 'Batch'>('Individual');
  
  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Batch Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchActionField, setBatchActionField] = useState<'stage' | 'status' | null>(null);
  const [showBatchDelete, setShowBatchDelete] = useState(false);

  // Incubation Calculator State
  const [useIncubationCalc, setUseIncubationCalc] = useState(false);
  const [incubationStart, setIncubationStart] = useState('');
  
  const [currentBird, setCurrentBird] = useState<Partial<Bird>>({
    tagNumber: '',
    name: '',
    count: 1,
    breed: breeds[0]?.name || 'Rhode Island Red',
    stage: BirdStage.Chick,
    status: 'Active',
    hatchDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const getBreedProfile = (breedName: string) => breeds.find(b => b.name === breedName) || breeds[0];

  const filteredBirds = birds.filter(b => {
    const matchesBreed = filterBreed === 'All' || b.breed === filterBreed;
    const matchesSearch = b.tagNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (b.name && b.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesBreed && matchesSearch;
  });

  const calculateAge = (hatchDateString: string) => {
    const hatchDate = new Date(hatchDateString);
    const today = new Date();
    const utc1 = Date.UTC(hatchDate.getFullYear(), hatchDate.getMonth(), hatchDate.getDate());
    const utc2 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const diffDays = Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Hatching in ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return 'Hatching Today';
    if (diffDays < 7) return `${diffDays}d`;
    
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    
    if (weeks < 20) {
        return `${weeks}w ${days > 0 ? `${days}d` : ''}`;
    }
    
    const months = Math.floor(diffDays / 30.44);
    return `${months}mo`;
  };

  useEffect(() => {
    if (useIncubationCalc && incubationStart && currentBird.breed) {
        const breedProfile = getBreedProfile(currentBird.breed);
        const days = breedProfile?.gestationDays || 21;
        
        const [y, m, d] = incubationStart.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        date.setDate(date.getDate() + days);
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        setCurrentBird(prev => ({...prev, hatchDate: `${year}-${month}-${day}`}));
    }
  }, [useIncubationCalc, incubationStart, currentBird.breed, breeds]);

  const openAddModal = () => {
    setIsEditing(false);
    setRecordType('Individual');
    setUseIncubationCalc(false);
    setIncubationStart('');
    setCurrentBird({
        tagNumber: '',
        name: '',
        count: 1,
        breed: breeds[0]?.name || '',
        stage: BirdStage.Chick,
        status: 'Active',
        hatchDate: new Date().toISOString().split('T')[0],
        notes: ''
    });
    setShowBirdModal(true);
  };

  const openEditModal = (bird: Bird) => {
    setIsEditing(true);
    setRecordType(bird.count > 1 ? 'Batch' : 'Individual');
    setUseIncubationCalc(false);
    setIncubationStart('');
    setCurrentBird({ ...bird });
    setShowBirdModal(true);
  };

  const confirmDelete = (id: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setDeleteId(id);
  };

  const executeDelete = () => {
    if (deleteId) {
        setBirds(prev => prev.filter(b => b.id !== deleteId));
        setDeleteId(null);
        if (showBirdModal) setShowBirdModal(false);
    }
  };

  const handleSaveBird = () => {
    if (!currentBird.tagNumber) return;

    const finalCount = recordType === 'Individual' ? 1 : Math.max(1, currentBird.count || 1);

    if (isEditing && currentBird.id) {
        setBirds(prev => prev.map(b => b.id === currentBird.id ? { ...b, ...currentBird, count: finalCount } as Bird : b));
    } else {
        const newBird: Bird = {
            id: `bird-${Date.now()}`,
            tagNumber: currentBird.tagNumber!,
            name: currentBird.name,
            count: finalCount,
            breed: currentBird.breed!,
            stage: currentBird.stage as BirdStage,
            hatchDate: currentBird.hatchDate!,
            status: currentBird.status as any,
            notes: currentBird.notes
        };
        setBirds(prev => [newBird, ...prev]);
    }
    setShowBirdModal(false);
  };

  // --- Batch Operations ---

  const toggleSelection = (id: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedIds(newSet);
  };

  const handleSelectAll = () => {
      if (selectedIds.size === filteredBirds.length && filteredBirds.length > 0) {
          setSelectedIds(new Set());
      } else {
          setSelectedIds(new Set(filteredBirds.map(b => b.id)));
      }
  };

  const executeBatchUpdate = (value: string) => {
      setBirds(prev => prev.map(b => {
          if (selectedIds.has(b.id)) {
              return { ...b, [batchActionField!]: value };
          }
          return b;
      }));
      setBatchActionField(null);
      setSelectedIds(new Set());
  };

  const executeBatchDelete = () => {
      setBirds(prev => prev.filter(b => !selectedIds.has(b.id)));
      setSelectedIds(new Set());
      setShowBatchDelete(false);
  };

  return (
    <div className="space-y-6 pb-2 animate-in fade-in slide-in-from-bottom-2 duration-500 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Flock Manager</h1>
        <button 
            onClick={openAddModal}
            className="gradient-primary text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-emerald-900/10"
        >
          <Plus size={20} />
          Register New
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl shadow-premium border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Live Flock</span>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{birds.reduce((acc, b) => acc + (b.status === 'Active' ? b.count : 0), 0)}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-premium border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Active Hens</span>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{birds.filter(b => b.stage === BirdStage.Hen && b.status === 'Active').reduce((acc, b) => acc + b.count, 0)}</p>
          </div>
          {/* Dynamic Top 2 Breeds Stats */}
          {breeds.slice(0, 2).map(breed => (
            <div key={breed.id} className="bg-white p-5 rounded-3xl shadow-premium border border-slate-100 hidden lg:block">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">{breed.name}</span>
               <p className={`text-3xl font-black text-slate-900 tracking-tight`}>
                 {birds.filter(b => b.breed === breed.name && b.status === 'Active').reduce((acc, b) => acc + b.count, 0)}
               </p>
            </div>
          ))}
      </div>

      {/* Filters & Selection Control */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <button 
            onClick={handleSelectAll}
            className={`p-4 rounded-2xl border transition-all flex items-center gap-2 font-bold text-sm
            ${selectedIds.size > 0 && selectedIds.size === filteredBirds.length 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
            title="Select All"
        >
            {selectedIds.size > 0 && selectedIds.size === filteredBirds.length ? <CheckSquare size={20} /> : <Square size={20} />}
            <span className="hidden sm:inline">All</span>
        </button>
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by tag or batch name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/5 text-slate-900 font-bold placeholder-slate-300 bg-white shadow-premium transition-all"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <select 
              className="flex-1 sm:flex-none border border-slate-100 bg-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 text-slate-900 font-bold shadow-premium appearance-none cursor-pointer"
              value={filterBreed}
              onChange={(e) => setFilterBreed(e.target.value)}
            >
              <option value="All">All Breeds</option>
              {breeds.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
            <div className="bg-slate-900 p-4 rounded-2xl text-white shadow-xl shadow-slate-900/10 flex items-center justify-center">
                <Filter size={20} />
            </div>
        </div>
      </div>

      {/* Flock Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredBirds.map((bird) => {
          const ageText = calculateAge(bird.hatchDate);
          const isSelected = selectedIds.has(bird.id);
          const breedProfile = getBreedProfile(bird.breed);
          
          return (
            <div key={bird.id} 
                onClick={() => isSelected ? toggleSelection(bird.id) : null}
                className={`group bg-white p-6 rounded-4xl border shadow-premium flex flex-col gap-6 relative overflow-hidden hover:shadow-xl transition-all duration-300
                ${isSelected ? 'ring-2 ring-emerald-500 border-emerald-500/20 bg-emerald-50/10' : 'border-slate-100'}`}
            >
               {/* Status Stripe */}
               <div className={`absolute left-0 top-0 bottom-0 w-2 ${bird.status === 'Active' ? 'bg-emerald-500' : bird.status === 'Sold' ? 'bg-amber-500' : 'bg-rose-500'}`} />
               
               <div className="flex justify-between items-start pl-2">
                  <div className="flex items-center gap-4">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xs font-black text-white relative shadow-lg bg-${breedProfile.color}-500`}>
                        {breedProfile.code}
                        {bird.count > 1 && (
                            <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-md font-black">
                                {bird.count}
                            </span>
                        )}
                     </div>
                     <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-xl text-slate-900 leading-tight">{bird.tagNumber}</h3>
                            <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black border border-indigo-100">
                                {ageText}
                            </span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">{bird.name || bird.breed}</p>
                     </div>
                  </div>
                  
                  <div className="flex gap-2">
                     <button
                        onClick={(e) => toggleSelection(bird.id, e)}
                        className={`p-3 rounded-xl transition-all ${isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-300 hover:text-emerald-500'}`}
                     >
                         {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                     </button>
                     <div className="flex gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={(e) => { e.stopPropagation(); openEditModal(bird); }} 
                            className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                            title="Edit Record"
                         >
                            <Edit2 size={18} />
                         </button>
                         <button 
                            onClick={(e) => confirmDelete(bird.id, e)} 
                            className="p-3 bg-rose-50 text-rose-400 hover:text-rose-600 hover:bg-rose-100 rounded-xl transition-all"
                            title="Delete Permanently"
                         >
                            <Trash2 size={18} />
                         </button>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-3 pl-2">
                  <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Stage</p>
                     <p className="text-xs font-black text-slate-900">{bird.stage}</p>
                  </div>
                   <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Age</p>
                     <p className="text-xs font-black text-slate-900">{ageText}</p>
                  </div>
                   <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Type</p>
                     <p className="text-xs font-black text-slate-900">{bird.count > 1 ? 'Batch' : 'Single'}</p>
                  </div>
               </div>
            </div>
          );
        })}
        {filteredBirds.length === 0 && (
            <div className="col-span-full py-24 text-center border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
                <Search size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold">No flock records found matching your filters.</p>
            </div>
        )}
      </div>

      {/* Floating Batch Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="bg-slate-900 text-white p-2 pl-6 pr-2 rounded-[2rem] shadow-2xl flex items-center justify-between md:gap-8 gap-4 border border-slate-800">
                <div className="flex items-center gap-3">
                    <span className="bg-emerald-500 text-white text-xs font-black px-2 py-1 rounded-lg min-w-[2rem] text-center">{selectedIds.size}</span>
                    <span className="font-bold text-sm hidden sm:inline">Selected</span>
                </div>
                
                <div className="flex items-center gap-2">
                     <button 
                        onClick={() => setBatchActionField('stage')}
                        className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold uppercase tracking-wide transition-all"
                     >
                        Update Stage
                     </button>
                     <button 
                        onClick={() => setBatchActionField('status')}
                        className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold uppercase tracking-wide transition-all"
                     >
                        Update Status
                     </button>
                     <button 
                        onClick={() => setShowBatchDelete(true)}
                        className="p-3 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                        title="Delete Selected"
                     >
                        <Trash2 size={18} />
                     </button>
                </div>

                <button 
                    onClick={() => setSelectedIds(new Set())}
                    className="p-3 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
      )}

      {/* Add / Edit Bird Modal */}
      {showBirdModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl p-10 overflow-y-auto max-h-[90vh]">
                  <div className="flex justify-between items-center mb-10">
                      <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{isEditing ? 'Update Record' : 'New Registration'}</h3>
                        <p className="text-slate-400 font-medium mt-1">Populate the flock manifest</p>
                      </div>
                      <button onClick={() => setShowBirdModal(false)} className="text-slate-400 hover:text-slate-900 p-3 bg-slate-50 rounded-2xl transition-all">
                          <X size={24} />
                      </button>
                  </div>
                  
                  {/* Record Type Toggle */}
                  {!isEditing && (
                      <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-10">
                          <button 
                            onClick={() => setRecordType('Individual')}
                            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all
                            ${recordType === 'Individual' ? 'bg-white text-slate-900 shadow-premium' : 'text-slate-400 hover:text-slate-900'}`}
                          >
                            Individual Bird
                          </button>
                          <button 
                            onClick={() => setRecordType('Batch')}
                            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all
                            ${recordType === 'Batch' ? 'bg-white text-slate-900 shadow-premium' : 'text-slate-400 hover:text-slate-900'}`}
                          >
                            Flock Batch
                          </button>
                      </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                              {recordType === 'Batch' ? 'Batch ID / Group Name' : 'Tag Number / Primary ID'}
                          </label>
                          <input 
                              type="text" 
                              value={currentBird.tagNumber} 
                              onChange={(e) => setCurrentBird({...currentBird, tagNumber: e.target.value})}
                              placeholder={recordType === 'Batch' ? "e.g., Spring-Chicks-24" : "e.g., RIR-055"}
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 rounded-2xl outline-none text-slate-900 font-bold transition-all"
                          />
                      </div>

                      {recordType === 'Batch' && (
                          <>
                             <div>
                                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Nickname</label>
                                  <input 
                                      type="text" 
                                      value={currentBird.name || ''} 
                                      onChange={(e) => setCurrentBird({...currentBird, name: e.target.value})}
                                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 rounded-2xl outline-none text-slate-900 font-bold"
                                  />
                             </div>
                             <div>
                                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Headcount</label>
                                  <input 
                                      type="number" 
                                      value={currentBird.count} 
                                      onChange={(e) => setCurrentBird({...currentBird, count: parseInt(e.target.value)})}
                                      min="2"
                                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 rounded-2xl outline-none text-slate-900 font-black"
                                  />
                             </div>
                          </>
                      )}
                      
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Genetic Breed</label>
                          <select 
                              value={currentBird.breed}
                              onChange={(e) => setCurrentBird({...currentBird, breed: e.target.value})}
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 rounded-2xl outline-none text-slate-900 font-bold appearance-none cursor-pointer"
                          >
                              {breeds.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                          </select>
                      </div>
                      <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Growth Stage</label>
                           <select 
                              value={currentBird.stage}
                              onChange={(e) => setCurrentBird({...currentBird, stage: e.target.value as BirdStage})}
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 rounded-2xl outline-none text-slate-900 font-bold appearance-none cursor-pointer"
                          >
                              {Object.values(BirdStage).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                      </div>

                      <div className="md:col-span-2 bg-amber-50/50 p-6 rounded-3xl border border-amber-100">
                          <div className="flex items-center justify-between mb-4">
                             <label className="text-[10px] font-black text-amber-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                 <Calendar size={14} /> Hatching Data
                             </label>
                             <button 
                                onClick={() => setUseIncubationCalc(!useIncubationCalc)}
                                className={`text-[9px] px-3 py-1.5 rounded-xl border transition-all font-black uppercase tracking-widest
                                ${useIncubationCalc ? 'bg-amber-200 text-amber-900 border-amber-300 shadow-sm' : 'bg-white text-slate-500 border-slate-200'}`}
                             >
                                {useIncubationCalc ? 'Manual Entry' : 'Auto Calculator'}
                             </button>
                          </div>

                          {useIncubationCalc ? (
                              <div className="space-y-4">
                                  <input 
                                      type="date" 
                                      value={incubationStart} 
                                      onChange={(e) => setIncubationStart(e.target.value)}
                                      className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl outline-none text-sm text-slate-900 font-bold focus:ring-4 focus:ring-amber-500/5"
                                  />
                                  <div className="flex justify-between items-center text-[10px] px-1 font-black uppercase tracking-widest text-amber-700">
                                      <span>Standard Gestation ({getBreedProfile(currentBird.breed || '').code}):</span>
                                      <span className="bg-amber-100 px-2 py-0.5 rounded text-amber-900">{getBreedProfile(currentBird.breed || '').gestationDays} Days</span>
                                  </div>
                              </div>
                          ) : (
                             <input 
                                  type="date" 
                                  value={currentBird.hatchDate} 
                                  onChange={(e) => setCurrentBird({...currentBird, hatchDate: e.target.value})}
                                  className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl outline-none text-slate-900 font-bold focus:ring-4 focus:ring-amber-500/5"
                              />
                          )}
                      </div>

                      <div className="md:col-span-2">
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Manifest Status</label>
                           <select 
                              value={currentBird.status}
                              onChange={(e) => setCurrentBird({...currentBird, status: e.target.value as any})}
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 rounded-2xl outline-none text-slate-900 font-bold appearance-none cursor-pointer"
                          >
                              <option value="Active">Operational (Active)</option>
                              <option value="Sold">Sold / Off-Farm</option>
                              <option value="Deceased">Deceased / Lost</option>
                          </select>
                      </div>

                      <div className="md:col-span-2">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Internal Memo / Notes</label>
                          <textarea 
                              value={currentBird.notes}
                              onChange={(e) => setCurrentBird({...currentBird, notes: e.target.value})}
                              rows={3}
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 rounded-2xl outline-none resize-none text-slate-900 font-medium"
                          ></textarea>
                      </div>
                  </div>

                  <div className="flex flex-col gap-4 mt-12">
                      <button 
                          onClick={handleSaveBird}
                          className="w-full py-5 gradient-primary text-white rounded-[1.5rem] text-lg font-black hover:opacity-90 transition-all shadow-2xl shadow-emerald-900/10 flex items-center justify-center gap-3"
                      >
                          <Save size={24} />
                          {isEditing ? 'Confirm Changes' : (recordType === 'Batch' ? 'Deploy Batch' : 'Commit Registration')}
                      </button>
                      
                      <div className="flex gap-4">
                        <button 
                            onClick={() => setShowBirdModal(false)}
                            className="flex-1 py-4 bg-slate-100 rounded-[1.5rem] text-sm font-black text-slate-500 hover:bg-slate-200 transition-all uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                         {isEditing && (
                            <button 
                                onClick={(e) => confirmDelete(currentBird.id!, e)}
                                className="flex-1 py-4 bg-rose-50 text-rose-600 rounded-[1.5rem] text-sm font-black hover:bg-rose-100 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} />
                                Delete Record
                            </button>
                        )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Delete Record?</h3>
              <p className="text-slate-500 font-medium mb-8">
                This action cannot be undone. The bird or batch data will be permanently removed from your flock.
              </p>
              <div className="flex flex-col gap-3">
                 <button 
                    onClick={executeDelete}
                    className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-900/10"
                 >
                    Yes, Delete It
                 </button>
                 <button 
                    onClick={() => setDeleteId(null)}
                    className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                 >
                    Cancel
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Batch Update Modal */}
      {batchActionField && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
             <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Batch Update</h3>
                    <button onClick={() => setBatchActionField(null)} className="text-slate-400 hover:text-slate-900"><X size={24} /></button>
                </div>
                
                <p className="text-slate-500 font-medium mb-4">
                    Updating <strong className="text-slate-900">{selectedIds.size}</strong> selected records.
                </p>

                {batchActionField === 'stage' && (
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select New Stage</label>
                        {Object.values(BirdStage).map(stage => (
                            <button 
                                key={stage} 
                                onClick={() => executeBatchUpdate(stage)}
                                className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-slate-900 font-bold transition-all"
                            >
                                {stage}
                            </button>
                        ))}
                    </div>
                )}

                {batchActionField === 'status' && (
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select New Status</label>
                        {['Active', 'Sold', 'Deceased'].map(status => (
                            <button 
                                key={status} 
                                onClick={() => executeBatchUpdate(status)}
                                className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-slate-900 font-bold transition-all"
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                )}
             </div>
         </div>
      )}

      {/* Batch Delete Confirmation */}
      {showBatchDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Layers size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Batch Delete?</h3>
              <p className="text-slate-500 font-medium mb-8">
                You are about to delete <strong className="text-slate-900">{selectedIds.size}</strong> records. This cannot be undone.
              </p>
              <div className="flex flex-col gap-3">
                 <button 
                    onClick={executeBatchDelete}
                    className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-900/10"
                 >
                    Yes, Delete {selectedIds.size} Items
                 </button>
                 <button 
                    onClick={() => setShowBatchDelete(false)}
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