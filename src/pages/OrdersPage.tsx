import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderPriority, OrderStatus, NodeId } from '../types';
import {
  ClipboardList,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  RotateCcw,
  User,
  MapPin,
  Pill,
  Check,
  X,
  ShieldCheck,
  Filter,
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const {
    orders,
    createOrder,
    startOrderDelivery,
    deliveryPhase,
    robot,
    nodes,
    inventory,
    checkItemAvailability,
  } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Form State
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [selectedItem, setSelectedItem] = useState(inventory[0]?.name || 'Paracetamol');
  const [quantity, setQuantity] = useState(1);
  const [priority, setPriority] = useState<OrderPriority>('HIGH');
  const [destination, setDestination] = useState<NodeId>('Room F-102');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Live stock check for form
  const stockVerification = checkItemAvailability(selectedItem, quantity);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!patientName.trim()) {
      setFormError('Patient name is required.');
      return;
    }

    if (quantity <= 0) {
      setFormError('Quantity must be greater than 0.');
      return;
    }

    // Determine pickup location based on item catalog
    const matchedItem = inventory.find((i) => i.name === selectedItem);
    const pickupLoc = matchedItem ? matchedItem.location : 'Pharmacy';

    const result = createOrder({
      patient: patientName.trim(),
      patientId: patientId.trim() || `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      item: selectedItem,
      quantity,
      priority,
      destination,
      pickupLocation: pickupLoc,
      notes: notes.trim() || undefined,
    });

    if (!result.success) {
      setFormError(result.message);
      return;
    }

    // Reset and close
    setPatientName('');
    setPatientId('');
    setNotes('');
    setShowCreateModal(false);
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'ALL') return true;
    return o.status === filterStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-950/70 border-amber-800 text-amber-300';
      case 'Processing':
        return 'bg-sky-950/70 border-sky-800 text-sky-300';
      case 'Navigating':
        return 'bg-purple-950/70 border-purple-800 text-purple-300 animate-pulse';
      case 'Delivered':
        return 'bg-emerald-950/70 border-emerald-800 text-emerald-300';
      case 'Returning':
        return 'bg-indigo-950/70 border-indigo-800 text-indigo-300 animate-pulse';
      case 'Completed':
        return 'bg-emerald-950/70 border-emerald-800 text-emerald-300';
      case 'Failed':
        return 'bg-red-950/70 border-red-800 text-red-300';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  const getPriorityBadge = (p: OrderPriority) => {
    switch (p) {
      case 'CRITICAL':
        return 'text-red-400 border-red-800 bg-red-950/50';
      case 'HIGH':
        return 'text-amber-400 border-amber-800 bg-amber-950/50';
      case 'NORMAL':
        return 'text-blue-400 border-blue-800 bg-blue-950/50';
      case 'LOW':
        return 'text-slate-400 border-slate-700 bg-slate-900/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#1f2a44]">
        <div>
          <div className="flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-[#627a8d]" />
            <h1 className="text-2xl font-bold tracking-tight text-[#dae2fd]">
              Clinical Delivery Orders
            </h1>
          </div>
          <p className="text-xs text-[#869397] font-mono mt-1">
            Autonomous order dispatch queue with automated inventory checks and dual-stage UCS execution.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Delivery Order</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-[#131b2e] border border-[#1f2a44] rounded-lg text-xs font-mono">
        <span className="text-[#869397] flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5" /> Filter Status:
        </span>
        {['ALL', 'Pending', 'Navigating', 'Delivered', 'Returning', 'Completed', 'Failed'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1 rounded transition ${
              filterStatus === st
                ? 'bg-[#171f33] text-[#dae2fd] border border-[#627a8d] font-bold'
                : 'text-[#869397] hover:text-[#dae2fd]'
            }`}
          >
            {st}
          </button>
        ))}
        <span className="ml-auto text-[#869397]">
          Showing {filteredOrders.length} of {orders.length} orders
        </span>
      </div>

      {/* Orders List (Terminates cleanly at bottom) */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-[#131b2e] border border-[#1f2a44] rounded-lg">
            <ClipboardList className="w-10 h-10 text-[#869397] mx-auto mb-3" />
            <p className="text-sm text-[#dae2fd] font-medium">No orders found matching status.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="p-5 bg-[#131b2e] border border-[#1f2a44] hover:border-[#2d3d63] rounded-lg transition space-y-3"
            >
              {/* Top row: ID, Patient, Priority, Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1f2a44]/80 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold font-mono text-[#dae2fd]">{order.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border font-semibold ${getPriorityBadge(order.priority)}`}>
                    {order.priority}
                  </span>
                  <span className="text-xs font-mono text-[#869397]">
                    Patient: <strong className="text-[#dae2fd]">{order.patient}</strong> ({order.patientId})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono border font-semibold uppercase ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="text-xs font-mono text-[#869397]">{order.createdAt}</span>
                </div>
              </div>

              {/* Middle row: Item, Pickup, Destination */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-[#bcc9cd]">
                <div className="p-2.5 bg-[#0b1326] border border-[#1f2a44] rounded">
                  <span className="text-[#869397] block text-[10px] uppercase">Payload Item</span>
                  <span className="text-[#dae2fd] font-bold mt-1 block">
                    {order.item} × {order.quantity}
                  </span>
                </div>

                <div className="p-2.5 bg-[#0b1326] border border-[#1f2a44] rounded">
                  <span className="text-[#869397] block text-[10px] uppercase">Pickup Node</span>
                  <span className="text-[#dae2fd] font-bold mt-1 block">
                    {order.pickupLocation}
                  </span>
                </div>

                <div className="p-2.5 bg-[#0b1326] border border-[#1f2a44] rounded">
                  <span className="text-[#869397] block text-[10px] uppercase">Delivery Destination</span>
                  <span className="text-[#10b981] font-bold mt-1 block">
                    {order.destination}
                  </span>
                </div>
              </div>

              {/* Trajectory Details if calculated */}
              {(order.deliveryPath || order.returnPath) && (
                <div className="p-2.5 bg-[#0b1326] border border-[#1f2a44] rounded text-xs font-mono space-y-1.5">
                  {order.deliveryPath && (
                    <div className="text-[#bcc9cd]">
                      <span className="text-[#869397]">Outbound Path: </span>
                      <span className="text-[#c084fc] font-bold">{order.deliveryPath.join(' → ')}</span>
                      <span className="text-[#869397] ml-2">(Cost: {order.deliveryCost})</span>
                    </div>
                  )}
                  {order.returnPath && (
                    <div className="text-[#bcc9cd]">
                      <span className="text-[#869397]">Return Path: </span>
                      <span className="text-emerald-400 font-bold">{order.returnPath.join(' → ')}</span>
                      <span className="text-[#869397] ml-2">(Cost: {order.returnCost})</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1f2a44]/80 text-xs font-mono">
                <span className="text-[#869397]">
                  Robot Saved Base: <strong className="text-[#dae2fd]">{order.originalRobotLocation || 'Main Corridor'}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {order.status === 'Pending' && (
                    <button
                      onClick={() => startOrderDelivery(order.id)}
                      disabled={robot.status !== 'IDLE' && deliveryPhase !== 'IDLE'}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-[#1f2a44] disabled:text-[#869397] text-white rounded font-bold transition shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Dispatch Robot MR-001</span>
                    </button>
                  )}
                  {order.status === 'Completed' && (
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Delivered & Returned
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Order */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#131b2e] border border-[#2d3d63] rounded-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1f2a44] pb-3">
              <h2 className="text-base font-bold text-[#dae2fd]">Create Clinical Delivery Order</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#869397] hover:text-[#dae2fd] text-sm"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded text-xs font-mono text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateOrder} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#869397] mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Jonathan Lee"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full p-2 bg-[#0b1326] border border-[#1f2a44] rounded text-[#dae2fd]"
                  />
                </div>
                <div>
                  <label className="block text-[#869397] mb-1">Patient MRN / ID</label>
                  <input
                    type="text"
                    placeholder="e.g., PT-9012"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full p-2 bg-[#0b1326] border border-[#1f2a44] rounded text-[#dae2fd]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#869397] mb-1">Payload Item *</label>
                  <select
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    className="w-full p-2 bg-[#0b1326] border border-[#1f2a44] rounded text-[#dae2fd]"
                  >
                    {inventory.map((inv) => (
                      <option key={inv.id} value={inv.name}>
                        {inv.name} (Qty: {inv.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#869397] mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full p-2 bg-[#0b1326] border border-[#1f2a44] rounded text-[#dae2fd]"
                  />
                </div>
              </div>

              {/* Real-time Inventory Verification Banner */}
              <div
                className={`p-2.5 rounded border text-[11px] flex items-center justify-between ${
                  stockVerification.available
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    : 'bg-red-950/60 border-red-800 text-red-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {stockVerification.available ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                  <span>{stockVerification.message}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#869397] mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2 bg-[#0b1326] border border-[#1f2a44] rounded text-[#dae2fd]"
                  >
                    <option value="CRITICAL">CRITICAL (Code Red)</option>
                    <option value="HIGH">HIGH (Urgent)</option>
                    <option value="NORMAL">NORMAL (Scheduled)</option>
                    <option value="LOW">LOW (Non-urgent)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#869397] mb-1">Hospital Destination *</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full p-2 bg-[#0b1326] border border-[#1f2a44] rounded text-[#dae2fd]"
                  >
                    {nodes
                      .filter((n) => n.category === 'room' || n.category === 'ward' || n.category === 'icu')
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#869397] mb-1">Clinical Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Deliver to bedside nurse, confirm ID badge"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 bg-[#0b1326] border border-[#1f2a44] rounded text-[#dae2fd]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1f2a44]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 bg-[#0b1326] text-[#869397] rounded hover:text-[#dae2fd]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!stockVerification.available}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-[#1f2a44] disabled:text-[#869397] text-white rounded font-bold"
                >
                  Create & Queue Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
