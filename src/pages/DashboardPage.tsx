import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GraphCanvas } from '../components/map/GraphCanvas';
import {
  Bot,
  Battery,
  MapPin,
  Target,
  RotateCcw,
  Package,
  Activity,
  ArrowRight,
  Play,
  Pause,
  AlertTriangle,
  Zap,
  Sparkles,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    robot,
    deliveryPhase,
    phaseMessage,
    activeOrder,
    orders,
    inventory,
    history,
    logs,
    activeUCSResult,
    aiExplanation,
    startDemoDelivery,
    resetRobotToDock,
    pauseWorkflow,
    resumeWorkflow,
    rechargeRobot,
  } = useApp();

  const completedOrdersCount = orders.filter((o) => o.status === 'Completed').length;
  const inStockItemsCount = inventory.filter((i) => i.available).length;
  const totalStockCount = inventory.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#1f2a44]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#dae2fd]">Fleet Operations Dashboard</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/70 border border-emerald-800 text-emerald-300">
              MR-001 Online
            </span>
          </div>
          <p className="text-xs text-[#869397] font-mono mt-1">
            Real-time telemetry, state-space monitoring & dynamic Uniform Cost Search dispatch.
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={startDemoDelivery}
            disabled={deliveryPhase !== 'IDLE' && robot.status !== 'IDLE'}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-[#1f2a44] disabled:text-[#869397] text-white rounded text-xs font-mono font-bold transition shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Launch Demo (MED-1042)
          </button>
          <button
            onClick={() => navigate('/planner')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171f33] hover:bg-[#1f2a44] border border-[#2d3d63] text-[#dae2fd] rounded text-xs font-mono transition"
          >
            <Cpu className="w-3.5 h-3.5 text-[#627a8d]" />
            AI Planner
          </button>
          <button
            onClick={rechargeRobot}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171f33] hover:bg-[#1f2a44] border border-[#2d3d63] text-[#bcc9cd] hover:text-[#dae2fd] rounded text-xs font-mono transition"
          >
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            Recharge Bay
          </button>
        </div>
      </div>

      {/* Top 4 Key Statistics Cards - Clicking navigates to dedicated page */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Robot Status */}
        <div
          onClick={() => navigate('/robot')}
          className="p-4 bg-[#131b2e] border border-[#1f2a44] hover:border-[#627a8d] rounded-lg cursor-pointer transition group shadow-md"
        >
          <div className="flex items-center justify-between text-[#869397] text-xs font-mono">
            <span>ROBOT TELEMETRY</span>
            <Bot className="w-4 h-4 text-[#627a8d] group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-[#dae2fd]">{robot.id}</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                robot.status === 'IDLE'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950/80 text-amber-300 border border-amber-800 animate-pulse'
              }`}
            >
              {robot.status}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#bcc9cd] font-mono">
            <span>Location: <strong className="text-[#dae2fd]">{robot.currentLocation}</strong></span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Zap className="w-3 h-3" /> {robot.battery}%
            </span>
          </div>
        </div>

        {/* Card 2: Active Delivery Order */}
        <div
          onClick={() => navigate('/orders')}
          className="p-4 bg-[#131b2e] border border-[#1f2a44] hover:border-[#627a8d] rounded-lg cursor-pointer transition group shadow-md"
        >
          <div className="flex items-center justify-between text-[#869397] text-xs font-mono">
            <span>ACTIVE MISSION</span>
            <Package className="w-4 h-4 text-[#627a8d] group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-bold font-mono text-[#dae2fd]">
              {activeOrder ? activeOrder.id : 'No Mission'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#171f33] border border-[#2d3d63] text-[#bfc8ca]">
              {activeOrder?.status || 'STANDBY'}
            </span>
          </div>
          <p className="mt-3 text-xs text-[#bcc9cd] truncate">
            {activeOrder ? `${activeOrder.item} → ${activeOrder.destination}` : 'Ready for dispatch'}
          </p>
        </div>

        {/* Card 3: Dispensary Inventory */}
        <div
          onClick={() => navigate('/inventory')}
          className="p-4 bg-[#131b2e] border border-[#1f2a44] hover:border-[#627a8d] rounded-lg cursor-pointer transition group shadow-md"
        >
          <div className="flex items-center justify-between text-[#869397] text-xs font-mono">
            <span>INVENTORY CATALOG</span>
            <Activity className="w-4 h-4 text-[#627a8d] group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-[#dae2fd]">{totalStockCount} Units</span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">{inStockItemsCount} In Stock</span>
          </div>
          <p className="mt-3 text-xs text-[#bcc9cd] flex items-center justify-between">
            <span>{inventory.length} Verified SKUs</span>
            <span className="text-[#627a8d] group-hover:text-[#dae2fd] flex items-center text-[11px]">
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </span>
          </p>
        </div>

        {/* Card 4: Historical Missions Completed */}
        <div
          onClick={() => navigate('/history')}
          className="p-4 bg-[#131b2e] border border-[#1f2a44] hover:border-[#627a8d] rounded-lg cursor-pointer transition group shadow-md"
        >
          <div className="flex items-center justify-between text-[#869397] text-xs font-mono">
            <span>TOTAL HANDOFFS</span>
            <CheckCircle2 className="w-4 h-4 text-[#627a8d] group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-[#dae2fd]">{history.length}</span>
            <span className="text-xs font-mono text-emerald-400">100% Return Rate</span>
          </div>
          <p className="mt-3 text-xs text-[#bcc9cd] flex items-center justify-between">
            <span>Exact return verification</span>
            <span className="text-[#627a8d] group-hover:text-[#dae2fd] flex items-center text-[11px]">
              Audit <ArrowRight className="w-3 h-3 ml-1" />
            </span>
          </p>
        </div>
      </div>

      {/* Main Grid: Spatial Map Preview (Left 7 cols) & AI State-Space Diagnostics (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Hospital Map Preview */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#627a8d]" />
              <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-[#dae2fd]">
                Hospital Spatial Graph
              </h2>
            </div>
            <button
              onClick={() => navigate('/map')}
              className="text-xs font-mono text-[#627a8d] hover:text-[#dae2fd] flex items-center gap-1 transition"
            >
              Open Interactive Map <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="rounded-lg overflow-hidden border border-[#1f2a44] bg-[#0b1326]">
            <GraphCanvas
              height={360}
              highlightPath={activeUCSResult?.path || []}
              visitedNodes={activeUCSResult?.visitedNodes || []}
              showControls={false}
            />
          </div>
          <div className="p-3 bg-[#131b2e] border border-[#1f2a44] rounded text-xs font-mono text-[#bcc9cd] flex flex-wrap items-center justify-between gap-2">
            <span>
              Optimal Path: <strong className="text-[#c084fc]">{activeUCSResult ? activeUCSResult.path.join(' → ') : 'Awaiting computation'}</strong>
            </span>
            <span>
              Cumulative Cost g(n): <strong className="text-[#dae2fd]">{activeUCSResult?.cost ?? 0}</strong>
            </span>
          </div>
        </div>

        {/* Right Column: State Space & Real-time Reasoning */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* State-Space Telemetry Card */}
          <div className="p-4 bg-[#131b2e] border border-[#1f2a44] rounded-lg space-y-3">
            <div className="flex items-center justify-between border-b border-[#1f2a44] pb-2.5">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#627a8d]" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#dae2fd]">
                  State-Space Planning Vector
                </h3>
              </div>
              <button
                onClick={() => navigate('/planner')}
                className="text-[11px] font-mono text-[#627a8d] hover:text-[#dae2fd] flex items-center"
              >
                Inspect STRIPS <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#0b1326] border border-[#1f2a44] rounded">
                <span className="text-[#869397] block text-[10px] uppercase">Original State</span>
                <span className="text-[#dae2fd] font-bold mt-1 block truncate">
                  RobotAt = {robot.originalLocation}
                </span>
                <span className="text-[10px] text-[#627a8d] block mt-0.5">Saved for return UCS</span>
              </div>

              <div className="p-2.5 bg-[#0b1326] border border-[#1f2a44] rounded">
                <span className="text-[#869397] block text-[10px] uppercase">Current State</span>
                <span className="text-[#60a5fa] font-bold mt-1 block truncate">
                  RobotAt = {robot.currentLocation}
                </span>
                <span className="text-[10px] text-[#869397] block mt-0.5">
                  HasItem = {robot.hasItem ? 'true' : 'false'}
                </span>
              </div>

              <div className="p-2.5 bg-[#0b1326] border border-[#1f2a44] rounded">
                <span className="text-[#869397] block text-[10px] uppercase">Goal State</span>
                <span className="text-[#10b981] font-bold mt-1 block truncate">
                  {robot.goalLocation ? `RobotAt = ${robot.goalLocation}` : 'No Active Goal'}
                </span>
                <span className="text-[10px] text-[#869397] block mt-0.5">
                  Delivered = {robot.delivered ? 'true' : 'false'}
                </span>
              </div>

              <div className="p-2.5 bg-[#0b1326] border border-[#1f2a44] rounded">
                <span className="text-[#869397] block text-[10px] uppercase">Battery Reserve</span>
                <div className="flex items-center justify-between mt-1">
                  <span className={`font-bold ${robot.battery < 25 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {robot.battery}%
                  </span>
                  <span className="text-[10px] text-[#869397]">Limit: 20%</span>
                </div>
                <div className="w-full bg-[#171f33] h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all ${robot.battery < 25 ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${robot.battery}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Decision & Reasoning Card */}
          <div className="p-4 bg-[#131b2e] border border-[#1f2a44] rounded-lg space-y-2.5 flex-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#dae2fd]">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Decision & Explanation</span>
            </div>
            <div className="p-3 bg-[#0b1326] border border-[#1f2a44] rounded text-xs text-[#bcc9cd] font-mono leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
              {aiExplanation}
            </div>
          </div>

          {/* Recent Live Activity Stream */}
          <div className="p-4 bg-[#131b2e] border border-[#1f2a44] rounded-lg space-y-2">
            <div className="flex items-center justify-between border-b border-[#1f2a44] pb-2">
              <span className="text-xs font-mono font-bold uppercase text-[#dae2fd]">Recent Activity Feed</span>
              <button
                onClick={() => navigate('/logs')}
                className="text-[11px] font-mono text-[#627a8d] hover:text-[#dae2fd]"
              >
                All Logs ({logs.length})
              </button>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto text-[11px] font-mono">
              {logs.slice(0, 4).map((l) => (
                <div key={l.id} className="flex items-start gap-2 py-0.5 text-[#bcc9cd]">
                  <span className="text-[#869397] shrink-0">[{l.timestamp}]</span>
                  <span
                    className={`font-semibold shrink-0 ${
                      l.category === 'UCS'
                        ? 'text-purple-400'
                        : l.category === 'STRIPS'
                        ? 'text-amber-400'
                        : l.category === 'ORDER'
                        ? 'text-sky-400'
                        : 'text-[#bfc8ca]'
                    }`}
                  >
                    {l.category}:
                  </span>
                  <span className="truncate">{l.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
