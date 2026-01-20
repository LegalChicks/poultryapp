import React, { useState } from 'react';
import { MOCK_INVENTORY } from '../constants';
import { InventoryItem } from '../types';
import { 
  Search, Plus, Minus, AlertTriangle, 
  ShoppingCart, ClipboardList, X, FileText, Check, Edit2, Save, Trash2
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
    name: '', category: 'Feed', quantity: 0, unit: 'kg', restockThreshold: 0
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
      setCurrentItem({ name: '', category: 'Feed', quantity: 0, unit: 'kg', restockThreshold: 5 });
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
              lastUpdated: new Date().toISOString().split('T')[0]
          };
          setItems([...items, newItem]);
      }
      setShowItemModal(false);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
           <p className="text-gray-500 text-sm">Track feed, medicine, and farm supplies.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowReorderList(!showReorderList)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border shadow-sm
                ${showReorderList ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
            >
                <ClipboardList size={18} />
                Reorder List
                {reorderList.size > 0 && <span className="bg-amber-600 text-white text-xs px-1.5 py-0.5 rounded-full">{reorderList.size}</span>}
            </button>
            <button 
                onClick={openAddItemModal}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-sm"
            >
            <Plus size={18} />
            Add Item
            </button>
        </div>
      </div>

      {/* Reorder List Overlay / Panel */}
      {showReorderList && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <ShoppingCart size={18} /> Reorder Checklist
              </h3>
              {reorderList.size === 0 ? (
                  <p className="text-sm text-amber-800/60 italic">No items marked for reorder.</p>
              ) : (
                  <div className="space-y-2">
                      {items.filter(i => reorderList.has(i.id)).map(item => (
                          <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-amber-100">
                              <span className="text-sm font-medium text-gray-800">{item.name}</span>
                              <div className="flex items-center gap-2">
                                  <button onClick={() => openOrderModal(item)} className="text-xs bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-700">Order</button>
                                  <button onClick={() => toggleReorderItem(item.id)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['All', ...categories].map(cat => (
              <button 
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border
                ${filterCategory === cat 
                    ? 'bg-gray-900 text-white border-gray-900' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
              >
                  {cat}
              </button>
          ))}
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => {
            const isLow = item.quantity <= item.restockThreshold;
            return (
                <div key={item.id} className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col transition-all
                    ${isLow ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-100 hover:border-gray-300'}`}>
                    
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.category}</span>
                            <h3 className="font-bold text-gray-800 text-lg">{item.name}</h3>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => toggleReorderItem(item.id)} className={`p-1.5 rounded-md transition-colors ${reorderList.has(item.id) ? 'text-amber-600 bg-amber-50' : 'text-gray-300 hover:text-gray-500'}`}>
                                <ShoppingCart size={18} />
                             </button>
                             <button onClick={() => openEditItemModal(item)} className="p-1.5 text-gray-300 hover:text-blue-500 transition-colors">
                                <Edit2 size={18} />
                             </button>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-end gap-2 mb-2">
                            <span className={`text-4xl font-bold ${isLow ? 'text-amber-600' : 'text-gray-800'}`}>{item.quantity}</span>
                            <span className="text-gray-500 font-medium mb-1.5">{item.unit}</span>
                        </div>
                        {isLow && (
                            <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold mb-4">
                                <AlertTriangle size={14} />
                                <span>Low Stock (Threshold: {item.restockThreshold})</span>
                            </div>
                        )}
                        {!isLow && <div className="h-5 mb-4"></div>}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                        <span className="text-xs text-gray-400">Updated: {new Date(item.lastUpdated!).toLocaleDateString()}</span>
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-red-500 transition-colors"
                             >
                                 <Minus size={16} />
                             </button>
                             <button 
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-green-600 transition-colors"
                             >
                                 <Plus size={16} />
                             </button>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showItemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Item' : 'Add Inventory Item'}</h3>
                      <button onClick={() => setShowItemModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                  </div>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                          <input type="text" value={currentItem.name} onChange={e => setCurrentItem({...currentItem, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. Layer Pellets" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select value={currentItem.category} onChange={e => setCurrentItem({...currentItem, category: e.target.value as any})} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500">
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                           <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                            <input type="text" value={currentItem.unit} onChange={e => setCurrentItem({...currentItem, unit: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" placeholder="kg, bags, etc" />
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input type="number" value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" />
                          </div>
                           <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert at</label>
                            <input type="number" value={currentItem.restockThreshold} onChange={e => setCurrentItem({...currentItem, restockThreshold: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" />
                          </div>
                      </div>
                      
                      <div className="flex justify-between gap-3 mt-6">
                           {isEditing && (
                            <button 
                                onClick={handleDelete}
                                className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                          )}
                          <div className="flex gap-3 flex-1">
                              <button onClick={() => setShowItemModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700">Cancel</button>
                              <button onClick={handleSaveItem} className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg flex items-center justify-center gap-2"><Save size={18} /> Save</button>
                          </div>
                      </div>
                  </div>
               </div>
          </div>
      )}

      {/* Restock Order Modal */}
      {showOrderModal && selectedItemForOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Restock {selectedItemForOrder.name}</h3>
                  <p className="text-sm text-gray-500 mb-6">Current Stock: {selectedItemForOrder.quantity} {selectedItemForOrder.unit}</p>
                  
                  <div className="mb-6">
                       <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Add</label>
                       <div className="flex items-center gap-2">
                           <button onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))} className="p-2 border rounded hover:bg-gray-50"><Minus size={16} /></button>
                           <input type="number" value={orderQuantity} onChange={e => setOrderQuantity(parseInt(e.target.value))} className="flex-1 text-center py-2 border rounded outline-none" />
                           <button onClick={() => setOrderQuantity(orderQuantity + 1)} className="p-2 border rounded hover:bg-gray-50"><Plus size={16} /></button>
                       </div>
                  </div>

                  <button onClick={submitOrder} className="w-full py-2.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors">
                      Confirm Restock
                  </button>
                  <button onClick={() => setShowOrderModal(false)} className="w-full py-2.5 mt-2 text-gray-500 hover:text-gray-700">Cancel</button>
               </div>
          </div>
      )}
    </div>
  );
};