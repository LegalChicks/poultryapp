import React, { useState } from 'react';
import { MOCK_TRANSACTIONS } from '../constants';
import { TransactionType, Transaction } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Plus, X, Trash2 } from 'lucide-react';
import { usePersistentState } from '../hooks/usePersistentState';

export const Finance: React.FC = () => {
  const [transactions, setTransactions] = usePersistentState<Transaction[]>('poultry_finance', MOCK_TRANSACTIONS);
  const [showModal, setShowModal] = useState(false);
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      type: TransactionType.Expense,
      category: 'Feed'
  });

  const totalIncome = transactions
    .filter(t => t.type === TransactionType.Income)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === TransactionType.Expense)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleDelete = (id: string) => {
      if(confirm('Delete this transaction?')) {
          setTransactions(transactions.filter(t => t.id !== id));
      }
  };

  const handleSave = () => {
      if(!newTx.description || !newTx.amount) return;
      
      const tx: Transaction = {
          id: `tx-${Date.now()}`,
          date: newTx.date!,
          description: newTx.description,
          amount: parseFloat(newTx.amount.toString()),
          type: newTx.type as TransactionType,
          category: newTx.category as any
      };
      
      setTransactions([tx, ...transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setShowModal(false);
      setNewTx({
          date: new Date().toISOString().split('T')[0],
          description: '',
          amount: 0,
          type: TransactionType.Expense,
          category: 'Feed'
      });
  };

  return (
    <div className="space-y-6 pb-2">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-black tracking-tight">Finance</h1>
        <button 
            onClick={() => setShowModal(true)}
            className="bg-black text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
        >
          <Plus size={20} />
          Add
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
         <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-green-700">
                <TrendingUp size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Income</span>
            </div>
            <p className="text-2xl font-black text-black tracking-tight">${totalIncome.toFixed(0)}</p>
         </div>
         <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-red-700">
                <TrendingDown size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Expense</span>
            </div>
            <p className="text-2xl font-black text-black tracking-tight">${totalExpenses.toFixed(0)}</p>
         </div>
         <div className="col-span-2 bg-gray-900 p-4 rounded-2xl shadow-md flex justify-between items-center">
             <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Net Profit</p>
                <p className={`text-3xl font-black ${(totalIncome - totalExpenses) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${(totalIncome - totalExpenses).toFixed(2)}
                </p>
             </div>
             <div className="p-3 bg-gray-800 rounded-full text-white">
                 <DollarSign size={24} />
             </div>
         </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <h2 className="text-lg font-black text-black">Recent Activity</h2>
      </div>

      {/* Mobile Transaction List */}
      <div className="space-y-3">
        {transactions.map(tx => (
            <div key={tx.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center relative overflow-hidden group">
                <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 
                        ${tx.type === TransactionType.Income ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                        {tx.type === TransactionType.Income ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <div>
                        <h4 className="font-bold text-black text-base leading-tight">{tx.description}</h4>
                        <p className="text-xs font-bold text-gray-400 mt-0.5 uppercase tracking-wide">
                            {new Date(tx.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})} • {tx.category}
                        </p>
                    </div>
                </div>
                <div className="text-right relative z-10 flex flex-col items-end">
                    <p className={`font-black text-lg ${tx.type === TransactionType.Income ? 'text-green-600' : 'text-black'}`}>
                        {tx.type === TransactionType.Income ? '+' : '-'}${tx.amount.toFixed(0)}
                    </p>
                    <button onClick={() => handleDelete(tx.id)} className="p-1.5 text-gray-300 hover:text-red-500">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        ))}
        {transactions.length === 0 && (
            <div className="text-center py-12 text-gray-400 italic">No transactions recorded.</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-black tracking-tight">Add Transaction</h3>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black p-2 bg-gray-50 rounded-full">
                        <X size={20} />
                    </button>
                </div>
                <div className="space-y-5">
                     <div className="flex p-1.5 bg-gray-100 rounded-2xl">
                        <button 
                            onClick={() => setNewTx({...newTx, type: TransactionType.Expense})}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all shadow-sm ${newTx.type === TransactionType.Expense ? 'bg-white text-red-600' : 'text-gray-500 hover:text-gray-900 bg-transparent shadow-none'}`}
                        >Expense</button>
                         <button 
                            onClick={() => setNewTx({...newTx, type: TransactionType.Income})}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all shadow-sm ${newTx.type === TransactionType.Income ? 'bg-white text-green-600' : 'text-gray-500 hover:text-gray-900 bg-transparent shadow-none'}`}
                        >Income</button>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Amount</label>
                        <input type="number" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: parseFloat(e.target.value)})} className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl outline-none text-black font-black text-lg" placeholder="0.00" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                        <input type="text" value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl outline-none text-black font-bold" placeholder="e.g. Feed bags" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
                            <input type="date" value={newTx.date} onChange={e => setNewTx({...newTx, date: e.target.value})} className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl outline-none text-black font-bold" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                            <select value={newTx.category} onChange={e => setNewTx({...newTx, category: e.target.value as any})} className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl outline-none text-black font-bold">
                                <option value="Feed">Feed</option>
                                <option value="Medicine">Medicine</option>
                                <option value="Equipment">Equipment</option>
                                <option value="Egg Sales">Egg Sales</option>
                                <option value="Bird Sales">Bird Sales</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    
                    <button onClick={handleSave} className="w-full py-4 bg-black text-white rounded-xl text-base font-bold hover:bg-gray-800 transition-colors mt-4 shadow-xl shadow-gray-200">Save Transaction</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};