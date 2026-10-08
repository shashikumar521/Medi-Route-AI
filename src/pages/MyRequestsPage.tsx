import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Clock,
  MapPin,
  CheckCircle2,
  PlusCircle,
  Pill,
  ArrowRight,
  Package,
  Bot,
  Truck,
  RotateCcw,
} from 'lucide-react';

export const MyRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, selectTrackingOrder, deliveryPhase, robot } = useApp();

  const activeOrders = orders.filter((o) => o.status !== 'Completed' && o.status !== 'Failed');
  const completedOrders = orders.filter((o) => o.status === 'Completed');

  const handleOpenTracking = (orderId: string) => {
    selectTrackingOrder(orderId);
    navigate(`/tracking?id=${orderId}`);
  };

  const getStatusTextAndBadge = (order: typeof orders[0]) => {
    if (order.status === 'Completed') {
      return {
        text: '✓ Completed',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
      };
    }

    if (order.status === 'Navigating') {
      return {
        text: '● On the way',
        className: 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse',
        icon: Truck,
      };
    }

    if (order.status === 'Delivered') {
      return {
        text: '✓ Delivered',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
      };
    }

    if (order.status === 'Returning') {
      return {
        text: '↩ Robot Returning',
        className: 'bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse',
        icon: RotateCcw,
      };
    }

    if (order.status === 'Processing') {
      return {
        text: '📦 Preparing at Pharmacy',
        className: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse',
        icon: Package,
      };
    }

    return {
      text: 'Pending',
      className: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: Clock,
    };
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Requests</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tap any request to open live hospital map tracking.
          </p>
        </div>

        <button
          onClick={() => navigate('/new-request')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Request</span>
        </button>
      </div>

      {/* SECTION 1: ACTIVE / PENDING REQUESTS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
            <span>Active & In-Progress Requests ({activeOrders.length})</span>
          </h2>
          {activeOrders.length > 0 && (
            <span className="text-xs text-blue-600 font-semibold">
              Live updates active
            </span>
          )}
        </div>

        {activeOrders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-500 space-y-2">
            <p className="text-sm">No active delivery requests right now.</p>
            <button
              onClick={() => navigate('/new-request')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              + Create a new delivery request
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((order) => {
              const badge = getStatusTextAndBadge(order);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={order.id}
                  onClick={() => handleOpenTracking(order.id)}
                  className="bg-white hover:bg-blue-50/40 border border-blue-200 hover:border-blue-400 rounded-2xl p-5 shadow-xs cursor-pointer transition space-y-3 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition shrink-0">
                        💊
                      </div>
                      <div>
                        <div className="font-bold text-base text-slate-900 group-hover:text-blue-700">
                          {order.item} × {order.quantity}
                        </div>
                        <div className="text-xs text-slate-400">Order ID: {order.id}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${badge.className}`}
                      >
                        <BadgeIcon className="w-3.5 h-3.5" />
                        <span>{badge.text}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 pt-0.5">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-semibold text-slate-900">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        Deliver to: {order.destination}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">Ordered at: {order.createdAt}</span>
                    </div>

                    <div className="text-xs font-bold text-blue-600 group-hover:text-blue-800 flex items-center gap-1">
                      <span>Open Live Tracking</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: COMPLETED REQUESTS */}
      <div className="space-y-3 pt-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Completed Requests ({completedOrders.length})</span>
        </h2>

        {completedOrders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-sm">
            No completed requests in history.
          </div>
        ) : (
          <div className="space-y-2.5">
            {completedOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => handleOpenTracking(order.id)}
                className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-blue-700">
                      {order.item} × {order.quantity}
                    </span>
                    <span className="text-xs text-slate-400">({order.id})</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      {order.destination}
                    </span>
                    <span>•</span>
                    <span>{order.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ Completed
                  </span>
                  <div className="text-xs text-slate-400 group-hover:text-slate-600 flex items-center gap-1">
                    <span>View Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
