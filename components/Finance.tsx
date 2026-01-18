import React, { useState } from 'react';
import { MOCK_TRANSACTIONS } from '../constants';
import { TransactionType } from '../types';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export const Finance: React.FC = () => {
  const [transactions] = useState(MOCK_TRANSACTIONS);

  const totalIncome = transactions
    .filter(t => t.type === TransactionType.Income)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === TransactionType.Expense)
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Financial Records</h1>

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
            <button className="text-sm text-amber-600 font-medium hover:text-amber-700">Export Report</button>
        </div>
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Amount</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50">
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
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};