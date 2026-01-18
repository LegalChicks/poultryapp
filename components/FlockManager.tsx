import React, { useState, useEffect } from 'react';
import { MOCK_BIRDS } from '../constants';
import { Bird, Breed, BirdStage } from '../types';
import { Search, Filter, MoreHorizontal, Plus, X, Save, Edit2, Users, User, Calendar } from 'lucide-react';

export const FlockManager: React.FC = () => {
  const [birds, setBirds] = useState<Bird[]>(MOCK_BIRDS);
  const [filterBreed, setFilterBreed] = useState<string>('All');
  
  // Modal State
  const [showBirdModal, setShowBirdModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [recordType, setRecordType] = useState<'Individual' | 'Batch'>('Individual');
  
  const [currentBird, setCurrentBird] = useState<Partial<Bird>>({
    tagNumber: '',
    name: '',
    count: 1,
    breed: Breed.RIR,
    stage: BirdStage.Chick,
    status: 'Active',
    hatchDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const filteredBirds = birds.filter(b => filterBreed === 'All' || b.breed === filterBreed);

  // Helper for precise age
  const calculateAge = (hatchDateString: string) => {
    const hatchDate = new Date(hatchDateString);
    const today = new Date();
    
    // Normalize time portion to avoid timezone issues affecting day diff
    const utc1 = Date.UTC(hatchDate.getFullYear(), hatchDate.getMonth(), hatchDate.getDate());
    const utc2 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    
    const diffDays = Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Not Hatched';
    if (diffDays === 0) return 'Today';
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    
    if (weeks < 20) {
        return `${weeks} wk${weeks !== 1 ? 's' : ''} ${days > 0 ? ` ${days}d` : ''}`;
    }
    
    const months = Math.floor(diffDays / 30.44);
    return `${months} month${months !== 1 ? 's' : ''}`;
  };

  const openAddModal = () => {
    setIsEditing(false);
    setRecordType('Individual');
    setCurrentBird({
        tagNumber: '',
        name: '',
        count: 1,
        breed: Breed.RIR,
        stage: BirdStage.Chick,
        status: 'Active',
        hatchDate: new Date().toISOString().split('T')[0],
        notes: ''
    });
    setShowBirdModal(true);
  };

  const openEditModal = (bird: Bird) => {
    setIsEditing(true);
    // Determine type based on count
    setRecordType(bird.count > 1 ? 'Batch' : 'Individual');
    setCurrentBird({ ...bird });
    setShowBirdModal(true);
  };

  const handleSaveBird = () => {
    if (!currentBird.tagNumber) return;

    // Ensure count is 1 for individuals
    const finalCount = recordType === 'Individual' ? 1 : Math.max(1, currentBird.count || 1);

    if (isEditing && currentBird.id) {
        setBirds(birds.map(b => b.id === currentBird.id ? { ...b, ...currentBird, count: finalCount } as Bird : b));
    } else {
        const newBird: Bird = {
            id: `bird-${Date.now()}`,
            tagNumber: currentBird.tagNumber!,
            name: currentBird.name,
            count: finalCount,
            breed: currentBird.breed as Breed,
            stage: currentBird.stage as BirdStage,
            hatchDate: currentBird.hatchDate!,
            status: currentBird.status as any,
            notes: currentBird.notes
        };
        setBirds([newBird, ...birds]);
    }
    setShowBirdModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Flock Records</h1>
        <button 
            onClick={openAddModal}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Plus size={18} />
          Add Bird / Batch
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <span className="text-xs font-medium text-gray-500 uppercase">Total Birds</span>
              <p className="text-2xl font-bold text-gray-800">{birds.reduce((acc, b) => acc + (b.status === 'Active' ? b.count : 0), 0)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <span className="text-xs font-medium text-gray-500 uppercase">Rhode Island Reds</span>
              <p className="text-2xl font-bold text-red-700">{birds.filter(b => b.breed === Breed.RIR && b.status === 'Active').reduce((acc, b) => acc + b.count, 0)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <span className="text-xs font-medium text-gray-500 uppercase">Australorps</span>
              <p className="text-2xl font-bold text-gray-800">{birds.filter(b => b.breed === Breed.BA && b.status === 'Active').reduce((acc, b) => acc + b.count, 0)}</p>
          </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <span className="text-xs font-medium text-gray-500 uppercase">Chicks</span>
              <p className="text-2xl font-bold text-amber-600">{birds.filter(b => b.stage === BirdStage.Chick && b.status === 'Active').reduce((acc, b) => acc + b.count, 0)}</p>
          </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by ID, Batch Name..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={18} className="text-gray-500" />
          <select 
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-transparent"
            value={filterBreed}
            onChange={(e) => setFilterBreed(e.target.value)}
          >
            <option value="All">All Breeds</option>
            <option value={Breed.RIR}>{Breed.RIR}</option>
            <option value={Breed.BA}>{Breed.BA}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Identity</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Breed</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Age (Current)</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBirds.map((bird) => (
                <tr key={bird.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white relative
                        ${bird.breed === Breed.RIR ? 'bg-red-700' : 'bg-gray-800'}`}>
                        {bird.breed === Breed.RIR ? 'RR' : 'BA'}
                        {bird.count > 1 && (
                            <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                                B
                            </span>
                        )}
                      </div>
                      <div>
                          <span className="font-medium text-gray-900 block">{bird.tagNumber}</span>
                          {bird.name && <span className="text-xs text-gray-500 block">{bird.name}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                      {bird.count > 1 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                              <Users size={12} />
                              Batch ({bird.count})
                          </span>
                      ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              <User size={12} />
                              Single
                          </span>
                      )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{bird.breed}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                      {bird.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                    <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400"/>
                        {calculateAge(bird.hatchDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`flex items-center gap-1.5 text-sm font-medium
                        ${bird.status === 'Active' ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${bird.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        {bird.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEditModal(bird)} className="text-gray-400 hover:text-amber-600 transition-colors">
                      <Edit2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Bird Modal */}
      {showBirdModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Record' : 'Add to Flock'}</h3>
                      <button onClick={() => setShowBirdModal(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={24} />
                      </button>
                  </div>
                  
                  {/* Record Type Toggle */}
                  {!isEditing && (
                      <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
                          <button 
                            onClick={() => setRecordType('Individual')}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all
                            ${recordType === 'Individual' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                            Individual Bird
                          </button>
                          <button 
                            onClick={() => setRecordType('Batch')}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all
                            ${recordType === 'Batch' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                            Batch / Group
                          </button>
                      </div>
                  )}

                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                              {recordType === 'Batch' ? 'Batch ID / Group Name' : 'Tag Number / ID'}
                          </label>
                          <input 
                              type="text" 
                              value={currentBird.tagNumber} 
                              onChange={(e) => setCurrentBird({...currentBird, tagNumber: e.target.value})}
                              placeholder={recordType === 'Batch' ? "e.g., Spring-Chicks-24" : "e.g., RIR-055"}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                      </div>

                      {recordType === 'Batch' && (
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Friendly Name (Opt)</label>
                                  <input 
                                      type="text" 
                                      value={currentBird.name || ''} 
                                      onChange={(e) => setCurrentBird({...currentBird, name: e.target.value})}
                                      placeholder="e.g., Incubator 1"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                  />
                             </div>
                             <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Head Count</label>
                                  <input 
                                      type="number" 
                                      value={currentBird.count} 
                                      onChange={(e) => setCurrentBird({...currentBird, count: parseInt(e.target.value)})}
                                      min="2"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                  />
                             </div>
                          </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                              <select 
                                  value={currentBird.breed}
                                  onChange={(e) => setCurrentBird({...currentBird, breed: e.target.value as Breed})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                              >
                                  {Object.values(Breed).map(b => <option key={b} value={b}>{b}</option>)}
                              </select>
                          </div>
                          <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                               <select 
                                  value={currentBird.stage}
                                  onChange={(e) => setCurrentBird({...currentBird, stage: e.target.value as BirdStage})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                              >
                                  {Object.values(BirdStage).map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Hatch Date</label>
                              <input 
                                  type="date" 
                                  value={currentBird.hatchDate} 
                                  onChange={(e) => setCurrentBird({...currentBird, hatchDate: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                              />
                          </div>
                          <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                               <select 
                                  value={currentBird.status}
                                  onChange={(e) => setCurrentBird({...currentBird, status: e.target.value as any})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                              >
                                  <option value="Active">Active</option>
                                  <option value="Sold">Sold</option>
                                  <option value="Deceased">Deceased</option>
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                          <textarea 
                              value={currentBird.notes}
                              onChange={(e) => setCurrentBird({...currentBird, notes: e.target.value})}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                          ></textarea>
                      </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                      <button 
                          onClick={() => setShowBirdModal(false)}
                          className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleSaveBird}
                          className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center gap-2"
                      >
                          <Save size={18} />
                          {isEditing ? 'Save Changes' : (recordType === 'Batch' ? 'Create Batch' : 'Register Bird')}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};