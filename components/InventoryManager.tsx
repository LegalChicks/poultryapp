import React, { useState } from 'react';
import { MOCK_INVENTORY } from '../constants';
import { InventoryItem } from '../types';
import { 
  Search, Plus, Minus, AlertTriangle, 
  ShoppingCart, ClipboardList, X, FileText, Check, Edit2, Save
} from 'lucide-react';

export const InventoryManager: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>(MOCK_INVENTORY);
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
           <p className="text-gray-500 text-sm">Manage feed, medicine, and harvested products.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => setShowReorderList(true)}
                className="relative bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
            >
                <ClipboardList size={18} />
                Reorder List
                {reorderList.size > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {reorderList.size}
                    </span>
                )}
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

      {/* Category Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
            <button
                onClick={() => setFilterCategory('All')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${filterCategory === 'All' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
                All Items
            </button>
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${filterCategory === cat ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                    {cat}
                </button>
            ))}
        </nav>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => {
            const isLowStock = item.quantity <= item.restockThreshold;
            const stockStatusColor = isLowStock ? 'red' : 'green';
            const isInReorderList = reorderList.has(item.id);
            
            return (
                <div key={item.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col h-full transition-all ${isLowStock ? 'border-red-200 ring-1 ring-red-50' : 'border-gray-100'}`}>
                    <div className="p-5 flex-1 relative group">
                        <button 
                            onClick={() => openEditItemModal(item)}
                            className="absolute top-4 right-4 text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Edit2 size={16} />
                        </button>
                        
                        <div className="flex justify-between items-start mb-4 pr-6">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                {item.category}
                            </span>
                            {isLowStock && (
                                <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 animate-pulse">
                                    <AlertTriangle size={12} />
                                    Low Stock
                                </span>
                            )}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-xs text-gray-400 mb-4">Last Updated: {item.lastUpdated}</p>

                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-3xl font-bold text-gray-800">{item.quantity}</span>
                            <span className="text-sm font-medium text-gray-500 mb-1.5">{item.unit}</span>
                        </div>

                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                            <div 
                                className={`h-full bg-${stockStatusColor}-500 transition-all duration-300`} 
                                style={{ width: `${Math.min(100, (item.quantity / (item.restockThreshold * 3)) * 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 text-right">Reorder at {item.restockThreshold} {item.unit}</p>
                        
                        {/* Low Stock Actions */}
                        {isLowStock && (
                             <div className="mt-4 pt-3 border-t border-red-50 grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => toggleReorderItem(item.id)}
                                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors border
                                    ${isInReorderList 
                                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                >
                                    {isInReorderList ? <Check size={14} /> : <ClipboardList size={14} />}
                                    {isInReorderList ? 'On List' : 'Add to List'}
                                </button>
                                <button 
                                    onClick={() => openOrderModal(item)}
                                    className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors shadow-sm"
                                >
                                    <ShoppingCart size={14} />
                                    Order Now
                                </button>
                             </div>
                        )}
                    </div>

                    <div className="bg-gray-50 p-3 border-t border-gray-100 grid grid-cols-2 gap-3">
                         <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors"
                         >
                            <Minus size={16} />
                            Use
                         </button>
                         <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-colors"
                         >
                            <Plus size={16} />
                            Add
                         </button>
                    </div>
                </div>
            );
        })}

        {/* Add New Card Placeholder */}
        <button 
            onClick={openAddItemModal}
            className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-6 text-gray-400 hover:border-amber-400 hover:text-amber-500 hover:bg-amber-50 transition-all group min-h-[250px]"
        >
            <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-amber-100 flex items-center justify-center mb-3 transition-colors">
                <Plus size={24} />
            </div>
            <span className="font-medium">Add New Item</span>
        </button>
      </div>

      {/* Add / Edit Item Modal */}
      {showItemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Item' : 'Add New Item'}</h3>
                      <button onClick={() => setShowItemModal(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={24} />
                      </button>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                          <input 
                              type="text" 
                              value={currentItem.name} 
                              onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
                              placeholder="e.g., Layer Pellets"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                              <select 
                                  value={currentItem.category}
                                  onChange={(e) => setCurrentItem({...currentItem, category: e.target.value as any})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                              >
                                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                          </div>
                          <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                               <input 
                                  type="text" 
                                  value={currentItem.unit} 
                                  onChange={(e) => setCurrentItem({...currentItem, unit: e.target.value})}
                                  placeholder="kg, lbs, bags"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                               />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                              <input 
                                  type="number" 
                                  value={currentItem.quantity} 
                                  onChange={(e) => setCurrentItem({...currentItem, quantity: parseFloat(e.target.value)})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                              />
                          </div>
                          <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">Restock Alert At</label>
                               <input 
                                  type="number" 
                                  value={currentItem.restockThreshold} 
                                  onChange={(e) => setCurrentItem({...currentItem, restockThreshold: parseFloat(e.target.value)})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                               />
                          </div>
                      </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                      <button 
                          onClick={() => setShowItemModal(false)}
                          className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleSaveItem}
                          className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center gap-2"
                      >
                          <Save size={18} />
                          {isEditing ? 'Save Changes' : 'Create Item'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Purchase Order Modal */}
      {showOrderModal && selectedItemForOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-50 rounded-lg text-red-600">
                             <ShoppingCart size={24} />
                          </div>
                          <div>
                              <h3 className="text-lg font-bold text-gray-900">Create Purchase Order</h3>
                              <p className="text-sm text-gray-500">Restocking {selectedItemForOrder.name}</p>
                          </div>
                      </div>
                      <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-500">Current Stock</span>
                              <span className="font-medium text-gray-900">{selectedItemForOrder.quantity} {selectedItemForOrder.unit}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Reorder Threshold</span>
                              <span className="font-medium text-red-600">{selectedItemForOrder.restockThreshold} {selectedItemForOrder.unit}</span>
                          </div>
                      </div>
                      
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Order Quantity ({selectedItemForOrder.unit})</label>
                          <div className="flex items-center gap-3">
                              <button 
                                  onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 5))}
                                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                              >
                                  <Minus size={18} />
                              </button>
                              <input 
                                  type="number" 
                                  value={orderQuantity}
                                  onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 0)}
                                  className="flex-1 text-center border-gray-200 border rounded-lg py-2 focus:ring-2 focus:ring-amber-500 outline-none"
                              />
                              <button 
                                  onClick={() => setOrderQuantity(orderQuantity + 5)}
                                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                              >
                                  <Plus size={18} />
                              </button>
                          </div>
                      </div>
                  </div>

                  <div className="flex gap-3">
                      <button 
                          onClick={() => setShowOrderModal(false)}
                          className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={submitOrder}
                          className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
                      >
                          Confirm Order
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Reorder List Summary Modal */}
      {showReorderList && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] flex flex-col">
                   <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                             <ClipboardList size={24} />
                          </div>
                          <div>
                              <h3 className="text-lg font-bold text-gray-900">Reorder List</h3>
                              <p className="text-sm text-gray-500">{reorderList.size} items pending purchase</p>
                          </div>
                      </div>
                      <button onClick={() => setShowReorderList(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={24} />
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto min-h-[200px] mb-6 border rounded-lg border-gray-100">
                      {reorderList.size === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                              <ClipboardList size={48} className="mb-3 opacity-20" />
                              <p>Your reorder list is empty.</p>
                          </div>
                      ) : (
                          <div className="divide-y divide-gray-100">
                              {items.filter(i => reorderList.has(i.id)).map(item => (
                                  <div key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                      <div>
                                          <p className="font-medium text-gray-800">{item.name}</p>
                                          <p className="text-xs text-gray-500">
                                              Current: <span className="text-red-600 font-medium">{item.quantity} {item.unit}</span>
                                          </p>
                                      </div>
                                      <button 
                                          onClick={() => toggleReorderItem(item.id)}
                                          className="text-gray-400 hover:text-red-500 p-2"
                                      >
                                          <X size={18} />
                                      </button>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>

                  <div className="flex gap-3">
                      <button 
                          onClick={() => setReorderList(new Set())}
                          disabled={reorderList.size === 0}
                          className="px-4 py-2.5 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                          Clear List
                      </button>
                      <button 
                          className="flex-1 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                          disabled={reorderList.size === 0}
                      >
                          <FileText size={18} />
                          Export / Print List
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};