import React, { useState } from 'react';
import { MOCK_INCUBATION } from '../constants';
import { IncubationGauge } from './IncubationGauge';
import { Calendar, Thermometer } from 'lucide-react';

export const Incubation: React.FC = () => {
  const [batches] = useState(MOCK_INCUBATION);

  const calculateDaysElapsed = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Incubation Center</h1>
        <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          Start New Batch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {batches.map((batch) => {
            const elapsed = calculateDaysElapsed(batch.startDate);
            const total = 21; // Chickens
            const isFinished = batch.status !== 'Incubating';
            
            return (
                <div key={batch.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg">Batch #{batch.id.split('-')[1]}</h3>
                            <p className="text-sm text-gray-500">{batch.breed} • {batch.eggCount} Eggs</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                            ${batch.status === 'Incubating' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                            {batch.status}
                        </span>
                    </div>

                    <div className="p-6 flex flex-col md:flex-row items-center gap-8">
                        {/* D3 Visualization */}
                        <div className="flex-shrink-0">
                           <IncubationGauge daysElapsed={isFinished ? 21 : elapsed} totalDays={total} />
                        </div>

                        {/* Details */}
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

                            {isFinished && (
                                <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-green-800">Hatch Result</span>
                                        <span className="text-lg font-bold text-green-700">
                                            {Math.round((batch.hatchedCount! / batch.eggCount) * 100)}% Rate
                                        </span>
                                    </div>
                                    <div className="text-xs text-green-600 flex gap-4">
                                        <span>Fertile: {batch.fertileCount}</span>
                                        <span>Hatched: {batch.hatchedCount}</span>
                                    </div>
                                </div>
                            )}

                            {!isFinished && (
                                <div className="flex items-center gap-3 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
                                    <Thermometer size={18} />
                                    <span>Maintain temp at 99.5°F. Stop turning on Day 18.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};