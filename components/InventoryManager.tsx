import React, { useState } from 'react';
import { MOCK_INVENTORY } from '../constants';
import { InventoryItem } from '../types';
import { 
  Search, Plus, Minus, AlertTriangle, 
  ShoppingCart, ClipboardList, X, FileText, Check, Edit2, Save, Trash2, Zap
} from 'lucide-react';
import { usePersistentState } from '../hooks/usePersistentState';

export const InventoryManager: React.FC = () => {
  const [items, setItems] = usePersistentState<InventoryItem[]>('poultry_inventory', MOCK_INVENTORY);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  
  // Reorder List State
  const [reorderList, setReorderList] = useState<Set<string>>(new Set());
  const [showReorderList, setShowReorderList] = useState(false);

  // Purchase Order Modal State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedItemForOrder, setSelectedItemForOrder] = useState<InventoryItem | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(0);

  // Add/Edit Item Modal State
  const [showItemModal, setShowItemModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<InventoryItem>>({
    name: '', category: 'Feed', quantity: 0, unit: 'kg', restockThreshold: 0, isAutoFeed: false, dailyRatePerBird: 0
  });

  const categories = ['Feed', 'Medicine', 'Supplies', 'Product'];

  const filteredItems = items.filter(i => filterCategory === 'All' || i.category === filterCategory);

  const updateQuantity = (id: string, delta: number) => {
    setItems(items.map(item => {
        if (item.id === id) {
            const newQty = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQty, lastUpdated: new Date().toISOString().split('T')[0] };
        }
        return item;
    }));
  };

  const toggleReorderItem = (id: string) => {
    const newSet = new Set(reorderList);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setReorderList(newSet);
  };

  const openOrderModal = (item: InventoryItem) => {
      setSelectedItemForOrder(item);
      setOrderQuantity(Math.max(10, item.restockThreshold * 2)); // Default suggestion
      setShowOrderModal(true);
  };

  const submitOrder = () => {
      if (selectedItemForOrder) {
          updateQuantity(selectedItemForOrder.id, orderQuantity);
          if (reorderList.has(selectedItemForOrder.id)) {
              toggleReorderItem(selectedItemForOrder.id);
          }
          setShowOrderModal(false);
          setSelectedItemForOrder(null);
      }
  };

  const openAddItemModal = () => {
      setIsEditing(false);
      setCurrentItem({ name: '', category: 'Feed', quantity: 0, unit: 'kg', restockThreshold: 5, isAutoFeed: false, dailyRatePerBird: 0 });
      setShowItemModal(true);
  };

  const openEditItemModal = (item: InventoryItem) => {
      setIsEditing(true);
      setCurrentItem({ ...item });
      setShowItemModal(true);
  };

  const handleDelete = () => {
      if (currentItem.id && confirm('Delete this inventory item?')) {
          setItems(items.filter(i => i.id !== currentItem.id));
          setShowItemModal(false);
      }
  };

  const handleSaveItem = () => {
      if (!currentItem.name || !currentItem.unit) return; // Basic validation

      if (isEditing && currentItem.id) {
          setItems(items.map(i => i.id === currentItem.id ? { ...i, ...currentItem, lastUpdated: new Date().toISOString().split('T')[0] } as InventoryItem : i));
      } else {
          const newItem: InventoryItem = {
              id: `inv-${Date.now()}`,
              name: currentItem.name,
              category: currentItem.category as any,
              quantity: Number(currentItem.quantity),
              unit: currentItem.unit,
              restockThreshold: Number(currentItem.restockThreshold),
              lastUpdated: new Date().toISOString().split('T')[0],
              isAutoFeed: currentItem.isAutoFeed,
              dailyRatePerBird: Number(currentItem.dailyRatePerBird || 0)
          };
          setItems([...items, newItem]);
      }
      setShowItemModal(false);
  };

  return (
    <div className="space-y-6 pb-2 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-3xl font-black text-black tracking-tight">Inventory</h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <button 
                onClick={() => setShowReorderList(!showReorderList)}
                className={`flex-1 sm:flex-none px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors border shadow-sm font-bold
                ${showReorderList ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
            >
                <ShoppingCart size={18} />
                Order
                {reorderList.size > 0 && <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{reorderList.size}</span>}
            </button>
            <button 
                onClick={openAddItemModal}
                className="flex-1 sm:flex-none bg-black text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200 font-bold"
            >
            <Plus size={18} />
            Add
            </button>
        </div>
      </div>

      {/* Reorder List Overlay */}
      {showReorderList && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-4">
              <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <ClipboardList size={18} /> Reorder Checklist
              </h3>
              {reorderList.size === 0 ? (
                  <p className="text-sm text-amber-800/60 italic">No items marked for reorder.</p>
              ) : (
                  <div className="space-y-2">
                      {items.filter(i => reorderList.has(i.id)).map(item => (
                          <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-amber-100 shadow-sm">
                              <span className="text-sm font-bold text-black">{item.name}</span>
                              <div className="flex items-center gap-2">
                                  <button onClick={() => openOrderModal(item)} className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-amber-700">Restock</button>
                                  <button onClick={() => toggleReorderItem(item.id)} className="text-gray-400 hover:text-red-500 p-1"><X size={16} /></button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}

      {/* Filters (Scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['All', ...categories].map(cat => (
              <button 
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border
                ${filterCategory === cat 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
              >
                  {cat}
              </button>
          ))}
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredItems.map(item => {
            const isLow = item.quantity <= item.restockThreshold;
            return (
                <div key={item.id} className={`bg-white rounded-2xl shadow-sm border p-5 flex flex-col transition-all relative overflow-hidden
                    ${isLow ? 'border-amber-300 ring-1 ring-amber-100' : 'border-gray-100'}`}>
                    
                    <div className="absolute right-0 top-0 flex items-start">
                        {item.isAutoFeed && (
                            <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-bl-xl border-l border-b border-emerald-100 flex items-center gap-1" title={`Auto-deducts ${item.dailyRatePerBird} ${item.unit}/bird/day`}>
                                <Zap size={10} className="fill-emerald-600" />
                                <span className="text-[9px] font-black uppercase tracking-wider">Auto</span>
                            </div>
                        )}
                        {isLow && <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-wider">Low Stock</div>}
                    </div>

                    <div className="flex justify-between items-start mb-2 pr-8">
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.category}</span>
                            <h3 className="font-black text-black text-lg leading-tight">{item.name}</h3>
                        </div>
                    </div>

                    <div className="flex justify-between items-end">
                         <div className="flex items-end gap-1.5">
                            <span className={`text-4xl font-black ${isLow ? 'text-amber-600' : 'text-black'}`}>{item.quantity}</span>
                            <span className="text-gray-500 font-bold mb-1.5 text-sm uppercase">{item.unit}</span>
                        </div>
                        
                        <div className="flex gap-2">
                             <button onClick={() => toggleReorderItem(item.id)} className={`p-2.5 rounded-xl transition-colors ${reorderList.has(item.id) ? 'text-amber-600 bg-amber-50' : 'text-gray-400 bg-gray-50'}`}>
                                <ShoppingCart size={20} />
                             </button>
                             <button onClick={() => openEditItemModal(item)} className="p-2.5 text-black bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <Edit2 size={20} />
                             </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-4">
                        <div className="flex items-center gap-3 w-full">
                             <button 
                                onClick={() => updateQuantity(item.id, -1)}
                                className="h-10 w-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 bg-white font-bold"
                             >
                                 <Minus size={18} />
                             </button>
                             <div className="flex-1 text-center">
                                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Quick Adjust</p>
                             </div>
                             <button 
                                onClick={() => updateQuantity(item.id, 1)}
                                className="h-10 w-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-900 bg-white font-bold"
                             >
                                 <Plus size={18} />
                             </button>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showItemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-black text-black tracking-tight">{isEditing ? 'Edit Item' : 'New Item'}</h3>
                      <button onClick={() => setShowItemModal(false)} className="text-gray-400 hover:text-black p-2 bg-gray-50 rounded-full"><X size={20} /></button>
                  </div>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Item Name</label>
                          <input type="text" value={currentItem.name} onChange={e => setCurrentItem({...currentItem, name: e.target.value})} className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl outline-none text-black font-bold" placeholder="e.g. Layer Pellets" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                            <select value={currentItem.category} onChange={e => setCurrentItem({...currentItem, category: e.target.value as any})} className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl outline-none text-black font-bold">
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                           <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Unit</label>
                            <input type="text" value={currentItem.unit} onChange={e => setCurrentItem({...currentItem, unit: e.target.value})} className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl outline-none text-black font-bold" placeholder="kg, bags" />
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Quantity</label>
                            <input type="number" value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: parseFloat(e.target.value)})} className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl outline-none text-black font-black text-lg" />
                          </div>
                           <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Alert At</label>
                            <input type="number" value={currentItem.restockThreshold} onChange={e => setCurrentItem({...currentItem, restockThreshold: parseInt(e.target.value)})} className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 rounded-xl outline-none text-amber-600 font-bold" />
                          </div>
                      </div>

                      {/* Auto Feed Settings */}
                      {currentItem.category === 'Feed' && (
                          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                              <div className="flex items-center justify-between mb-3">
                                  <label className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                                      <Zap size={14} className="fill-emerald-800" />
                                      Auto-Consumption
                                  </label>
                                  <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                                    <input 
                                        type="checkbox" 
                                        checked={currentItem.isAutoFeed} 
                                        onChange={(e) => setCurrentItem({...currentItem, isAutoFeed: e.target.checked})}
                                        className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                        style={{ top: '4px', left: currentItem.isAutoFeed ? '20px' : '4px', transition: 'all 0.3s' }}
                                    />
                                    <div 
                                        className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${currentItem.isAutoFeed ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                        onClick={() => setCurrentItem({...currentItem, isAutoFeed: !currentItem.isAutoFeed})}
                                    ></div>
                                  </div>
                              </div>
                              {currentItem.isAutoFeed && (
                                  <div className="animate-in slide-in-from-top-2 fade-in">
                                      <label className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1.5">Daily Amount per Bird</label>
                                      <div className="relative">
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={currentItem.dailyRatePerBird} 
                                            onChange={(e) => setCurrentItem({...currentItem, dailyRatePerBird: parseFloat(e.target.value)})} 
                                            className="w-full pl-4 pr-12 py-3 bg-white border border-emerald-200 focus:border-emerald-500 rounded-xl outline-none text-emerald-900 font-bold" 
                                            placeholder="0.12"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">{currentItem.unit}</span>
                                      </div>
                                      <p className="text-[10px] text-emerald-600 mt-2 font-medium leading-relaxed">
                                          This will automatically deduct from inventory daily based on the number of Active birds in your flock.
                                      </p>
                                  </div>
                              )}
                          </div>
                      )}
                      
                      <div className="flex flex-col gap-3 mt-6">
                          <button onClick={handleSaveItem} className="w-full py-4 bg-black text-white rounded-xl text-base font-bold flex items-center justify-center gap-2 shadow-xl shadow-gray-200"><Save size={20} /> Save Item</button>
                          
                           <div className="flex gap-3">
                              <button onClick={() => setShowItemModal(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600">Cancel</button>
                               {isEditing && (
                                <button 
                                    onClick={handleDelete}
                                    className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                                >
                                    Delete
                                </button>
                              )}
                          </div>
                      </div>
                  </div>
               </div>
          </div>
      )}

      {/* Restock Order Modal */}
      {showOrderModal && selectedItemForOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-6">
                  <h3 className="text-xl font-black text-black mb-1">Restock {selectedItemForOrder.name}</h3>
                  <p className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-wide">Current: {selectedItemForOrder.quantity} {selectedItemForOrder.unit}</p>
                  
                  <div className="mb-8">
                       <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 text-center">Quantity to Add</label>
                       <div className="flex items-center justify-center gap-4">
                           <button onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))} className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-black font-bold text-xl hover:bg-gray-200"><Minus size={20} /></button>
                           <span className="text-4xl font-black text-black w-24 text-center">{orderQuantity}</span>
                           <button onClick={() => setOrderQuantity(orderQuantity + 1)} className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center font-bold text-xl hover:bg-gray-800"><Plus size={20} /></button>
                       </div>
                  </div>

                  <button onClick={submitOrder} className="w-full py-4 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors shadow-lg shadow-amber-100">
                      Confirm Restock
                  </button>
                  <button onClick={() => setShowOrderModal(false)} className="w-full py-3 mt-2 text-gray-400 font-bold hover:text-gray-600">Cancel</button>
               </div>
          </div>
      )}
    </div>
  );
};