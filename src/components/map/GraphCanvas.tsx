import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NodeId } from '../../types';
import { MapPin, Check, Navigation, Battery, Zap } from 'lucide-react';

interface GraphCanvasProps {
  interactive?: boolean;
  highlightPath?: NodeId[];
  visitedNodes?: NodeId[];
  startNode?: NodeId;
  goalNode?: NodeId;
  selectedNode?: NodeId;
  height?: number | string;
  onNodeSelect?: (nodeId: NodeId) => void;
  showControls?: boolean;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  interactive = true,
  highlightPath = [],
  startNode,
  goalNode,
  selectedNode,
  height = 420,
  onNodeSelect,
  showControls = false,
}) => {
  const { nodes, edges, robot } = useApp();

  const activePath = highlightPath.length > 0 ? highlightPath : [];

  const isEdgeInPath = (from: NodeId, to: NodeId) => {
    if (activePath.length < 2) return false;
    for (let i = 0; i < activePath.length - 1; i++) {
      const u = activePath[i];
      const v = activePath[i + 1];
      if ((u === from && v === to) || (u === to && v === from)) {
        return true;
      }
    }
    return false;
  };

  const getNodeColor = (category: string) => {
    switch (category) {
      case 'pharmacy':
        return { bg: '#ecfdf5', border: '#10b981', text: '#065f46', badge: 'Pharmacy' };
      case 'room':
        return { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', badge: 'Room' };
      case 'ward':
        return { bg: '#f0fdf4', border: '#22c55e', text: '#166534', badge: 'Ward' };
      case 'icu':
        return { bg: '#fdf4ff', border: '#a855f7', text: '#6b21a8', badge: 'ICU' };
      case 'lab':
        return { bg: '#fff7ed', border: '#f97316', text: '#9a3412', badge: 'Lab' };
      case 'charging':
        return { bg: '#fefce8', border: '#eab308', text: '#854d0e', badge: 'Charging' };
      default:
        return { bg: '#f8fafc', border: '#94a3b8', text: '#334155', badge: 'Corridor' };
    }
  };

  return (
    <div className="relative flex flex-col w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Top Map Header / Legend */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-semibold text-slate-700">Hospital Layout & Navigation</span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>Robot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>Destination</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <span>Delivery Route</span>
          </div>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div
        className="relative w-full overflow-x-auto bg-slate-50/50 flex items-center justify-center p-3"
        style={{ minHeight: height }}
      >
        <svg
          viewBox="0 0 960 520"
          className="w-full max-w-[960px] h-auto select-none"
          style={{ maxHeight: height }}
        >
          {/* Corridor Connections */}
          {edges.map((edge) => {
            const fromNode = nodes.find((n) => n.id === edge.from);
            const toNode = nodes.find((n) => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            const inPath = isEdgeInPath(edge.from, edge.to);
            const isBlocked = edge.blocked;

            const x1 = fromNode.x;
            const y1 = fromNode.y;
            const x2 = toNode.x;
            const y2 = toNode.y;

            return (
              <g key={edge.id}>
                {/* Corridor line */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isBlocked ? '#fca5a5' : inPath ? '#3b82f6' : '#cbd5e1'}
                  strokeWidth={inPath ? 5 : isBlocked ? 3 : 3}
                  strokeDasharray={isBlocked ? '6 4' : 'none'}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />

                {/* Corridor Cost Tag */}
                <g transform={`translate(${(x1 + x2) / 2}, ${(y1 + y2) / 2})`}>
                  <circle
                    r="8"
                    fill={inPath ? '#2563eb' : '#ffffff'}
                    stroke={inPath ? '#1d4ed8' : '#cbd5e1'}
                    strokeWidth="1.5"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={inPath ? '#ffffff' : '#64748b'}
                    fontSize="8.5"
                    fontWeight="600"
                  >
                    {isBlocked ? '✕' : edge.cost}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Hospital Rooms & Nodes */}
          {nodes.map((node) => {
            const isRobotCurrent = robot.currentLocation === node.id;
            const isGoal = goalNode === node.id || robot.goalLocation === node.id;
            const isTargetSelected = selectedNode === node.id;
            const inRoute = activePath.includes(node.id);
            const styling = getNodeColor(node.category);

            const isHighlighted = isTargetSelected || isGoal;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer group"
                onClick={() => onNodeSelect && onNodeSelect(node.id)}
              >
                {/* Glow ring for selection */}
                {isHighlighted && (
                  <circle
                    r="28"
                    fill="#3b82f6"
                    opacity="0.15"
                    className="animate-pulse"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  r={isRobotCurrent || isHighlighted ? 22 : 18}
                  fill={isRobotCurrent ? '#2563eb' : isHighlighted ? '#10b981' : styling.bg}
                  stroke={isRobotCurrent ? '#1d4ed8' : isHighlighted ? '#059669' : inRoute ? '#3b82f6' : styling.border}
                  strokeWidth={isHighlighted || isRobotCurrent ? 3 : 2}
                  className="transition-all duration-200 group-hover:scale-110 shadow-sm"
                />

                {/* Robot Badge indicator */}
                {isRobotCurrent && (
                  <g transform="translate(0, -32)">
                    <rect
                      x="-32"
                      y="-12"
                      width="64"
                      height="18"
                      rx="9"
                      fill="#1d4ed8"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#ffffff"
                      fontSize="9.5"
                      fontWeight="bold"
                    >
                      🤖 MR-001
                    </text>
                  </g>
                )}

                {/* Target Selected Pin */}
                {isTargetSelected && !isRobotCurrent && (
                  <g transform="translate(0, -30)">
                    <rect
                      x="-34"
                      y="-12"
                      width="68"
                      height="18"
                      rx="9"
                      fill="#059669"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      ✓ Selected
                    </text>
                  </g>
                )}

                {/* Room / Location Initial or Icon */}
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isRobotCurrent || isHighlighted ? '#ffffff' : styling.text}
                  fontSize="10"
                  fontWeight="bold"
                >
                  {node.category === 'pharmacy' ? '🏥' : node.category === 'charging' ? '⚡' : node.category === 'lab' ? '🔬' : node.id.replace('Room ', 'R-').substring(0, 4)}
                </text>

                {/* Room Name label */}
                <text
                  x="0"
                  y={node.y > 380 ? -26 : 28}
                  textAnchor="middle"
                  fill={isTargetSelected ? '#047857' : isRobotCurrent ? '#1d4ed8' : '#334155'}
                  fontSize="11"
                  fontWeight="600"
                  className="bg-white/80"
                >
                  {node.name.replace(/\s*\(.\)/, '')}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Location Banner */}
      {selectedNode && (
        <div className="px-4 py-2.5 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-700">
              Selected Delivery Destination: <strong className="text-emerald-800">{selectedNode}</strong>
            </span>
          </div>
          <span className="text-emerald-700 font-medium">Click room on map to change</span>
        </div>
      )}
    </div>
  );
};
