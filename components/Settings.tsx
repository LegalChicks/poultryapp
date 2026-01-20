import React, { useState } from 'react';
import { Save, Trash2, Database, AlertTriangle, CheckCircle, RefreshCw, Power, X } from 'lucide-react';

export const Settings: React.FC = () => {
  const [farmName, setFarmName] = useState(() => localStorage.getItem('poultry_farm_name') || 'PoultryPro Farm');
  const [currency, setCurrency] = useState(() => localStorage.getItem('poultry_currency') || '$');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Modal state for dangerous actions
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleSave = () => {
    localStorage.setItem('poultry_farm_name', farmName);
    localStorage.setItem('poultry_currency', currency);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    // Reload to apply currency/name changes globally
    window.location.reload(); 
  };

  const executeStartFresh = () => {
    if (deleteConfirmation === 'DELETE') {
       // Identify specific data keys to wipe. 
       // We do NOT use localStorage.clear() to avoid losing settings or other unrelated data.
       const keysToReset = [
         'poultry_birds',
         'poultry_eggs',
         'poultry_health',
         'poultry_inventory',
         'poultry_incubation',
         'poultry_finance'
       ];
       
       // Overwrite with empty arrays to clear data but prevent fallback to Mock data
       keysToReset.forEach(key => localStorage.setItem(key, '[]'));
       
       // Reload the application to re-initialize state with empty data
       window.location.reload();
    }
  };

  const handleResetDefaults = () => {
      if (confirm('Reset all data to sample demonstration data? Existing records will be lost.')) {
        // To restore defaults (Mocks), we remove the keys so the hooks fall back to initial values.
        const keysToReset = [
            'poultry_birds',
            'poultry_eggs',
            'poultry_health',
            'poultry_inventory',
            'poultry_incubation',
            'poultry_finance'
        ];
        keysToReset.forEach(key => localStorage.removeItem(key));
        
        window.location.reload();
      }
  };

  return (
    <div className="space-y-8 max-w-4xl relative">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

      {/* General Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Database size={20} className="text-gray-400" />
            General Preferences
        </h2>
        <div className="space-y-4 max-w-md">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name</label>
                <input 
                    type="text" 
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
                <input 
                    type="text" 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="$"
                />
            </div>
            <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
                {showSuccess ? <CheckCircle size={18} /> : <Save size={18} />}
                {showSuccess ? 'Saved!' : 'Save Changes'}
            </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-500" />
            Data Management
        </h2>
        <p className="text-sm text-gray-500 mb-6">Manage your local data. All data is stored securely in your browser.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <button 
                onClick={handleResetDefaults}
                className="flex flex-col items-center justify-center gap-2 p-6 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
                <RefreshCw size={24} className="text-blue-500" />
                <span className="font-medium">Reset to Sample Data</span>
                <span className="text-xs text-gray-400 text-center">Restores the demo dataset</span>
            </button>
            
            <button 
                onClick={() => setShowDeleteModal(true)}
                className="flex flex-col items-center justify-center gap-2 p-6 border border-red-200 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors"
            >
                <Power size={24} />
                <span className="font-medium">Start Fresh (Empty)</span>
                <span className="text-xs text-red-500 text-center">Deletes all records for a new farm</span>
            </button>
        </div>
      </div>
      
      <div className="text-center text-xs text-gray-400 mt-8">
          PoultryPro Manager v1.3.2 • Local Storage Persistence Enabled
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle size={24} className="text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Start Fresh?</h3>
                    </div>
                    <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(''); }} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <p className="text-gray-600 text-sm leading-relaxed">
                        This action will <strong>permanently delete</strong> the following records:
                        <ul className="list-disc ml-5 mt-2 mb-2 text-gray-500 text-xs">
                            <li>Flock Records</li>
                            <li>Egg Logs</li>
                            <li>Health Records</li>
                            <li>Inventory</li>
                            <li>Incubation Batches</li>
                            <li>Financial Transactions</li>
                        </ul>
                        Your <strong>Farm Name</strong> and <strong>Currency</strong> settings will be preserved.
                        <br/><br/>
                        This cannot be undone.
                    </p>
                    
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Type "DELETE" to confirm</label>
                        <input 
                            type="text" 
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none placeholder-gray-300"
                            placeholder="DELETE"
                        />
                    </div>

                    <button 
                        onClick={executeStartFresh}
                        disabled={deleteConfirmation !== 'DELETE'}
                        className="w-full py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Trash2 size={18} />
                        Wipe Data & Start Fresh
                    </button>
                    
                    <button 
                        onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(''); }}
                        className="w-full py-2.5 text-gray-500 hover:text-gray-800 font-medium transition-colors"
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