import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { GraphCanvas } from '../components/map/GraphCanvas';
import { runUCS, generateUCSExplanation } from '../utils/ucs';
import { UCSResult, NodeId } from '../types';
import {
  Cpu,
  Play,
  RotateCcw,
  StepForward,
  Pause,
  Sparkles,
  Layers,
  ArrowRight,
  ListOrdered,
  CheckCircle2,
  Radio,
  Clock,
  Compass,
} from 'lucide-react';

export const PlannerPage: React.FC = () => {
  const {
    nodes,
    edges,
    robot,
    stripsState,
    stripsActions,
    originalSavedLocation,
    activeOrder,
    plannerStart,
    setPlannerStart,
    plannerGoal,
    setPlannerGoal,
    testUCSResult,
    runTestUCS,
    stepByStepTestIndex,
    stepTestUCS,
    resetTestUCS,
    aiExplanation,
  } = useApp();

  const [autoStepTimer, setAutoStepTimer] = useState<boolean>(false);

  // Run initial test on mount if null
  useEffect(() => {
    if (!testUCSResult) {
      runTestUCS();
    }
  }, []);

  // Step-by-step automatic animation timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (autoStepTimer && testUCSResult) {
      interval = setInterval(() => {
        if (stepByStepTestIndex < testUCSResult.steps.length) {
          stepTestUCS();
        } else {
          setAutoStepTimer(false);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoStepTimer, stepByStepTestIndex, testUCSResult, stepTestUCS]);

  // Current Step details from UCS execution trace
  const currentStep =
    testUCSResult && testUCSResult.steps.length > 0 && stepByStepTestIndex > 0
      ? testUCSResult.steps[Math.min(stepByStepTestIndex - 1, testUCSResult.steps.length - 1)]
      : null;

  // Render visited nodes up to current step
  const activeVisitedNodes = currentStep
    ? currentStep.visitedSnapshot
    : testUCSResult?.visitedNodes || [];

  // Active path to highlight on canvas
  const isFinished =
    testUCSResult &&
    (stepByStepTestIndex >= testUCSResult.steps.length || stepByStepTestIndex === 0);
  const activePathOnCanvas = isFinished && testUCSResult?.success ? testUCSResult.path : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#1f2a44]">
        <div>
          <div className="flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-[#627a8d]" />
            <h1 className="text-2xl font-bold tracking-tight text-[#dae2fd]">
              AI Planner & State-Space Engine
            </h1>
          </div>
          <p className="text-xs text-[#869397] font-mono mt-1">
            Uniform Cost Search priority queue visualizer and STRIPS action pre/post-condition verification.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={() => {
              setAutoStepTimer(false);
              runTestUCS();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold transition shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Full UCS</span>
          </button>

          <button
            onClick={() => {
              if (stepByStepTestIndex >= (testUCSResult?.steps.length || 0)) {
                runTestUCS();
              }
              stepTestUCS();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171f33] hover:bg-[#1f2a44] border border-[#2d3d63] text-[#dae2fd] rounded transition"
          >
            <StepForward className="w-3.5 h-3.5 text-[#627a8d]" />
            <span>Step-by-Step</span>
          </button>

          <button
            onClick={() => setAutoStepTimer(!autoStepTimer)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171f33] hover:bg-[#1f2a44] border border-[#2d3d63] text-[#bcc9cd] hover:text-[#dae2fd] rounded transition"
          >
            {autoStepTimer ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Animate</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setAutoStepTimer(false);
              resetTestUCS();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171f33] hover:bg-[#1f2a44] border border-[#2d3d63] text-[#869397] hover:text-[#dae2fd] rounded transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* State-Space Planning Triad (Current State, Goal State, Original State) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current State */}
        <div className="p-4 bg-[#131b2e] border border-[#1f2a44] rounded-lg space-y-2">
          <div className="flex items-center justify-between border-b border-[#1f2a44] pb-2">
            <span className="text-xs font-mono font-bold uppercase text-[#60a5fa]">
              1. Current State
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          </div>
          <div className="space-y-1 text-xs font-mono text-[#bcc9cd]">
            <div>RobotAt = <strong className="text-[#dae2fd]">{robot.currentLocation}</strong></div>
            <div>RobotHasItem = <strong className="text-[#dae2fd]">{robot.hasItem ? 'true' : 'false'}</strong></div>
            <div>ItemAvailable = <strong className="text-[#dae2fd]">{stripsState.itemAvailable ? 'true' : 'false'}</strong></div>
            <div>ItemDelivered = <strong className="text-[#dae2fd]">{robot.delivered ? 'true' : 'false'}</strong></div>
          </div>
        </div>

        {/* Goal State */}
        <div className="p-4 bg-[#131b2e] border border-[#1f2a44] rounded-lg space-y-2">
          <div className="flex items-center justify-between border-b border-[#1f2a44] pb-2">
            <span className="text-xs font-mono font-bold uppercase text-[#10b981]">
              2. Goal State
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="space-y-1 text-xs font-mono text-[#bcc9cd]">
            <div>RobotAt = <strong className="text-[#dae2fd]">{robot.goalLocation || plannerGoal}</strong></div>
            <div>ItemDelivered = <strong className="text-[#dae2fd]">true</strong></div>
            <div className="text-[11px] text-[#869397] pt-1">
              Mission targets verified payload handoff at patient room.
            </div>
          </div>
        </div>

        {/* Original State */}
        <div className="p-4 bg-[#131b2e] border border-[#1f2a44] rounded-lg space-y-2">
          <div className="flex items-center justify-between border-b border-[#1f2a44] pb-2">
            <span className="text-xs font-mono font-bold uppercase text-purple-400">
              3. Original State (Saved)
            </span>
            <span className="text-[10px] font-mono text-[#869397]">Saved Base</span>
          </div>
          <div className="space-y-1 text-xs font-mono text-[#bcc9cd]">
            <div>RobotAt = <strong className="text-[#dae2fd]">{originalSavedLocation}</strong></div>
            <div className="text-[11px] text-[#869397] pt-1">
              Strictly preserved prior to dispatch. Robot recalculates return UCS to this exact node.
            </div>
          </div>
        </div>
      </div>

      {/* STRIPS-Style Actions Table / Cards */}
      <div className="p-4 bg-[#131b2e] border border-[#1f2a44] rounded-lg space-y-3">
        <div className="flex items-center justify-between border-b border-[#1f2a44] pb-2.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#dae2fd]">
            <Layers className="w-4 h-4 text-[#627a8d]" />
            <span>STRIPS-Style Action Rules & State Transitions</span>
          </div>
          <span className="text-xs font-mono text-[#869397]">
            Classical Deterministic Planning
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          {stripsActions.map((action) => (
            <div
              key={action.name}
              className={`p-3 rounded border transition ${
                action.isExecutable
                  ? 'bg-[#171f33] border-emerald-800/80 shadow-md'
                  : 'bg-[#0b1326] border-[#1f2a44] opacity-80'
              }`}
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-[#1f2a44]">
                <span className="font-bold text-[#dae2fd] text-[13px]">{action.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9.5px] uppercase font-bold ${
                    action.isExecutable
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  {action.isExecutable ? 'Executable' : 'Disabled'}
                </span>
              </div>

              <div className="mt-2 space-y-2 text-[11px]">
                <div>
                  <span className="text-[#869397] block font-semibold">Preconditions:</span>
                  <div className="text-[#bcc9cd] pl-2 border-l border-[#1f2a44]">
                    {Object.entries(action.preconditions).map(([k, v]) => (
                      <div key={k}>{k} = {String(v)}</div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-emerald-400 block font-semibold">+ Add Effects:</span>
                  <div className="text-emerald-300 pl-2 border-l border-emerald-900/60">
                    {Object.entries(action.addEffects).map(([k, v]) => (
                      <div key={k}>{k} = {String(v)}</div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-red-400 block font-semibold">- Delete Effects:</span>
                  <div className="text-red-300 pl-2 border-l border-red-900/60">
                    {Object.entries(action.deleteEffects).map(([k, v]) => (
                      <div key={k}>{k} = {String(v)}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main UCS Telemetry & Priority Queue Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Map Canvas & Path readout */}
        <div className="lg:col-span-7 space-y-3">
          <div className="p-3 bg-[#131b2e] border border-[#1f2a44] rounded flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#869397]">Start:</span>
              <select
                value={plannerStart}
                onChange={(e) => setPlannerStart(e.target.value)}
                className="px-2 py-1 bg-[#0b1326] border border-[#1f2a44] rounded text-[#dae2fd]"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
              <span className="text-[#627a8d]">→</span>
              <span className="text-[#869397]">Goal:</span>
              <select
                value={plannerGoal}
                onChange={(e) => setPlannerGoal(e.target.value)}
                className="px-2 py-1 bg-[#0b1326] border border-[#1f2a44] rounded text-[#dae2fd]"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#869397]">Step:</span>
              <strong className="text-[#dae2fd]">
                {stepByStepTestIndex} / {testUCSResult?.steps.length || 0}
              </strong>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden border border-[#1f2a44]">
            <GraphCanvas
              height={420}
              highlightPath={activePathOnCanvas}
              visitedNodes={activeVisitedNodes}
              startNode={plannerStart}
              goalNode={plannerGoal}
              showControls={false}
            />
          </div>

          {/* Path & Cost Summary Card */}
          <div className="p-4 bg-[#131b2e] border border-[#1f2a44] rounded-lg text-xs font-mono space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#869397]">SELECTED OPTIMAL UCS PATH:</span>
              <span className="text-emerald-400 font-bold">
                {testUCSResult?.success ? 'Optimal Solution Verified' : 'Searching / Incomplete'}
              </span>
            </div>
            <div className="text-base font-bold text-[#c084fc]">
              {testUCSResult?.success ? testUCSResult.path.join(' → ') : 'None'}
            </div>
            <div className="flex items-center justify-between text-[#bcc9cd] pt-1 border-t border-[#1f2a44]">
              <span>Cumulative Path Cost: <strong className="text-[#dae2fd] text-sm">{testUCSResult?.cost ?? 'N/A'}</strong></span>
              <span>Total Nodes Expanded: <strong className="text-[#dae2fd]">{testUCSResult?.visitedNodes.length ?? 0}</strong></span>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Live Priority Queue & Step Trace */}
        <div className="lg:col-span-5 space-y-4">
          {/* Priority Queue Min-Heap Visualizer */}
          <div className="p-4 bg-[#131b2e] border border-[#1f2a44] rounded-lg space-y-3">
            <div className="flex items-center justify-between border-b border-[#1f2a44] pb-2.5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#dae2fd]">
                <ListOrdered className="w-4 h-4 text-[#627a8d]" />
                <span>Priority Queue (Min-Heap)</span>
              </div>
              <span className="text-[11px] font-mono text-[#869397]">
                Ordered by g(n) cost
              </span>
            </div>

            {currentStep && currentStep.queueSnapshot.length > 0 ? (
              <div className="space-y-1.5 max-h-56 overflow-y-auto font-mono text-xs">
                {currentStep.queueSnapshot.map((item, idx) => (
                  <div
                    key={`${item.node}-${idx}`}
                    className="p-2 bg-[#0b1326] border border-[#1f2a44] rounded flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-[#171f33] text-[#869397] flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-[#dae2fd] font-bold">{item.node}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#c084fc]">
                        g(n) = {item.cost}
                      </span>
                      <span className="text-[10px] text-[#869397] block truncate max-w-[140px]">
                        Path: {item.path.join('→')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-[#869397] font-mono text-xs bg-[#0b1326] rounded border border-[#1f2a44]">
                Queue empty or goal reached.
              </div>
            )}
          </div>

          {/* Current Expansion Step Telemetry */}
          <div className="p-4 bg-[#131b2e] border border-[#1f2a44] rounded-lg space-y-2 text-xs font-mono">
            <div className="text-[#869397] uppercase text-[10px] font-bold">Active Expansion Step</div>
            <div className="p-3 bg-[#0b1326] border border-[#1f2a44] rounded space-y-1.5">
              <div>
                Current Node: <strong className="text-[#60a5fa]">{currentStep?.currentNode || 'None'}</strong>
              </div>
              <div>
                Cumulative Cost: <strong className="text-[#c084fc]">{currentStep?.cumulativeCost ?? 0}</strong>
              </div>
              <div className="text-[11px] text-[#869397]">
                {currentStep?.actionDescription || 'Ready for search initiation.'}
              </div>
            </div>
          </div>

          {/* AI Natural Explanation Box */}
          <div className="p-4 bg-[#131b2e] border border-[#1f2a44] rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#dae2fd]">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Decision & Explanation</span>
            </div>
            <div className="p-3 bg-[#0b1326] border border-[#1f2a44] rounded text-xs text-[#bcc9cd] font-mono leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
              {aiExplanation}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
