import React, { useState } from 'react';
import { MOCK_TRANSACTIONS } from '../constants';
import { TransactionType, Transaction } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Plus, X, Save, Trash2 } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Financial Records</h1>
        <button 
            onClick={() => setShowModal(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    <TrendingUp size={20} />
                </div>
                <span className="text-sm font-medium text-gray-500">Total Income</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">${totalIncome.toFixed(2)}</p>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                    <TrendingDown size={20} />
                </div>
                <span className="text-sm font-medium text-gray-500">Total Expenses</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">${totalExpenses.toFixed(2)}</p>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <DollarSign size={20} />
                </div>
                <span className="text-sm font-medium text-gray-500">Net Profit</span>
            </div>
            <p className={`text-2xl font-bold ${(totalIncome - totalExpenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${(totalIncome - totalExpenses).toFixed(2)}
            </p>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Recent Transactions</h2>
        </div>
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Amount</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50 group">
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(tx.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{tx.description}</td>
                        <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200">
                                {tx.category}
                            </span>
                        </td>
                        <td className={`px-6 py-4 text-sm font-bold text-right ${tx.type === TransactionType.Income ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === TransactionType.Income ? '+' : '-'}${tx.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                             <button onClick={() => handleDelete(tx.id)} className="text-gray-400 hover:text-red-600 transition-colors p-1 opacity-0 group-hover:opacity-100">
                                <Trash2 size={16} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Add Transaction</h3>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <div className="flex p-1 bg-gray-100 rounded-lg">
                            <button 
                                onClick={() => setNewTx({...newTx, type: TransactionType.Expense})}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${newTx.type === TransactionType.Expense ? 'bg-white shadow-sm text-red-600' : 'text-gray-500'}`}
                            >Expense</button>
                             <button 
                                onClick={() => setNewTx({...newTx, type: TransactionType.Income})}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${newTx.type === TransactionType.Income ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'}`}
                            >Income</button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input type="date" value={newTx.date} onChange={e => setNewTx({...newTx, date: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input type="text" value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. Feed bags" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input type="number" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" placeholder="0.00" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select value={newTx.category} onChange={e => setNewTx({...newTx, category: e.target.value as any})} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500">
                            <option value="Feed">Feed</option>
                            <option value="Medicine">Medicine</option>
                            <option value="Equipment">Equipment</option>
                            <option value="Egg Sales">Egg Sales</option>
                            <option value="Bird Sales">Bird Sales</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <button onClick={handleSave} className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors mt-4">Save Transaction</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};