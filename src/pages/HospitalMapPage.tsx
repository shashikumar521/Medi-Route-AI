import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GraphCanvas } from '../components/map/GraphCanvas';
import { NodeId } from '../types';
import { runUCS } from '../utils/ucs';
import {
  Network,
  ShieldAlert,
  Play,
  RotateCcw,
  Sliders,
  Compass,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const HospitalMapPage: React.FC = () => {
  const {
    nodes,
    edges,
    toggleBlockEdge,
    setEdgeCost,
    resetGraph,
    robot,
  } = useApp();

  const [startNode, setStartNode] = useState<NodeId>('Pharmacy');
  const [goalNode, setGoalNode] = useState<NodeId>('Room F-102');
  const [calculatedPath, setCalculatedPath] = useState<NodeId[]>([]);
  const [calculatedCost, setCalculatedCost] = useState<number | null>(null);
  const [visitedNodes, setVisitedNodes] = useState<NodeId[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Compute UCS between selected start and goal
  const handleCalculateRoute = () => {
    setSearchError(null);
    const result = runUCS(startNode, goalNode, edges);
    if (result.success) {
      setCalculatedPath(result.path);
      setCalculatedCost(result.cost);
      setVisitedNodes(result.visitedNodes);
    } else {
      setCalculatedPath([]);
      setCalculatedCost(null);
      setVisitedNodes(result.visitedNodes);
      setSearchError(result.errorMessage || 'No route found.');
    }
  };

  // Re-calculate route when edges change if path is active
  React.useEffect(() => {
    if (calculatedPath.length > 0) {
      const result = runUCS(startNode, goalNode, edges);
      if (result.success) {
        setCalculatedPath(result.path);
        setCalculatedCost(result.cost);
        setVisitedNodes(result.visitedNodes);
        setSearchError(null);
      } else {
        setCalculatedPath([]);
        setCalculatedCost(null);
        setSearchError('Blocked corridor severed current route. No alternate route available.');
      }
    }
  }, [edges]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#1f2a44]">
        <div>
          <div className="flex items-center gap-2.5">
            <Network className="w-6 h-6 text-[#627a8d]" />
            <h1 className="text-2xl font-bold tracking-tight text-[#dae2fd]">
              Hospital Topological Graph
            </h1>
          </div>
          <p className="text-xs text-[#869397] font-mono mt-1">
            Topological graph with real-time weighted corridors, dynamic blockage simulation, and UCS route recalculation.
          </p>
        </div>

        <button
          onClick={resetGraph}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171f33] hover:bg-[#1f2a44] border border-[#2d3d63] text-[#dae2fd] rounded text-xs font-mono transition"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#627a8d]" />
          <span>Reset Default Graph</span>
        </button>
      </div>

      {/* Control Strip: Start & Goal Node Selectors and Path Test */}
      <div className="p-4 bg-[#131b2e] border border-[#1f2a44] rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          {/* Start Node */}
          <div className="flex items-center gap-2">
            <span className="text-[#869397]">Start Node:</span>
            <select
              value={startNode}
              onChange={(e) => setStartNode(e.target.value)}
              className="px-3 py-1.5 bg-[#0b1326] border border-[#1f2a44] rounded text-xs text-[#dae2fd]"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[#627a8d] hidden sm:inline">→</span>

          {/* Goal Node */}
          <div className="flex items-center gap-2">
            <span className="text-[#869397]">Goal Node:</span>
            <select
              value={goalNode}
              onChange={(e) => setGoalNode(e.target.value)}
              className="px-3 py-1.5 bg-[#0b1326] border border-[#1f2a44] rounded text-xs text-[#dae2fd]"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>

          {/* Test UCS Route Button */}
          <button
            onClick={handleCalculateRoute}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold transition shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Compute UCS Path</span>
          </button>
        </div>

        {/* Current Result Stats */}
        {calculatedCost !== null && (
          <div className="flex items-center gap-3 text-xs font-mono bg-[#0b1326] px-3 py-1.5 rounded border border-[#1f2a44]">
            <span className="text-[#869397]">Calculated Cost:</span>
            <span className="text-[#c084fc] font-bold text-sm">{calculatedCost}</span>
            <span className="text-[#869397]">|</span>
            <span className="text-[#869397]">Nodes:</span>
            <span className="text-[#dae2fd]">{calculatedPath.length}</span>
          </div>
        )}
      </div>

      {searchError && (
        <div className="p-3 bg-red-950/80 border border-red-800 rounded text-xs font-mono text-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Hospital Map Canvas */}
      <div className="rounded-lg overflow-hidden border border-[#1f2a44]">
        <GraphCanvas
          height={540}
          highlightPath={calculatedPath}
          visitedNodes={visitedNodes}
          startNode={startNode}
          goalNode={goalNode}
          showControls={true}
        />
      </div>

      {/* Corridor Quick Control Matrix */}
      <div className="p-4 bg-[#131b2e] border border-[#1f2a44] rounded-lg space-y-3">
        <div className="flex items-center justify-between border-b border-[#1f2a44] pb-2.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#dae2fd]">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Corridor Segment Management (Click to Block / Unblock / Modify Weights)</span>
          </div>
          <span className="text-xs font-mono text-[#869397]">
            {edges.filter((e) => e.blocked).length} Corridors Currently Blocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 text-xs font-mono">
          {edges.map((edge) => (
            <div
              key={edge.id}
              className={`p-2.5 rounded border flex items-center justify-between transition ${
                edge.blocked
                  ? 'bg-red-950/40 border-red-800/80 text-red-200'
                  : 'bg-[#0b1326] border-[#1f2a44] text-[#bcc9cd]'
              }`}
            >
              <div>
                <span className="font-semibold block text-[#dae2fd] text-[11px]">
                  {edge.from} ↔ {edge.to}
                </span>
                <span className="text-[10px] text-[#869397]">
                  Weight Cost: <strong className="text-[#dae2fd]">{edge.cost}</strong>
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => toggleBlockEdge(edge.id)}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition ${
                    edge.blocked
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-red-900/80 hover:bg-red-800 text-red-200 border border-red-700'
                  }`}
                >
                  {edge.blocked ? 'Clear' : 'Block'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
