import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InventoryItem } from '../types';
import {
  Pill,
  Search,
  Filter,
  Plus,
  CheckCircle,
  AlertCircle,
  Thermometer,
  MapPin,
  Package,
  Layers,
  ArrowUpDown,
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { inventory, updateInventoryStock, addInventoryItem, nodes } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New item modal state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<InventoryItem['category']>('Medication');
  const [newItemQty, setNewItemQty] = useState(20);
  const [newItemLocation, setNewItemLocation] = useState('Pharmacy');
  const [newItemDosage, setNewItemDosage] = useState('');
  const [newItemTemp, setNewItemTemp] = useState('Room Temperature (20°C - 25°C)');

  // Filter items
  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;

    const matchesAvailability =
      availabilityFilter === 'ALL' ||
      (availabilityFilter === 'IN_STOCK' && item.quantity > 0) ||
      (availabilityFilter === 'OUT_OF_STOCK' && item.quantity === 0);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const categories = ['ALL', 'Medication', 'Specimen', 'Kit', 'Document', 'Emergency'];

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    addInventoryItem({
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: newItemQty,
      location: newItemLocation,
      available: newItemQty > 0,
      dosage: newItemDosage || undefined,
      storageTemp: newItemTemp,
    });

    setNewItemName('');
    setNewItemDosage('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#1f2a44]">
        <div>
          <div className="flex items-center gap-2.5">
            <Pill className="w-6 h-6 text-[#627a8d]" />
            <h1 className="text-2xl font-bold tracking-tight text-[#dae2fd]">
              Medicines & Inventory Control
            </h1>
          </div>
          <p className="text-xs text-[#869397] font-mono mt-1">
            Real-time pharmaceutical ledger linked directly to robotic order allocation & storage nodes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#171f33] hover:bg-[#1f2a44] border border-[#2d3d63] text-[#dae2fd] rounded text-xs font-mono transition"
        >
          <Plus className="w-4 h-4 text-[#627a8d]" />
          <span>Register New Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-[#131b2e] border border-[#1f2a44] rounded-lg space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#869397] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by medication name, SKU, or storage node..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0b1326] border border-[#1f2a44] rounded text-xs text-[#dae2fd] placeholder-[#869397] focus:outline-none focus:border-[#627a8d] font-mono"
            />
          </div>

          {/* Availability filter */}
          <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
            <span className="text-[#869397]">Availability:</span>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="px-3 py-2 bg-[#0b1326] border border-[#1f2a44] rounded text-xs text-[#dae2fd] focus:outline-none focus:border-[#627a8d]"
            >
              <option value="ALL">All Items</option>
              <option value="IN_STOCK">In Stock Only</option>
              <option value="OUT_OF_STOCK">Out of Stock (0)</option>
            </select>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1f2a44]">
          <span className="text-xs font-mono text-[#869397] flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded text-xs font-mono transition ${
                selectedCategory === cat
                  ? 'bg-[#171f33] text-[#dae2fd] border border-[#627a8d] font-bold'
                  : 'bg-[#0b1326] text-[#869397] hover:text-[#dae2fd] border border-[#1f2a44]'
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="ml-auto text-xs font-mono text-[#869397]">
            Showing {filteredItems.length} of {inventory.length} items
          </span>
        </div>
      </div>

      {/* Inventory Item Table / Cards (Scrollable & Terminates Cleanly) */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-[#131b2e] border border-[#1f2a44] rounded-lg">
            <Package className="w-10 h-10 text-[#869397] mx-auto mb-3" />
            <p className="text-sm text-[#dae2fd] font-medium">No inventory items match current filter criteria.</p>
            <p className="text-xs text-[#869397] font-mono mt-1">Try clearing your search query or reset category filters.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-[#131b2e] border border-[#1f2a44] hover:border-[#2d3d63] rounded-lg transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Item Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-bold text-[#dae2fd]">{item.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#171f33] border border-[#2d3d63] text-[#bfc8ca]">
                    {item.category}
                  </span>
                  <span className="text-xs font-mono text-[#869397]">#{item.id}</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#bcc9cd] pt-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#627a8d]" />
                    <span>Location: <strong className="text-[#dae2fd]">{item.location}</strong></span>
                  </div>
                  {item.dosage && (
                    <div className="flex items-center gap-1 text-[#869397]">
                      <span>Spec: {item.dosage}</span>
                    </div>
                  )}
                  {item.storageTemp && (
                    <div className="flex items-center gap-1 text-[#869397]">
                      <Thermometer className="w-3 h-3 text-sky-400" />
                      <span>Temp: {item.storageTemp}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stock Level Controls & Status */}
              <div className="flex items-center gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#1f2a44]">
                {/* Stock Badge */}
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    {item.quantity > 0 ? (
                      <span className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" /> IN STOCK
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-mono font-bold text-red-400">
                        <AlertCircle className="w-3.5 h-3.5" /> OUT OF STOCK
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-[#869397]">
                    Current Stock: <strong className="text-[#dae2fd] font-bold text-sm">{item.quantity}</strong>
                  </span>
                </div>

                {/* Live Stock Adjuster */}
                <div className="flex items-center gap-1 font-mono bg-[#0b1326] border border-[#1f2a44] rounded p-1">
                  <button
                    onClick={() => updateInventoryStock(item.id, item.quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center text-xs text-[#869397] hover:text-[#dae2fd] hover:bg-[#171f33] rounded transition"
                    title="Decrease stock by 1"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-[#dae2fd]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateInventoryStock(item.id, item.quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center text-xs text-[#869397] hover:text-[#dae2fd] hover:bg-[#171f33] rounded transition"
                    title="Increase stock by 1"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Add Item */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#131b2e] border border-[#2d3d63] rounded-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1f2a44] pb-3">
              <h2 className="text-base font-bold text-[#dae2fd]">Register New Medicine / Item</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#869397] hover:text-[#dae2fd] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[#869397] mb-1">Item / Medicine Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Morphine Sulfate"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full p-2 bg-[#0b1326] border border-[#1f2a44] rounded text-[#dae2fd]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#869397] mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="w-full p-2 bg-[#0b1326] border border-[#1f2a44] rounded text-[#dae2fd]"
                  >
                    <option value="Medication">Medication</option>
                    <option value="Specimen">Specimen</option>
                    <option value="Kit">Kit</option>
                    <option value="Document">Document</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#869397] mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)}
                    className="w-full p-2 bg-[#0b1326] border border-[#1f2a44] rounded text-[#dae2fd]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#869397] mb-1">Storage Location (Hospital Node)</label>
                <select
                  value={newItemLocation}
                  onChange={(e) => setNewItemLocation(e.target.value)}
                  className="w-full p-2 bg-[#0b1326] border border-[#1f2a44] rounded text-[#dae2fd]"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#869397] mb-1">Dosage / Specification</label>
                <input
                  type="text"
                  placeholder="e.g., 10mg/mL Ampoule"
                  value={newItemDosage}
                  onChange={(e) => setNewItemDosage(e.target.value)}
                  className="w-full p-2 bg-[#0b1326] border border-[#1f2a44] rounded text-[#dae2fd]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1f2a44]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-[#0b1326] text-[#869397] rounded hover:text-[#dae2fd]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
