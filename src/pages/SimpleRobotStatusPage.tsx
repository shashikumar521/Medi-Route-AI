import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GraphCanvas } from '../components/map/GraphCanvas';
import {
  Bot,
  Battery,
  MapPin,
  Zap,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export const SimpleRobotStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const { robot, activeOrder, rechargeRobot, resetRobotToDock, emergencyStop } = useApp();

  const isDelivering = robot.status !== 'IDLE' && robot.status !== 'CHARGING' && robot.status !== 'EMERGENCY_STOP';

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-2">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Robot Status</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Live status of the hospital autonomous courier robot.
        </p>
      </div>

      {/* Primary Robot Status Card per Section 17 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xs">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Robot MR-001</h2>
              <span className="text-xs text-slate-500 font-medium">Autonomous Clinical Carrier</span>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              robot.status === 'IDLE'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : robot.status === 'EMERGENCY_STOP'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
            }`}
          >
            ● {robot.status === 'IDLE' ? 'Available' : isDelivering ? 'Delivering' : robot.status}
          </span>
        </div>

        {/* Clean Spec Rows */}
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-500 font-medium">Current Location:</span>
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              {robot.currentLocation}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-500 font-medium">Battery:</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${robot.battery < 25 ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${robot.battery}%` }}
                />
              </div>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Battery className="w-4 h-4 text-emerald-600" />
                {robot.battery}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-500 font-medium">Current Task:</span>
            <span className="font-bold text-slate-900">
              {isDelivering && activeOrder
                ? `Delivering ${activeOrder.item} to ${activeOrder.destination}`
                : 'None (Ready)'}
            </span>
          </div>

          {isDelivering && activeOrder && (
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
              <span className="font-medium">Destination:</span>
              <strong className="font-bold">{activeOrder.destination}</strong>
            </div>
          )}
        </div>

        {/* Simple Operations / Reset Controls */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={rechargeRobot}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5 transition"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Send to Charging Station</span>
            </button>

            <button
              onClick={resetRobotToDock}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Return to Base</span>
            </button>
          </div>

          <button
            onClick={emergencyStop}
            className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-semibold flex items-center gap-1.5 transition"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Emergency Stop</span>
          </button>
        </div>
      </div>

      {/* Mini Hospital Map preview showing robot position */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700">Robot Position on Hospital Map:</span>
        <div className="rounded-xl overflow-hidden border border-slate-200">
          <GraphCanvas height={320} showControls={false} />
        </div>
      </div>
    </div>
  );
};
