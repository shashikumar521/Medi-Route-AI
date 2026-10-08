import React from 'react';
import { useApp } from '../../context/AppContext';
import { NodeId, Order } from '../../types';
import {
  MapPin,
  Bot,
  Package,
  CheckCircle2,
  Navigation,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';

interface LiveTrackingMapProps {
  order: Order | null;
  currentPath: NodeId[];
  robotLocation: NodeId;
  destination: NodeId;
  pickupLocation?: NodeId;
  isPreparing?: boolean;
  isPickingUp?: boolean;
  isDelivered?: boolean;
  isReturning?: boolean;
  height?: number | string;
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  order,
  currentPath,
  robotLocation,
  destination,
  pickupLocation = 'Pharmacy',
  isPreparing = false,
  isPickingUp = false,
  isDelivered = false,
  isReturning = false,
  height = 420,
}) => {
  const { nodes, edges } = useApp();

  // Determine completed and remaining segments of current active path
  const currentIndex = currentPath.indexOf(robotLocation);
  const completedNodes =
    currentIndex >= 0 ? currentPath.slice(0, currentIndex + 1) : [];
  const remainingNodes =
    currentIndex >= 0 ? currentPath.slice(currentIndex) : currentPath;

  const isEdgeInPath = (from: NodeId, to: NodeId) => {
    if (currentPath.length < 2) return { inPath: false, isCompleted: false };
    for (let i = 0; i < currentPath.length - 1; i++) {
      const u = currentPath[i];
      const v = currentPath[i + 1];
      if ((u === from && v === to) || (u === to && v === from)) {
        // If both nodes have been traversed, it's completed
        const edgeCompleted = i < currentIndex;
        return { inPath: true, isCompleted: edgeCompleted };
      }
    }
    return { inPath: false, isCompleted: false };
  };

  return (
    <div className="relative flex flex-col w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Map Header / Live Breadcrumb Bar */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-800">
            {isReturning ? 'Live Return Trajectory' : 'Live Delivery Trajectory'}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-medium">
            {isReturning ? `Returning to Base` : `Heading to ${destination}`}
          </span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Completed Route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>Remaining Route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none">🤖</span>
            <span>Robot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none">📦</span>
            <span>Pharmacy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none">📍</span>
            <span>Destination</span>
          </div>
        </div>
      </div>

      {/* Actual Trajectory Node Sequence Breadcrumb */}
      {currentPath.length > 0 && (
        <div className="px-4 py-2.5 bg-blue-50/60 border-b border-blue-100 flex items-center overflow-x-auto text-xs gap-2">
          <span className="text-blue-900 font-bold shrink-0">Path Sequence:</span>
          <div className="flex items-center gap-1.5 text-xs shrink-0">
            {currentPath.map((nodeName, idx) => {
              const isPast = currentPath.indexOf(robotLocation) > idx;
              const isCurrent = robotLocation === nodeName;
              const isDest = destination === nodeName;

              return (
                <React.Fragment key={`${nodeName}-${idx}`}>
                  <span
                    className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-xs scale-105'
                        : isPast
                        ? 'bg-emerald-100 text-emerald-800'
                        : isDest
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {isCurrent ? '🤖 ' : isPast ? '✓ ' : isDest ? '📍 ' : '● '}
                    {nodeName.replace(/\s*\(.\)/, '')}
                  </span>
                  {idx < currentPath.length - 1 && (
                    <span className="text-slate-400 font-bold">➔</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* SVG Canvas */}
      <div
        className="relative w-full overflow-x-auto bg-slate-50/40 flex items-center justify-center p-3"
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

            const { inPath, isCompleted } = isEdgeInPath(edge.from, edge.to);
            const isBlocked = edge.blocked;

            const x1 = fromNode.x;
            const y1 = fromNode.y;
            const x2 = toNode.x;
            const y2 = toNode.y;

            let strokeColor = '#e2e8f0';
            let strokeWidth = 3;

            if (isBlocked) {
              strokeColor = '#fca5a5';
            } else if (inPath) {
              if (isCompleted) {
                strokeColor = '#10b981'; // Green completed
                strokeWidth = 5;
              } else {
                strokeColor = '#2563eb'; // Blue remaining
                strokeWidth = 5;
              }
            }

            return (
              <g key={edge.id}>
                {/* Background shadow line if in path */}
                {inPath && (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isCompleted ? '#a7f3d0' : '#bfdbfe'}
                    strokeWidth={8}
                    strokeLinecap="round"
                  />
                )}

                {/* Main line */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={isBlocked ? '6 4' : !isCompleted && inPath ? '8 4' : 'none'}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />

                {/* Weight badge at midpoint */}
                <g transform={`translate(${(x1 + x2) / 2}, ${(y1 + y2) / 2})`}>
                  <circle
                    r="8.5"
                    fill={isCompleted ? '#10b981' : inPath ? '#2563eb' : '#ffffff'}
                    stroke={isCompleted ? '#059669' : inPath ? '#1d4ed8' : '#cbd5e1'}
                    strokeWidth="1.5"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={inPath ? '#ffffff' : '#64748b'}
                    fontSize="8.5"
                    fontWeight="bold"
                  >
                    {isBlocked ? '✕' : edge.cost}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Hospital Rooms & Nodes */}
          {nodes.map((node) => {
            const isRobotCurrent = robotLocation === node.id;
            const isDestination = destination === node.id;
            const isPickup = pickupLocation === node.id;
            const inRoute = currentPath.includes(node.id);
            const isTraversed = completedNodes.includes(node.id);

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="select-none group"
              >
                {/* Destination pulse halo */}
                {isDestination && (
                  <circle
                    r="32"
                    fill="#10b981"
                    opacity="0.2"
                    className="animate-ping"
                  />
                )}

                {/* Pickup pulse halo if preparing */}
                {isPickup && isPreparing && (
                  <circle
                    r="30"
                    fill="#3b82f6"
                    opacity="0.25"
                    className="animate-pulse"
                  />
                )}

                {/* Outer Ring */}
                <circle
                  r={isRobotCurrent || isDestination || isPickup ? 24 : 18}
                  fill={
                    isRobotCurrent
                      ? '#2563eb'
                      : isDestination
                      ? '#10b981'
                      : isPickup
                      ? '#eff6ff'
                      : isTraversed
                      ? '#ecfdf5'
                      : '#ffffff'
                  }
                  stroke={
                    isRobotCurrent
                      ? '#1d4ed8'
                      : isDestination
                      ? '#059669'
                      : isPickup
                      ? '#3b82f6'
                      : isTraversed
                      ? '#10b981'
                      : inRoute
                      ? '#93c5fd'
                      : '#cbd5e1'
                  }
                  strokeWidth={isRobotCurrent || isDestination || isPickup ? 3 : 2}
                  className="transition-all duration-300 shadow-sm"
                />

                {/* Center Glyph */}
                {isRobotCurrent ? (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="13"
                  >
                    🤖
                  </text>
                ) : isDestination ? (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="13"
                  >
                    📍
                  </text>
                ) : isPickup ? (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="12"
                  >
                    📦
                  </text>
                ) : isTraversed ? (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#059669"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    ✓
                  </text>
                ) : (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#64748b"
                    fontSize="9.5"
                    fontWeight="600"
                  >
                    {node.name.match(/\((.)\)/)?.[1] || node.id.substring(0, 2)}
                  </text>
                )}

                {/* Moving Robot Banner */}
                {isRobotCurrent && (
                  <g transform="translate(0, -36)">
                    <rect
                      x="-36"
                      y="-12"
                      width="72"
                      height="18"
                      rx="9"
                      fill="#1d4ed8"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="shadow-md"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      Robot MR-001
                    </text>
                  </g>
                )}

                {/* Preparing package badge on Pharmacy */}
                {isPickup && isPreparing && (
                  <g transform="translate(0, -36)" className="animate-bounce">
                    <rect
                      x="-44"
                      y="-12"
                      width="88"
                      height="18"
                      rx="9"
                      fill="#3b82f6"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#ffffff"
                      fontSize="8.5"
                      fontWeight="bold"
                    >
                      📦 Packing Order...
                    </text>
                  </g>
                )}

                {/* Destination Badge */}
                {isDestination && !isRobotCurrent && (
                  <g transform="translate(0, -34)">
                    <rect
                      x="-38"
                      y="-12"
                      width="76"
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
                      📍 Destination
                    </text>
                  </g>
                )}

                {/* Room Name label */}
                <text
                  x="0"
                  y={node.y > 380 ? -28 : 32}
                  textAnchor="middle"
                  fill={
                    isRobotCurrent
                      ? '#1d4ed8'
                      : isDestination
                      ? '#047857'
                      : isTraversed
                      ? '#065f46'
                      : inRoute
                      ? '#1e40af'
                      : '#334155'
                  }
                  fontSize="11"
                  fontWeight={isRobotCurrent || isDestination || inRoute ? '700' : '500'}
                >
                  {node.name.replace(/\s*\(.\)/, '')}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
