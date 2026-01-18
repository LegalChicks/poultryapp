import React, { useState } from 'react';
import { MOCK_HEALTH_RECORDS } from '../constants';
import { HealthRecord, HealthEventType, Breed } from '../types';
import { HeartPulse, Syringe, Stethoscope, Activity, Plus, Filter, Calendar, X, Save } from 'lucide-react';

export const HealthManager: React.FC = () => {
  const [records, setRecords] = useState<HealthRecord[]>(MOCK_HEALTH_RECORDS);
  const [filterType, setFilterType] = useState<string>('All');
  
  // Modal State
  const [showLogModal, setShowLogModal] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<HealthRecord>>({
    date: new Date().toISOString().split('T')[0],
    type: HealthEventType.Other,
    subject: '',
    description: '',
    treatment: '',
    outcome: 'N/A',
    cost: 0
  });

  const filteredRecords = records.filter(r => filterType === 'All' || r.type === filterType)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getIcon = (type: HealthEventType) => {
    switch(type) {
      case HealthEventType.Vaccination: return <Syringe size={18} />;
      case HealthEventType.Disease: return <Activity size={18} />;
      case HealthEventType.Injury: return <HeartPulse size={18} />;
      case HealthEventType.Checkup: return <Stethoscope size={18} />;
      default: return <Activity size={18} />;
    }
  };

  const getColor = (type: HealthEventType) => {
    switch(type) {
      case HealthEventType.Vaccination: return 'blue';
      case HealthEventType.Disease: return 'red';
      case HealthEventType.Injury: return 'amber';
      case HealthEventType.Checkup: return 'green';
      default: return 'gray';
    }
  };
  
  const openLogModal = () => {
    setNewRecord({
        date: new Date().toISOString().split('T')[0],
        type: HealthEventType.Checkup,
        subject: '',
        description: '',
        treatment: '',
        outcome: 'N/A',
        cost: 0
    });
    setShowLogModal(true);
  };

  const handleSaveRecord = () => {
      if (!newRecord.description || !newRecord.subject) return;

      const record: HealthRecord = {
          id: `hr-${Date.now()}`,
          date: newRecord.date!,
          type: newRecord.type as HealthEventType,
          subject: newRecord.subject!,
          description: newRecord.description!,
          treatment: newRecord.treatment,
          outcome: newRecord.outcome as any,
          cost: Number(newRecord.cost),
          veterinarian: newRecord.veterinarian
      };

      setRecords([record, ...records]);
      setShowLogModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Health Center</h1>
           <p className="text-gray-500 text-sm">Track vaccinations, treatments, and vet visits.</p>
        </div>
        
        <button 
            onClick={openLogModal}
            className="bg-rose-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-rose-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Log Health Event
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Syringe size={24}/></div>
            <div>
                <p className="text-sm text-gray-500">Vaccinations (YTD)</p>
                <p className="text-xl font-bold text-gray-800">{records.filter(r => r.type === HealthEventType.Vaccination).length}</p>
            </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-full"><HeartPulse size={24}/></div>
            <div>
                <p className="text-sm text-gray-500">Active Issues</p>
                <p className="text-xl font-bold text-gray-800">{records.filter(r => r.outcome === 'Ongoing').length}</p>
            </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-full"><DollarSignIcon size={24}/></div>
            <div>
                <p className="text-sm text-gray-500">Health Costs</p>
                <p className="text-xl font-bold text-gray-800">${records.reduce((acc, r) => acc + (r.cost || 0), 0).toFixed(2)}</p>
            </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
         <Filter size={16} className="text-gray-400" />
         {(['All', ...Object.values(HealthEventType)] as string[]).map(type => (
             <button 
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border
                ${filterType === type 
                    ? 'bg-gray-800 text-white border-gray-800' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
             >
                 {type}
             </button>
         ))}
      </div>

      {/* Timeline List */}
      <div className="space-y-4">
        {filteredRecords.map((record) => {
            const color = getColor(record.type);
            return (
                <div key={record.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 relative overflow-hidden group hover:border-gray-300 transition-colors">
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-${color}-500`}></div>
                    
                    <div className="flex-shrink-0 flex flex-col items-center justify-center min-w-[80px] pr-4 md:border-r border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase">{new Date(record.date).toLocaleDateString(undefined, {month: 'short'})}</span>
                        <span className="text-2xl font-bold text-gray-800">{new Date(record.date).getDate()}</span>
                        <span className="text-xs text-gray-400">{new Date(record.date).getFullYear()}</span>
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-bold bg-${color}-100 text-${color}-700 flex items-center gap-1.5 uppercase tracking-wide`}>
                                    {getIcon(record.type)}
                                    {record.type}
                                </span>
                                <span className="text-sm font-medium text-gray-600">
                                    Target: <span className="text-gray-900">{record.subject}</span>
                                </span>
                            </div>
                            {record.outcome && (
                                <span className={`text-xs font-medium px-2 py-1 rounded border
                                    ${record.outcome === 'Recovered' ? 'bg-green-50 text-green-700 border-green-100' : 
                                      record.outcome === 'Ongoing' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                    {record.outcome}
                                </span>
                            )}
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-1">{record.description}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-4 text-sm text-gray-600">
                            {record.treatment && <p><strong>Treatment:</strong> {record.treatment}</p>}
                            {record.veterinarian && <p><strong>Vet:</strong> {record.veterinarian}</p>}
                            {record.cost && <p><strong>Cost:</strong> ${record.cost.toFixed(2)}</p>}
                        </div>
                    </div>
                </div>
            );
        })}

        {filteredRecords.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                    <HeartPulse size={24} />
                </div>
                <h3 className="text-gray-900 font-medium">No records found</h3>
                <p className="text-gray-500 text-sm">Adjust filters or log a new health event.</p>
            </div>
        )}
      </div>

      {/* Log Event Modal */}
      {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Log Health Event</h3>
                      <button onClick={() => setShowLogModal(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={24} />
                      </button>
                  </div>

                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                              <input 
                                  type="date" 
                                  value={newRecord.date} 
                                  onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                              <select 
                                  value={newRecord.type}
                                  onChange={(e) => setNewRecord({...newRecord, type: e.target.value as HealthEventType})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                              >
                                  {Object.values(HealthEventType).map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Subject / Target</label>
                          <input 
                              type="text" 
                              value={newRecord.subject} 
                              onChange={(e) => setNewRecord({...newRecord, subject: e.target.value})}
                              placeholder="e.g., RIR-001, Entire Flock, Chicks"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description / Diagnosis</label>
                          <textarea 
                              value={newRecord.description}
                              onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
                          ></textarea>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Treatment / Action Taken</label>
                          <textarea 
                              value={newRecord.treatment}
                              onChange={(e) => setNewRecord({...newRecord, treatment: e.target.value})}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
                          ></textarea>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">Outcome / Status</label>
                               <select 
                                  value={newRecord.outcome}
                                  onChange={(e) => setNewRecord({...newRecord, outcome: e.target.value as any})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                              >
                                  <option value="N/A">N/A (Routine)</option>
                                  <option value="Ongoing">Ongoing</option>
                                  <option value="Recovered">Recovered</option>
                                  <option value="Deceased">Deceased</option>
                              </select>
                           </div>
                           <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                               <div className="relative">
                                   <span className="absolute left-3 top-2 text-gray-500">$</span>
                                   <input 
                                      type="number" 
                                      value={newRecord.cost} 
                                      onChange={(e) => setNewRecord({...newRecord, cost: parseFloat(e.target.value)})}
                                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                   />
                               </div>
                           </div>
                      </div>
                      
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Veterinarian (Optional)</label>
                          <input 
                              type="text" 
                              value={newRecord.veterinarian || ''} 
                              onChange={(e) => setNewRecord({...newRecord, veterinarian: e.target.value})}
                              placeholder="Dr. Name"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                          />
                      </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                      <button 
                          onClick={() => setShowLogModal(false)}
                          className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleSaveRecord}
                          className="flex-1 py-2.5 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                      >
                          <Save size={18} />
                          Save Record
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

// Helper Icon for the stats
const DollarSignIcon = ({size}: {size: number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);