import React, { useState, useRef, useEffect } from 'react';
import { MOCK_HEALTH_RECORDS } from '../constants';
import { HealthRecord, HealthEventType, Breed } from '../types';
import { HeartPulse, Syringe, Stethoscope, Activity, Plus, Filter, Calendar, X, Save, Trash2, Bold, Italic, List as ListIcon } from 'lucide-react';
import { usePersistentState } from '../hooks/usePersistentState';

const RichTextEditor = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && (value === '' || value !== editorRef.current.innerHTML)) {
             if (value === '' && editorRef.current.innerHTML !== '') {
                 editorRef.current.innerHTML = '';
             } else if (editorRef.current.innerHTML === '' && value) {
                 editorRef.current.innerHTML = value;
             }
        }
    }, [value]);

    const exec = (cmd: string) => {
        document.execCommand(cmd, false, undefined);
        if (editorRef.current) onChange(editorRef.current.innerHTML);
    };

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
            <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-100">
                <button type="button" onClick={() => exec('bold')} className="p-1.5 hover:bg-gray-200 rounded text-gray-600 hover:text-black transition-colors" title="Bold">
                    <Bold size={14} />
                </button>
                <button type="button" onClick={() => exec('italic')} className="p-1.5 hover:bg-gray-200 rounded text-gray-600 hover:text-black transition-colors" title="Italic">
                    <Italic size={14} />
                </button>
                <button type="button" onClick={() => exec('insertUnorderedList')} className="p-1.5 hover:bg-gray-200 rounded text-gray-600 hover:text-black transition-colors" title="List">
                    <ListIcon size={14} />
                </button>
            </div>
            <div
                ref={editorRef}
                className="w-full px-4 py-3 min-h-[100px] outline-none text-sm text-black font-medium [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                contentEditable
                onInput={(e) => onChange(e.currentTarget.innerHTML)}
                suppressContentEditableWarning
            />
        </div>
    );
};

export const HealthManager: React.FC = () => {
  const [records, setRecords] = usePersistentState<HealthRecord[]>('poultry_health', MOCK_HEALTH_RECORDS);
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

  const handleDelete = (id: string) => {
    if(confirm("Delete this health record?")) {
        setRecords(records.filter(r => r.id !== id));
    }
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
    <div className="space-y-6 pb-2">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-black tracking-tight">Health</h1>
        <button 
            onClick={openLogModal}
            className="bg-rose-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 font-bold"
        >
          <Plus size={20} />
          Log
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Syringe size={14}/></div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vax YTD</p>
            </div>
            <p className="text-xl font-black text-black">{records.filter(r => r.type === HealthEventType.Vaccination).length}</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-red-50 text-red-600 rounded-lg"><HeartPulse size={14}/></div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active</p>
            </div>
            <p className="text-xl font-black text-black">{records.filter(r => r.outcome === 'Ongoing').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
         {(['All', ...Object.values(HealthEventType)] as string[]).map(type => (
             <button 
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border
                ${filterType === type 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
             >
                 {type}
             </button>
         ))}
      </div>

      {/* Timeline List */}
      <div className="space-y-3">
        {filteredRecords.map((record) => {
            const color = getColor(record.type);
            return (
                <div key={record.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-${color}-500`}></div>
                    
                    <div className="flex justify-between items-start pl-3">
                        <div className="flex gap-3">
                             <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl px-2 py-1 min-w-[50px]">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(record.date).toLocaleDateString(undefined, {month: 'short'})}</span>
                                <span className="text-lg font-black text-black leading-none">{new Date(record.date).getDate()}</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider text-${color}-600`}>{record.type}</span>
                                    {record.outcome && (
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase
                                            ${record.outcome === 'Recovered' ? 'bg-green-50 text-green-700 border-green-100' : 
                                            record.outcome === 'Ongoing' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                            {record.outcome}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-black text-base leading-tight">{record.description}</h3>
                                <p className="text-xs font-medium text-gray-500 mt-0.5">Target: {record.subject}</p>
                            </div>
                        </div>
                         <button 
                            onClick={() => handleDelete(record.id)}
                            className="p-1.5 text-gray-300 hover:text-red-500"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-3 pl-3 pt-2 border-t border-gray-50">
                        {record.treatment && (
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <span className="font-bold text-gray-400 uppercase text-[9px] block mb-1">Treatment Plan</span>
                                <div 
                                    className="text-xs text-gray-700 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4" 
                                    dangerouslySetInnerHTML={{ __html: record.treatment }} 
                                />
                            </div>
                        )}
                        {record.cost && (
                             <div className="flex justify-end">
                                <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 inline-flex items-center gap-2">
                                    <span className="font-bold text-gray-400 uppercase text-[9px]">Cost</span>
                                    <span className="font-bold text-gray-700">${record.cost.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        })}
      </div>

      {/* Log Event Modal */}
      {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-black text-black tracking-tight">Log Event</h3>
                      <button onClick={() => setShowLogModal(false)} className="text-gray-400 hover:text-black p-2 bg-gray-50 rounded-full">
                          <X size={20} />
                      </button>
                  </div>

                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
                              <input 
                                  type="date" 
                                  value={newRecord.date} 
                                  onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                                  className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl outline-none text-black font-bold"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Type</label>
                              <select 
                                  value={newRecord.type}
                                  onChange={(e) => setNewRecord({...newRecord, type: e.target.value as HealthEventType})}
                                  className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl outline-none text-black font-bold"
                              >
                                  {Object.values(HealthEventType).map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Target Subject</label>
                          <input 
                              type="text" 
                              value={newRecord.subject} 
                              onChange={(e) => setNewRecord({...newRecord, subject: e.target.value})}
                              placeholder="e.g., RIR-001"
                              className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl outline-none text-black font-bold"
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                          <textarea 
                              value={newRecord.description}
                              onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
                              rows={2}
                              className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl outline-none resize-none text-black font-bold"
                          ></textarea>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Treatment & Notes</label>
                          <RichTextEditor 
                            value={newRecord.treatment || ''} 
                            onChange={(val) => setNewRecord({...newRecord, treatment: val})} 
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Outcome</label>
                               <select 
                                  value={newRecord.outcome}
                                  onChange={(e) => setNewRecord({...newRecord, outcome: e.target.value as any})}
                                  className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl outline-none text-black font-bold"
                              >
                                  <option value="N/A">N/A</option>
                                  <option value="Ongoing">Ongoing</option>
                                  <option value="Recovered">Recovered</option>
                                  <option value="Deceased">Deceased</option>
                              </select>
                           </div>
                           <div>
                               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Cost</label>
                               <input 
                                  type="number" 
                                  value={newRecord.cost} 
                                  onChange={(e) => setNewRecord({...newRecord, cost: parseFloat(e.target.value)})}
                                  className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl outline-none text-black font-bold"
                               />
                           </div>
                      </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-8">
                      <button 
                          onClick={handleSaveRecord}
                          className="w-full py-4 bg-rose-600 text-white rounded-xl text-base font-bold hover:bg-rose-700 transition-colors shadow-xl shadow-rose-200 flex items-center justify-center gap-2"
                      >
                          <Save size={20} />
                          Save Record
                      </button>
                      <button 
                          onClick={() => setShowLogModal(false)}
                          className="w-full py-3 bg-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
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