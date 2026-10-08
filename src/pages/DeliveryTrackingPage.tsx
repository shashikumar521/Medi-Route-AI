import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GraphCanvas } from '../components/map/GraphCanvas';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Bot,
  Battery,
  ArrowRight,
  RotateCcw,
  PlusCircle,
  Eye,
  Check,
  ChevronRight,
} from 'lucide-react';

export const DeliveryTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeOrder,
    robot,
    deliveryPhase,
    phaseMessage,
    doctorSteps,
    activeUCSResult,
    returnUCSResult,
    originalSavedLocation,
    resetRobotToDock,
  } = useApp();

  const [showMapRoute, setShowMapRoute] = useState(true);

  // If there's no active delivery order and robot is idle, show a friendly empty state
  if (!activeOrder && robot.status === 'IDLE' && deliveryPhase === 'IDLE') {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4 bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center">
          <Bot className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Active Delivery in Progress</h2>
        <p className="text-sm text-slate-500">
          Robot MR-001 is currently parked at {robot.currentLocation} and waiting for requests.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => navigate('/new-request')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            Create New Request
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const activePath =
    deliveryPhase === 'NAVIGATING_RETURN'
      ? returnUCSResult?.path || []
      : activeUCSResult?.path || [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              {deliveryPhase === 'ORDER_COMPLETED'
                ? 'Delivery Completed'
                : 'Delivery in Progress'}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                deliveryPhase === 'ORDER_COMPLETED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-blue-100 text-blue-800 animate-pulse'
              }`}
            >
              {deliveryPhase === 'ORDER_COMPLETED' ? '✓ Completed' : '● Live'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time delivery progress of {activeOrder?.item || 'clinical request'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/new-request')}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Request</span>
          </button>
          <button
            onClick={() => navigate('/requests')}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
          >
            All Requests
          </button>
        </div>
      </div>

      {/* Main Status Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        {/* Item & Destination Quick Bar */}
        {activeOrder && (
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-900 text-sm">
                {activeOrder.item} × {activeOrder.quantity}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Delivering to: <strong className="text-slate-900">{activeOrder.destination}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-500">
              <span>Doctor: <strong className="text-slate-800">{activeOrder.notes?.replace('Prescribed by ', '') || 'Dr. Kumar'}</strong></span>
            </div>
          </div>
        )}

        {/* 6-Stage Progress Checklist per Section 9 */}
        <div className="space-y-3 py-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Live Delivery Checklist
          </h2>

          <div className="space-y-2 text-xs">
            {doctorSteps.map((step, idx) => (
              <div
                key={step.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition ${
                  step.status === 'completed'
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : step.status === 'current'
                    ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-xs'
                    : 'bg-white border-slate-100 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                      step.status === 'completed'
                        ? 'bg-emerald-600 text-white'
                        : step.status === 'current'
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {step.status === 'completed' ? '✓' : idx + 1}
                  </div>
                  <span className="text-sm">{step.label}</span>
                </div>

                <span className="text-xs font-semibold">
                  {step.status === 'completed' ? (
                    <span className="text-emerald-700">Completed</span>
                  ) : step.status === 'current' ? (
                    <span className="text-blue-700 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                      In progress...
                    </span>
                  ) : (
                    <span className="text-slate-400">Waiting</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Simple Robot Location & Route Status */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between text-blue-900">
            <span className="font-semibold flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-blue-600" />
              {deliveryPhase === 'NAVIGATING_RETURN'
                ? 'Robot Returning to Starting Location'
                : 'Best route found'}
            </span>
            <button
              onClick={() => setShowMapRoute(!showMapRoute)}
              className="text-blue-700 hover:text-blue-900 font-bold underline flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              {showMapRoute ? 'Hide Map' : 'View Route on Map'}
            </button>
          </div>

          <div className="text-sm font-bold text-slate-900">
            Robot Location: {robot.currentLocation}
          </div>

          <p className="text-xs text-blue-800">
            {deliveryPhase === 'NAVIGATING_RETURN'
              ? `The payload was delivered. The robot is now returning to its starting location (${originalSavedLocation}).`
              : deliveryPhase === 'ORDER_COMPLETED'
              ? '✓ Robot has safely returned to its docking location. Delivery completed successfully.'
              : `Robot MR-001 is travelling along the lowest-cost clear corridors to ${activeOrder?.destination || 'destination'}.`}
          </p>
        </div>

        {/* Embedded Map Route View */}
        {showMapRoute && (
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-slate-700">
              Live Hospital Trajectory:
            </span>
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <GraphCanvas
                height={340}
                highlightPath={activePath}
                goalNode={activeOrder?.destination}
              />
            </div>
          </div>
        )}

        {/* Completed Delivery Banner */}
        {deliveryPhase === 'ORDER_COMPLETED' && (
          <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-xl text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-full mx-auto flex items-center justify-center font-bold text-xl">
              ✓
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-950">
                Delivery Completed Successfully
              </h3>
              <p className="text-xs text-emerald-800 mt-1">
                {activeOrder?.item} × {activeOrder?.quantity} delivered to {activeOrder?.destination}.
                The robot has returned safely to {originalSavedLocation}.
              </p>
            </div>
            <button
              onClick={() => navigate('/new-request')}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              Start Another Delivery
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
