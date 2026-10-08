import React, { useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LiveTrackingMap } from '../components/map/LiveTrackingMap';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Bot,
  Battery,
  ArrowRight,
  RotateCcw,
  PlusCircle,
  Package,
  Truck,
  Sparkles,
  Play,
  ArrowLeft,
} from 'lucide-react';

export const DeliveryTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const orderIdParam = orderId || searchParams.get('id');

  const {
    orders,
    activeOrder,
    robot,
    deliveryPhase,
    phaseMessage,
    doctorSteps,
    activeUCSResult,
    returnUCSResult,
    originalSavedLocation,
    startOrderDelivery,
    resetRobotToDock,
  } = useApp();

  // Find target order: either from URL param, active order, or first order in queue
  const targetOrder =
    (orderIdParam ? orders.find((o) => o.id === orderIdParam) : null) ||
    activeOrder ||
    orders[0] ||
    null;

  // Active delivery path: if currently active, use live UCS calculation or stored order paths
  const isCurrentlyDeliveringThisOrder =
    activeOrder?.id === targetOrder?.id && deliveryPhase !== 'IDLE';

  const isReturning = deliveryPhase === 'NAVIGATING_RETURN' || deliveryPhase === 'CALCULATE_RETURN_PATH';

  const activePath = isCurrentlyDeliveringThisOrder
    ? isReturning
      ? returnUCSResult?.path || targetOrder?.returnPath || []
      : activeUCSResult?.path || targetOrder?.deliveryPath || []
    : targetOrder?.deliveryPath || [];

  const routeCost = isCurrentlyDeliveringThisOrder
    ? isReturning
      ? returnUCSResult?.cost || targetOrder?.returnCost || 0
      : activeUCSResult?.cost || targetOrder?.deliveryCost || 0
    : targetOrder?.deliveryCost || 7;

  // Determine packing & pickup animations
  const isPreparing = isCurrentlyDeliveringThisOrder && deliveryPhase === 'PREPARING';
  const isPickingUp = isCurrentlyDeliveringThisOrder && (deliveryPhase === 'PICK_ITEM' || deliveryPhase === 'ITEM_READY');
  const isDelivered =
    (isCurrentlyDeliveringThisOrder &&
      ['DELIVER_ITEM', 'CALCULATE_RETURN_PATH', 'NAVIGATING_RETURN', 'ORDER_COMPLETED'].includes(deliveryPhase)) ||
    targetOrder?.status === 'Delivered' ||
    targetOrder?.status === 'Completed';

  if (!targetOrder) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4 bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center">
          <Bot className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Request Selected</h2>
        <p className="text-sm text-slate-500">
          Please select a request from My Requests or create a new delivery order.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => navigate('/requests')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            Go to My Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/requests')}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
            title="Back to My Requests"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Delivery Tracking</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live hospital robotics tracking and autonomous UCS routing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {targetOrder.status === 'Pending' && !isCurrentlyDeliveringThisOrder && (
            <button
              onClick={() => startOrderDelivery(targetOrder.id)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Delivery Now</span>
            </button>
          )}

          <button
            onClick={() => navigate('/new-request')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* Main Order Header Card per Section 2 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
              Delivery Request
            </span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              {targetOrder.item} × {targetOrder.quantity}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">Order ID: {targetOrder.id}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {targetOrder.destination}
              </span>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${
              targetOrder.status === 'Completed'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
            }`}
          >
            {targetOrder.status === 'Completed' ? '✓ Delivery Completed' : `● ${phaseMessage}`}
          </span>
        </div>

        {/* 7-Step Horizontal Progress Indicator per Section 13 */}
        <div className="py-2 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Delivery Progress</span>
            <span className="text-blue-600 font-semibold lowercase">
              {isCurrentlyDeliveringThisOrder ? 'live execution' : targetOrder.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
            {doctorSteps.map((step, idx) => {
              const isPast = step.status === 'completed';
              const isCurrent = step.status === 'current';

              return (
                <div
                  key={step.id}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                    isPast
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : isCurrent
                      ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold ring-2 ring-blue-500/20'
                      : 'bg-slate-50/70 border-slate-100 text-slate-400'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isPast
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPast ? '✓' : idx + 1}
                  </span>
                  <span className="text-[11px] leading-tight text-center">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Large Animated Hospital Map per Section 2 & 3 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <span>Hospital Trajectory & Real-Time Route</span>
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            Dynamically solved via Uniform Cost Search
          </span>
        </div>

        <LiveTrackingMap
          order={targetOrder}
          currentPath={activePath}
          robotLocation={robot.currentLocation}
          destination={targetOrder.destination}
          pickupLocation={targetOrder.pickupLocation}
          isPreparing={isPreparing}
          isPickingUp={isPickingUp}
          isDelivered={isDelivered}
          isReturning={isReturning}
          height={440}
        />
      </div>

      {/* Section 8: Current Location Information Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-medium">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-bold block">Robot ID</span>
          <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-blue-600" />
            <span>{robot.id}</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-bold block">Current Location</span>
          <div className="font-bold text-blue-700 text-sm flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>{robot.currentLocation}</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-bold block">Destination</span>
          <div className="font-bold text-emerald-700 text-sm flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>{isReturning ? originalSavedLocation : targetOrder.destination}</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-bold block">Route Cost</span>
          <div className="font-bold text-slate-900 text-sm">
            {routeCost} <span className="text-xs text-slate-500 font-normal">corridor weight</span>
          </div>
        </div>
      </div>

      {/* Detailed Status Explanation Box */}
      <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1">
        <div className="font-bold flex items-center gap-1.5 text-sm">
          <span>Current Status:</span>
          <span className="text-blue-700">{phaseMessage}</span>
        </div>
        <p className="text-blue-800 text-[11px] leading-relaxed">
          {deliveryPhase === 'NAVIGATING_RETURN'
            ? `The medicine has been delivered to ${targetOrder.destination}. The robot is now returning to its docking base at ${originalSavedLocation} using the lowest-cost reverse corridor trajectory.`
            : deliveryPhase === 'ORDER_COMPLETED'
            ? `The delivery was completed successfully. Robot MR-001 has returned to its base and is available for new requests.`
            : `The robot is moving node-by-node along the path calculated dynamically by Uniform Cost Search. If any corridor is blocked, the robot will automatically find another clear route.`}
        </p>
      </div>
    </div>
  );
};
