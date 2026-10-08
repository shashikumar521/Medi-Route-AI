import React from 'react';
import { useApp } from '../context/AppContext';
import { GraphCanvas } from '../components/map/GraphCanvas';
import { Cpu, Layers, ListOrdered, ShieldAlert, RotateCcw, Play } from 'lucide-react';

export const SystemArchitecturePage: React.FC = () => {
  const {
    robot,
    stripsState,
    stripsActions,
    activeUCSResult,
    returnUCSResult,
    edges,
    toggleBlockEdge,
    resetGraph,
    aiExplanation,
  } = useApp();

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">
              System Architecture & AI Solver Diagnostics
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal demonstration panel showing Uniform Cost Search, min-heap priority queue, and STRIPS action rules.
          </p>
        </div>

        <button
          onClick={resetGraph}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Corridors</span>
        </button>
      </div>

      {/* State-Space Vectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
          <span className="text-slate-400 font-semibold block text-[10px] uppercase">Original State</span>
          <div className="font-bold text-slate-900 text-sm">RobotAt = {robot.originalLocation}</div>
          <p className="text-slate-500 text-[11px]">Saved before mission starts for return UCS.</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
          <span className="text-blue-500 font-semibold block text-[10px] uppercase">Current State</span>
          <div className="font-bold text-blue-700 text-sm">RobotAt = {robot.currentLocation}</div>
          <div className="text-slate-500 text-[11px]">HasItem = {robot.hasItem ? 'true' : 'false'}</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
          <span className="text-emerald-500 font-semibold block text-[10px] uppercase">Goal State</span>
          <div className="font-bold text-emerald-700 text-sm">{robot.goalLocation || 'Room F-102'}</div>
          <div className="text-slate-500 text-[11px]">ItemDelivered = {robot.delivered ? 'true' : 'false'}</div>
        </div>
      </div>

      {/* STRIPS Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>STRIPS-Style Planning Rules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          {stripsActions.map((action) => (
            <div
              key={action.name}
              className={`p-3 rounded-xl border ${
                action.isExecutable
                  ? 'bg-emerald-50/50 border-emerald-300'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="font-bold text-slate-900">{action.name}</div>
              <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                <div>
                  <strong className="text-slate-500">Pre:</strong>{' '}
                  {Object.entries(action.preconditions).map(([k, v]) => `${k}=${v}`).join(', ')}
                </div>
                <div className="text-emerald-700">
                  <strong>+Add:</strong>{' '}
                  {Object.entries(action.addEffects).map(([k, v]) => `${k}=${v}`).join(', ')}
                </div>
                <div className="text-red-600">
                  <strong>-Del:</strong>{' '}
                  {Object.entries(action.deleteEffects).map(([k, v]) => `${k}=${v}`).join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Corridor Blocking Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Corridor Blockage Simulation (Test Re-Routing)</span>
          </div>
          <span className="text-xs text-slate-500">
            {edges.filter((e) => e.blocked).length} corridors blocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs font-mono">
          {edges.map((edge) => (
            <button
              key={edge.id}
              onClick={() => toggleBlockEdge(edge.id)}
              className={`p-2.5 rounded-lg border text-left transition ${
                edge.blocked
                  ? 'bg-red-50 border-red-300 text-red-800 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="truncate">{edge.from} ↔ {edge.to}</div>
              <div className="text-[10px] mt-0.5">
                Cost: {edge.cost} • {edge.blocked ? '🔴 BLOCKED' : '🟢 CLEAR'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Explanation readout */}
      {aiExplanation && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 whitespace-pre-wrap">
          <div className="font-bold text-slate-900 mb-1">UCS Solver Decision:</div>
          {aiExplanation}
        </div>
      )}
    </div>
  );
};
