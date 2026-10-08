import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  History,
  CheckCircle2,
  Clock,
  MapPin,
  Pill,
  ArrowRight,
  TrendingDown,
  Layers,
  Search,
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { history } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = history.filter(
    (h) =>
      h.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const averageCost =
    history.length > 0
      ? (history.reduce((acc, h) => acc + h.totalCost, 0) / history.length).toFixed(1)
      : '0';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#1f2a44]">
        <div>
          <div className="flex items-center gap-2.5">
            <History className="w-6 h-6 text-[#627a8d]" />
            <h1 className="text-2xl font-bold tracking-tight text-[#dae2fd]">
              Autonomous Delivery History
            </h1>
          </div>
          <p className="text-xs text-[#869397] font-mono mt-1">
            Complete audit trail of delivered orders, outbound UCS costs, reverse return UCS trajectories, and total costs.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 bg-[#131b2e] border border-[#1f2a44] rounded">
            <span className="text-[#869397]">Total Missions: </span>
            <strong className="text-[#dae2fd]">{history.length}</strong>
          </div>
          <div className="px-3 py-1.5 bg-[#131b2e] border border-[#1f2a44] rounded">
            <span className="text-[#869397]">Avg Total Cost: </span>
            <strong className="text-[#c084fc]">{averageCost}</strong>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 bg-[#131b2e] border border-[#1f2a44] rounded-lg">
        <div className="relative">
          <Search className="w-4 h-4 text-[#869397] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order ID, patient, medicine, or destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0b1326] border border-[#1f2a44] rounded text-xs text-[#dae2fd] placeholder-[#869397] font-mono focus:outline-none focus:border-[#627a8d]"
          />
        </div>
      </div>

      {/* History Items List (Terminates cleanly at end) */}
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center bg-[#131b2e] border border-[#1f2a44] rounded-lg">
            <History className="w-10 h-10 text-[#869397] mx-auto mb-3" />
            <p className="text-sm text-[#dae2fd] font-medium">No historical delivery records found.</p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-[#131b2e] border border-[#1f2a44] hover:border-[#2d3d63] rounded-lg transition space-y-3"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1f2a44]/80 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold font-mono text-[#dae2fd]">{item.orderId}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/70 border border-emerald-800 text-emerald-300 font-bold">
                    {item.status}
                  </span>
                  <span className="text-xs font-mono text-[#869397]">
                    Patient: <strong className="text-[#dae2fd]">{item.patient}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-[#869397]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.timestamp}</span>
                </div>
              </div>

              {/* Payload info */}
              <div className="flex items-center gap-4 text-xs font-mono text-[#bcc9cd]">
                <div className="flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-[#627a8d]" />
                  <span>Item: <strong className="text-[#dae2fd]">{item.item}</strong> (Qty: {item.quantity})</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>Destination: <strong className="text-[#10b981]">{item.destination}</strong></span>
                </div>
              </div>

              {/* Detailed Path Breakdown: Outbound UCS vs Return UCS vs Total Cost */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                {/* Outbound */}
                <div className="p-3 bg-[#0b1326] border border-[#1f2a44] rounded space-y-1">
                  <div className="flex items-center justify-between text-[#869397]">
                    <span>1. Outbound Delivery Path</span>
                    <span className="text-[#c084fc] font-bold">Cost: {item.deliveryCost}</span>
                  </div>
                  <div className="text-[#dae2fd] font-semibold text-[11px] truncate">
                    {item.deliveryPath.join(' → ') || 'Calculated UCS Route'}
                  </div>
                </div>

                {/* Return */}
                <div className="p-3 bg-[#0b1326] border border-[#1f2a44] rounded space-y-1">
                  <div className="flex items-center justify-between text-[#869397]">
                    <span>2. Return UCS Path</span>
                    <span className="text-emerald-400 font-bold">Cost: {item.returnCost}</span>
                  </div>
                  <div className="text-[#dae2fd] font-semibold text-[11px] truncate">
                    {item.returnPath.join(' → ') || 'Calculated Return Route'}
                  </div>
                </div>

                {/* Total Cost & Telemetry */}
                <div className="p-3 bg-[#0b1326] border border-[#1f2a44] rounded space-y-1">
                  <div className="flex items-center justify-between text-[#869397]">
                    <span>Total Mission Cost</span>
                    <span className="text-[10px] text-emerald-400">Verified Return</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold text-[#dae2fd]">{item.totalCost}</span>
                    <span className="text-[10px] text-[#869397]">Time: {item.durationSeconds}s</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
