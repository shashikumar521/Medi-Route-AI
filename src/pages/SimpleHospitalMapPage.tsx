import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GraphCanvas } from '../components/map/GraphCanvas';
import { NodeId } from '../types';
import { Map, MapPin, ArrowRight, PlusCircle, CheckCircle2 } from 'lucide-react';

export const SimpleHospitalMapPage: React.FC = () => {
  const navigate = useNavigate();
  const { nodes, robot } = useApp();
  const [selectedNodeId, setSelectedNodeId] = useState<NodeId>('Room F-102');

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hospital Map & Rooms</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Click on any room or ward to view its details or start a delivery.
          </p>
        </div>

        {selectedNodeId && selectedNodeId !== 'Charging Station' && (
          <button
            onClick={() => navigate('/new-request')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Request Delivery Here</span>
          </button>
        )}
      </div>

      {/* Map Canvas */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
        <GraphCanvas
          height={420}
          selectedNode={selectedNodeId}
          onNodeSelect={(id) => setSelectedNodeId(id)}
        />
      </div>

      {/* Selected Room Details Card */}
      {selectedNode && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">{selectedNode.name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-blue-50 text-blue-700">
                {selectedNode.category}
              </span>
            </div>
            <p className="text-xs text-slate-600">{selectedNode.description}</p>
          </div>

          {selectedNode.id !== 'Charging Station' && (
            <button
              onClick={() => navigate('/new-request')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-2 shadow-xs transition"
            >
              <span>Deliver to {selectedNode.id}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Hospital Wings Directory */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Hospital Room Directory
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
          {nodes.map((node) => (
            <button
              key={node.id}
              onClick={() => setSelectedNodeId(node.id)}
              className={`p-2.5 rounded-lg border text-left transition ${
                selectedNodeId === node.id
                  ? 'bg-blue-50 border-blue-400 font-bold text-blue-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="truncate">{node.name.replace(/\s*\(.\)/, '')}</div>
              <div className="text-[10px] text-slate-400 capitalize">{node.category}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
