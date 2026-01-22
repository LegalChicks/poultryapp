import React, { useState } from 'react';
import { Save, Trash2, Database, AlertTriangle, CheckCircle, RefreshCw, Power, X, Shield, Smartphone, Globe, Monitor } from 'lucide-react';
import { LoginLog } from '../types';

export const Settings: React.FC = () => {
  const [farmName, setFarmName] = useState(() => localStorage.getItem('poultry_farm_name') || 'PoultryPro Farm');
  const [currency, setCurrency] = useState(() => localStorage.getItem('poultry_currency') || '$');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Modal state for dangerous actions
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Logs
  const logs: LoginLog[] = JSON.parse(localStorage.getItem('poultry_login_logs') || '[]');

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
       const keysToReset = [
         'poultry_birds',
         'poultry_eggs',
         'poultry_health',
         'poultry_inventory',
         'poultry_incubation',
         'poultry_finance',
         'poultry_tasks',
         'poultry_login_logs'
       ];
       
       keysToReset.forEach(key => localStorage.setItem(key, '[]'));
       window.location.reload();
    }
  };

  const handleResetDefaults = () => {
      if (confirm('Reset all data to sample demonstration data? Existing records will be lost.')) {
        const keysToReset = [
            'poultry_birds',
            'poultry_eggs',
            'poultry_health',
            'poultry_inventory',
            'poultry_incubation',
            'poultry_finance',
            'poultry_tasks'
        ];
        keysToReset.forEach(key => localStorage.removeItem(key));
        window.location.reload();
      }
  };

  const getDeviceName = (userAgent: string) => {
    let browser = "Unknown Browser";
    if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("SamsungBrowser")) browser = "Samsung Internet";
    else if (userAgent.includes("Opera") || userAgent.includes("OPR")) browser = "Opera";
    else if (userAgent.includes("Trident")) browser = "Internet Explorer";
    else if (userAgent.includes("Edge")) browser = "Edge";
    else if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Safari")) browser = "Safari";

    let os = "Unknown OS";
    if (userAgent.includes("Win")) os = "Windows";
    else if (userAgent.includes("Mac")) os = "MacOS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";

    return `${browser} on ${os}`;
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

      {/* Login Logs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
         <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Shield size={20} className="text-gray-400" />
            Security Logs
        </h2>
        <p className="text-sm text-gray-500 mb-4">Recent activity and device logins.</p>
        
        <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3 font-medium text-gray-600">Time</th>
                        <th className="px-4 py-3 font-medium text-gray-600">IP Address</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Device Name</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {logs.length > 0 ? logs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2 text-gray-700 font-mono text-xs">
                                    <Globe size={14} className="text-gray-400" />
                                    {log.ipAddress}
                                </div>
                            </td>
                            <td className="px-4 py-2.5 text-gray-500 max-w-sm" title={log.deviceInfo}>
                                <div className="flex items-center gap-3">
                                     <div className="p-1.5 bg-gray-100 rounded-md">
                                        {log.deviceInfo.includes("Mobile") ? <Smartphone size={14} /> : <Monitor size={14} />}
                                     </div>
                                     <div className="flex flex-col">
                                         <span className="text-sm font-medium text-gray-700">{getDeviceName(log.deviceInfo)}</span>
                                         <span className="text-[10px] text-gray-400 truncate max-w-[200px]">{log.deviceInfo}</span>
                                     </div>
                                </div>
                            </td>
                            <td className="px-4 py-2.5">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${log.status === 'Success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                    {log.status}
                                </span>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-gray-400 italic">No logs found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
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
          PoultryPro Manager v1.4.1 • Local Storage Persistence Enabled
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
                            <li>Pending Tasks</li>
                            <li>Security Logs</li>
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