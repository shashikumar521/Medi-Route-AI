import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Clock,
  MapPin,
  CheckCircle2,
  PlusCircle,
  Pill,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const MyRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders } = useApp();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const filteredOrders = orders.filter((o) => {
    if (filter === 'ACTIVE') return o.status !== 'Completed' && o.status !== 'Failed';
    if (filter === 'COMPLETED') return o.status === 'Completed';
    return true;
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Requests</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            History of your hospital delivery requests and current delivery statuses.
          </p>
        </div>

        <button
          onClick={() => navigate('/new-request')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Request</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        {[
          { key: 'ALL', label: 'All Requests' },
          { key: 'ACTIVE', label: 'In Progress' },
          { key: 'COMPLETED', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filter === tab.key
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">
          Showing {filteredOrders.length} requests
        </span>
      </div>

      {/* Requests List - Clean Cards per Section 16 */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
            No requests found for this filter.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isCompleted = order.status === 'Completed';
            const isInProgress =
              order.status === 'Navigating' ||
              order.status === 'Processing' ||
              order.status === 'Delivered' ||
              order.status === 'Returning';

            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-900">
                      {order.item} × {order.quantity}
                    </span>
                    <span className="text-xs text-slate-400">({order.id})</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-medium text-slate-800">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      {order.destination}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3" />
                      {order.createdAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isInProgress
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {isCompleted
                      ? '✓ Completed'
                      : isInProgress
                      ? '● In Progress'
                      : order.status}
                  </span>

                  {isInProgress && (
                    <button
                      onClick={() => navigate('/tracking')}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Track
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
