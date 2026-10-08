import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GraphCanvas } from '../components/map/GraphCanvas';
import { runUCS } from '../utils/ucs';
import { NodeId } from '../types';
import {
  Bot,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Battery,
  ShieldAlert,
  ArrowRight,
  Radio,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Compass,
} from 'lucide-react';

export const RobotControlPage: React.FC = () => {
  const {
    robot,
    deliveryPhase,
    phaseMessage,
    activeOrder,
    activeUCSResult,
    returnUCSResult,
    nodes,
    edges,
    startDemoDelivery,
    pauseWorkflow,
    resumeWorkflow,
    resetRobotToDock,
    rechargeRobot,
    emergencyStop,
    simulationSpeedMs,
    setSimulationSpeedMs,
  } = useApp();

  const [manualTarget, setManualTarget] = useState<NodeId>('Room F-102');

  const currentPath =
    deliveryPhase === 'NAVIGATING_RETURN'
      ? returnUCSResult?.path || []
      : activeUCSResult?.path || [];

  const currentPathCost =
    deliveryPhase === 'NAVIGATING_RETURN'
      ? returnUCSResult?.cost || 0
      : activeUCSResult?.cost || 0;

  // Next node preview
  const currentIndex = currentPath.indexOf(robot.currentLocation);
  const nextNode =
    currentIndex >= 0 && currentIndex < currentPath.length - 1
      ? currentPath[currentIndex + 1]
      : 'None (Stationary)';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#1f2a44]">
        <div>
          <div className="flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-[#627a8d]" />
            <h1 className="text-2xl font-bold tracking-tight text-[#dae2fd]">
              Autonomous Unit MR-001 Control
            </h1>
          </div>
          <p className="text-xs text-[#869397] font-mono mt-1">
            Real-time telemetry diagnostics, actuator dispatch, battery telemetry & dynamic UCS trajectory navigation.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={startDemoDelivery}
            disabled={robot.status !== 'IDLE' && deliveryPhase !== 'IDLE'}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-[#1f2a44] disabled:text-[#869397] text-white rounded font-bold transition shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Auto Navigate (Demo)</span>
          </button>

          <button
            onClick={pauseWorkflow}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171f33] hover:bg-[#1f2a44] border border-[#2d3d63] text-[#bcc9cd] hover:text-[#dae2fd] rounded transition"
          >
            <Pause className="w-3.5 h-3.5 text-amber-400" />
            <span>Pause</span>
          </button>

          <button
            onClick={resumeWorkflow}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171f33] hover:bg-[#1f2a44] border border-[#2d3d63] text-[#bcc9cd] hover:text-[#dae2fd] rounded transition"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>Resume</span>
          </button>

          <button
            onClick={rechargeRobot}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171f33] hover:bg-[#1f2a44] border border-[#2d3d63] text-sky-300 hover:text-white rounded transition"
          >
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <span>Return to Charge</span>
          </button>

          <button
            onClick={resetRobotToDock}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171f33] hover:bg-[#1f2a44] border border-[#2d3d63] text-[#869397] hover:text-[#dae2fd] rounded transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={emergencyStop}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-200 rounded font-bold transition"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>E-STOP</span>
          </button>
        </div>
      </div>

      {/* Primary Telemetry Readout Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 font-mono text-xs">
        <div className="p-3 bg-[#131b2e] border border-[#1f2a44] rounded">
          <span className="text-[#869397] block text-[10px] uppercase">Unit Serial</span>
          <span className="text-[#dae2fd] font-bold text-sm block mt-1">{robot.id}</span>
        </div>

        <div className="p-3 bg-[#131b2e] border border-[#1f2a44] rounded">
          <span className="text-[#869397] block text-[10px] uppercase">Current Node</span>
          <span className="text-[#60a5fa] font-bold text-sm block mt-1 truncate">{robot.currentLocation}</span>
        </div>

        <div className="p-3 bg-[#131b2e] border border-[#1f2a44] rounded">
          <span className="text-[#869397] block text-[10px] uppercase">Next Waypoint</span>
          <span className="text-[#dae2fd] font-bold text-sm block mt-1 truncate">{nextNode}</span>
        </div>

        <div className="p-3 bg-[#131b2e] border border-[#1f2a44] rounded">
          <span className="text-[#869397] block text-[10px] uppercase">Target Goal</span>
          <span className="text-[#10b981] font-bold text-sm block mt-1 truncate">
            {robot.goalLocation || 'None'}
          </span>
        </div>

        <div className="p-3 bg-[#131b2e] border border-[#1f2a44] rounded">
          <span className="text-[#869397] block text-[10px] uppercase">Path Cost</span>
          <span className="text-[#c084fc] font-bold text-sm block mt-1">{currentPathCost}</span>
        </div>

        <div className="p-3 bg-[#131b2e] border border-[#1f2a44] rounded">
          <span className="text-[#869397] block text-[10px] uppercase">Speed</span>
          <span className="text-[#dae2fd] font-bold text-sm block mt-1">{robot.speedMps} m/s</span>
        </div>

        <div className="p-3 bg-[#131b2e] border border-[#1f2a44] rounded">
          <span className="text-[#869397] block text-[10px] uppercase">Actuator State</span>
          <span
            className={`font-bold text-xs block mt-1 uppercase ${
              robot.status === 'IDLE'
                ? 'text-emerald-400'
                : robot.status === 'EMERGENCY_STOP'
                ? 'text-red-400'
                : 'text-amber-400'
            }`}
          >
            {robot.status}
          </span>
        </div>

        <div className="p-3 bg-[#131b2e] border border-[#1f2a44] rounded">
          <span className="text-[#869397] block text-[10px] uppercase">Battery</span>
          <div className="flex items-center gap-1 mt-1 font-bold text-sm">
            <Zap className={`w-3.5 h-3.5 ${robot.battery < 25 ? 'text-red-400' : 'text-emerald-400'}`} />
            <span className={robot.battery < 25 ? 'text-red-400' : 'text-emerald-400'}>
              {robot.battery}%
            </span>
          </div>
        </div>
      </div>

      {/* Battery Status & Simulation Speed Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Battery Telemetry Panel */}
        <div className="p-4 bg-[#131b2e] border border-[#1f2a44] rounded-lg space-y-3">
          <div className="flex items-center justify-between border-b border-[#1f2a44] pb-2 text-xs font-mono">
            <div className="flex items-center gap-2 font-bold uppercase text-[#dae2fd]">
              <Battery className="w-4 h-4 text-emerald-400" />
              <span>40kW Inductive Power Core</span>
            </div>
            <span className="text-[#869397]">Reserve Threshold: 20%</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#bcc9cd]">Capacity Remaining:</span>
              <span className={`font-bold ${robot.battery < 25 ? 'text-red-400' : 'text-emerald-400'}`}>
                {robot.battery}% ({Math.round(robot.battery * 0.4)} kWh)
              </span>
            </div>
            <div className="w-full bg-[#0b1326] h-3 rounded-full overflow-hidden border border-[#1f2a44]">
              <div
                className={`h-full transition-all duration-500 ${
                  robot.battery < 25 ? 'bg-red-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${robot.battery}%` }}
              />
            </div>
            <p className="text-[11px] text-[#869397] font-mono">
              {robot.battery <= 20
                ? '⚠️ BATTERY CRITICAL: Robot must navigate to Charging Station via UCS before further mission dispatches.'
                : 'Nominal operational range. Actuators consume battery proportional to edge traversal weights.'}
            </p>
          </div>
        </div>

        {/* Simulation Speed & Trajectory Readout */}
        <div className="p-4 bg-[#131b2e] border border-[#1f2a44] rounded-lg space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#1f2a44] pb-2">
            <div className="flex items-center gap-2 font-bold uppercase text-[#dae2fd]">
              <Sliders className="w-4 h-4 text-[#627a8d]" />
              <span>Telemetry Interval & Simulation Speed</span>
            </div>
            <span className="text-[#dae2fd]">{simulationSpeedMs} ms / hop</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-[#869397] text-[11px]">Fast (500ms)</span>
              <input
                type="range"
                min="400"
                max="2500"
                step="100"
                value={simulationSpeedMs}
                onChange={(e) => setSimulationSpeedMs(parseInt(e.target.value))}
                className="flex-1 accent-emerald-500 cursor-pointer"
              />
              <span className="text-[#869397] text-[11px]">Slow (2500ms)</span>
            </div>
            <div className="p-2.5 bg-[#0b1326] border border-[#1f2a44] rounded text-[11px] text-[#bcc9cd] space-y-1">
              <div>Active Phase: <strong className="text-[#dae2fd]">{deliveryPhase}</strong></div>
              <div>Status Log: <span className="text-[#869397]">{phaseMessage}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Map with Robot Position */}
      <div className="rounded-lg overflow-hidden border border-[#1f2a44]">
        <GraphCanvas
          height={480}
          highlightPath={currentPath}
          showControls={false}
        />
      </div>
    </div>
  );
};
