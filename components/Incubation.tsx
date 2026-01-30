import React, { useState, useEffect } from 'react';
import { MOCK_INCUBATION, DEFAULT_BREED_PROFILES } from '../constants';
import { IncubationGauge } from './IncubationGauge';
import { Calendar, Thermometer, Plus, Trash2, X } from 'lucide-react';
import { usePersistentState } from '../hooks/usePersistentState';
import { IncubationBatch, BreedProfile } from '../types';

export const Incubation: React.FC = () => {
  const [batches, setBatches] = usePersistentState<IncubationBatch[]>('poultry_incubation', MOCK_INCUBATION);
  const [breeds] = usePersistentState<BreedProfile[]>('poultry_breeds', DEFAULT_BREED_PROFILES);
  
  const [showModal, setShowModal] = useState(false);
  const [newBatch, setNewBatch] = useState<Partial<IncubationBatch>>({
      startDate: new Date().toISOString().split('T')[0],
      eggCount: 0,
      breed: breeds[0]?.name || 'Rhode Island Red',
      status: 'Incubating'
  });

  const getGestation = (breedName: string) => breeds.find(b => b.name === breedName)?.gestationDays || 21;

  const calculateDaysElapsed = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getProjectedDate = (startStr: string, breedName: string) => {
      const days = getGestation(breedName);
      const start = new Date(startStr);
      const hatch = new Date(start);
      hatch.setDate(start.getDate() + days);
      return hatch.toISOString().split('T')[0];
  };

  const handleDelete = (id: string) => {
      if(confirm('Delete this incubation batch?')) {
          setBatches(batches.filter(b => b.id !== id));
      }
  };

  const handleStartBatch = () => {
      if(!newBatch.eggCount || !newBatch.breed) return;
      
      const days = getGestation(newBatch.breed);
      const start = new Date(newBatch.startDate!);
      const hatch = new Date(start);
      hatch.setDate(start.getDate() + days);

      const batch: IncubationBatch = {
          id: `inc-${Date.now()}`,
          startDate: newBatch.startDate!,
          projectedHatchDate: hatch.toISOString().split('T')[0],
          eggCount: Number(newBatch.eggCount),
          breed: newBatch.breed,
          status: 'Incubating'
      };
      
      setBatches([batch, ...batches]);
      setShowModal(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Incubation Center</h1>
        <button 
            onClick={() => setShowModal(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus size={18} />
          Start New Batch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {batches.map((batch) => {
            const elapsed = calculateDaysElapsed(batch.startDate);
            const total = getGestation(batch.breed); 
            const isFinished = batch.status !== 'Incubating';
            
            return (
                <div key={batch.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative group">
                    <button 
                        onClick={() => handleDelete(batch.id)}
                        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 size={18} />
                    </button>
                    
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg">Batch #{batch.id.split('-')[1] || batch.id.substr(0,4)}</h3>
                            <p className="text-sm text-gray-500">{batch.breed} • {batch.eggCount} Eggs</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                            ${batch.status === 'Incubating' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                            {batch.status}
                        </span>
                    </div>

                    <div className="p-6 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-shrink-0">
                           <IncubationGauge daysElapsed={isFinished ? total : elapsed} totalDays={total} />
                        </div>

                        <div className="flex-1 space-y-4 w-full">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <Calendar size={16} />
                                        <span className="text-xs font-medium uppercase">Start Date</span>
                                    </div>
                                    <p className="font-semibold text-gray-800">{new Date(batch.startDate).toLocaleDateString()}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <Calendar size={16} />
                                        <span className="text-xs font-medium uppercase">Hatch Date</span>
                                    </div>
                                    <p className="font-semibold text-gray-800">{new Date(batch.projectedHatchDate).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {!isFinished && (
                                <div className="flex items-center gap-3 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
                                    <Thermometer size={18} />
                                    <span>Maintain temp at 99.5°F. Stop turning on Day {total - 3}.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Start New Batch</h3>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input type="date" value={newBatch.startDate} onChange={e => setNewBatch({...newBatch, startDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                        <select value={newBatch.breed} onChange={e => setNewBatch({...newBatch, breed: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500">
                            {breeds.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                        </select>
                        <p className="text-xs text-gray-400 mt-1">Gestation: {getGestation(newBatch.breed || '')} Days</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Egg Count</label>
                        <input type="number" value={newBatch.eggCount} onChange={e => setNewBatch({...newBatch, eggCount: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
                        <div className="flex justify-between text-sm">
                             <span className="text-blue-800">Projected Hatch:</span>
                             <span className="font-bold text-blue-900">
                                 {newBatch.startDate && newBatch.breed ? 
                                    new Date(getProjectedDate(newBatch.startDate, newBatch.breed)).toLocaleDateString() 
                                    : '-'}
                             </span>
                        </div>
                    </div>

                    <button onClick={handleStartBatch} className="w-full py-2.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors mt-4">Start Incubation</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};