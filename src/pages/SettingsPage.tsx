import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Bot,
  Battery,
  Sliders,
  RotateCcw,
  Shield,
  Volume2,
  Cpu,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    robot,
    simulationSpeedMs,
    setSimulationSpeedMs,
    resetGraph,
    resetRobotToDock,
    addLog,
  } = useApp();

  const [soundAlerts, setSoundAlerts] = useState(true);
  const [debugTelemetry, setDebugTelemetry] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSave = () => {
    addLog('SYSTEM', 'Operational settings updated and committed.', 'success');
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#1f2a44]">
        <div>
          <div className="flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[#627a8d]" />
            <h1 className="text-2xl font-bold tracking-tight text-[#dae2fd]">
              Fleet & System Settings
            </h1>
          </div>
          <p className="text-xs text-[#869397] font-mono mt-1">
            Robotics hardware thresholds, Uniform Cost Search solver tuning, and mission safety parameters.
          </p>
        </div>

        {savedNotification && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded text-xs font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved</span>
          </div>
        )}
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hardware & Robotics Telemetry */}
        <div className="p-5 bg-[#131b2e] border border-[#1f2a44] rounded-lg space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#1f2a44]">
            <Bot className="w-5 h-5 text-[#627a8d]" />
            <h2 className="text-sm font-bold uppercase font-mono text-[#dae2fd]">
              Robotics Telemetry & Drive Actuators
            </h2>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-[#869397] block mb-1">Unit Serial Tag</label>
              <input
                type="text"
                disabled
                value={robot.id}
                className="w-full p-2 bg-[#0b1326] border border-[#1f2a44] rounded text-[#bcc9cd] opacity-80 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-[#869397] block mb-1">Cruise Speed (meters/second)</label>
              <input
                type="text"
                disabled
                value={`${robot.speedMps} m/s`}
                className="w-full p-2 bg-[#0b1326] border border-[#1f2a44] rounded text-[#bcc9cd] opacity-80 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-[#869397] block mb-1">Hop Traversal Latency (Simulation Speed)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="400"
                  max="2500"
                  step="100"
                  value={simulationSpeedMs}
                  onChange={(e) => setSimulationSpeedMs(parseInt(e.target.value))}
                  className="flex-1 accent-emerald-500 cursor-pointer"
                />
                <span className="w-16 text-right font-bold text-[#dae2fd]">{simulationSpeedMs} ms</span>
              </div>
            </div>

            <div>
              <label className="text-[#869397] block mb-1">Low Battery Threshold (%)</label>
              <div className="flex items-center justify-between p-2.5 bg-[#0b1326] border border-[#1f2a44] rounded">
                <span className="text-[#dae2fd]">Automatic Recharge at 20%</span>
                <span className="text-xs text-amber-400 font-bold">LOCKED FOR SAFETY</span>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm & Clinical Routing Policies */}
        <div className="p-5 bg-[#131b2e] border border-[#1f2a44] rounded-lg space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#1f2a44]">
            <Cpu className="w-5 h-5 text-[#627a8d]" />
            <h2 className="text-sm font-bold uppercase font-mono text-[#dae2fd]">
              Pathfinding Engine & Safety Constraints
            </h2>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-[#0b1326] border border-[#1f2a44] rounded space-y-1">
              <span className="text-[#dae2fd] font-bold block">Solver: Uniform Cost Search (UCS)</span>
              <p className="text-[11px] text-[#869397] leading-relaxed">
                Min-heap priority queue dynamically minimizes cumulative cost g(n). Guaranteed complete and optimal for positive corridor edge weights.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0b1326] border border-[#1f2a44] rounded">
              <div>
                <span className="text-[#dae2fd] font-semibold block">Audible Telemetry Chimes</span>
                <span className="text-[11px] text-[#869397]">Sound feedback during obstacle detection & handoff</span>
              </div>
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => setSoundAlerts(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0b1326] border border-[#1f2a44] rounded">
              <div>
                <span className="text-[#dae2fd] font-semibold block">Verbose State Space Logs</span>
                <span className="text-[11px] text-[#869397]">Record detailed STRIPS add/delete sets in logs</span>
              </div>
              <input
                type="checkbox"
                checked={debugTelemetry}
                onChange={(e) => setDebugTelemetry(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* System Actions & Reset */}
      <div className="p-5 bg-[#131b2e] border border-[#1f2a44] rounded-lg space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#1f2a44]">
          <Shield className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold uppercase font-mono text-[#dae2fd]">
            Factory Maintenance & Graph Reset
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div>
            <span className="text-[#dae2fd] font-bold block">Reset Hospital Graph Corridors</span>
            <span className="text-[11px] text-[#869397]">
              Unblocks all blocked corridors and restores factory edge weights (e.g., A→B=2, B→D=3, etc.)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetGraph}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#171f33] hover:bg-[#1f2a44] border border-[#2d3d63] text-[#dae2fd] rounded transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#627a8d]" />
              <span>Reset Corridors & Weights</span>
            </button>
            <button
              onClick={resetRobotToDock}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#171f33] hover:bg-[#1f2a44] border border-[#2d3d63] text-[#dae2fd] rounded transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Robot to Dock</span>
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold transition shadow-sm"
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
