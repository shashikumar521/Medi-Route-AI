import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActivityLog } from '../types';
import {
  Terminal,
  Trash2,
  Filter,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Copy,
} from 'lucide-react';

export const LogsPage: React.FC = () => {
  const { logs, clearLogs, addLog } = useApp();
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const categories = ['ALL', 'ORDER', 'UCS', 'STRIPS', 'ROBOT', 'INVENTORY', 'SYSTEM', 'SECURITY'];

  const filteredLogs = logs.filter((log) => {
    const matchesCategory = filterCategory === 'ALL' || log.category === filterCategory;
    const matchesSeverity = filterSeverity === 'ALL' || log.severity === filterSeverity;
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.timestamp.includes(searchQuery) ||
      log.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSeverity && matchesSearch;
  });

  const getSeverityIcon = (sev: ActivityLog['severity']) => {
    switch (sev) {
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'error':
        return <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />;
      default:
        return <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
    }
  };

  const getCategoryColor = (cat: ActivityLog['category']) => {
    switch (cat) {
      case 'UCS':
        return 'text-purple-400';
      case 'STRIPS':
        return 'text-amber-400';
      case 'ORDER':
        return 'text-sky-400';
      case 'ROBOT':
        return 'text-emerald-400';
      case 'INVENTORY':
        return 'text-indigo-400';
      default:
        return 'text-[#bfc8ca]';
    }
  };

  const exportLogsAsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mediroute-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#1f2a44]">
        <div>
          <div className="flex items-center gap-2.5">
            <Terminal className="w-6 h-6 text-[#627a8d]" />
            <h1 className="text-2xl font-bold tracking-tight text-[#dae2fd]">
              Operational Activity Logs
            </h1>
          </div>
          <p className="text-xs text-[#869397] font-mono mt-1">
            Real-time event stream logging state-space transitions, UCS expansions, corridor weights, and robotics hardware telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={exportLogsAsJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171f33] hover:bg-[#1f2a44] border border-[#2d3d63] text-[#dae2fd] rounded transition"
          >
            <Download className="w-3.5 h-3.5 text-[#627a8d]" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={clearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171f33] hover:bg-[#1f2a44] border border-[#2d3d63] text-red-300 rounded transition"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-[#131b2e] border border-[#1f2a44] rounded-lg space-y-3 font-mono text-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#869397] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter logs by keyword or timestamp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0b1326] border border-[#1f2a44] rounded text-xs text-[#dae2fd] placeholder-[#869397] focus:outline-none focus:border-[#627a8d]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#869397]">Severity:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 bg-[#0b1326] border border-[#1f2a44] rounded text-xs text-[#dae2fd] focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1f2a44]">
          <span className="text-[#869397] flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded transition ${
                filterCategory === cat
                  ? 'bg-[#171f33] text-[#dae2fd] border border-[#627a8d] font-bold'
                  : 'bg-[#0b1326] text-[#869397] hover:text-[#dae2fd] border border-[#1f2a44]'
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="ml-auto text-[#869397]">
            Showing {filteredLogs.length} of {logs.length} entries
          </span>
        </div>
      </div>

      {/* Logs Terminal Stream (Scrolls and Ends Cleanly) */}
      <div className="bg-[#0b1326] border border-[#1f2a44] rounded-lg p-3 font-mono text-xs space-y-1.5 shadow-2xl">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-[#869397]">
            No activity log entries found matching criteria.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-2 rounded hover:bg-[#131b2e]/60 transition flex items-start gap-3 border-b border-[#1f2a44]/40 last:border-b-0"
            >
              {/* Severity icon */}
              <div className="mt-0.5">{getSeverityIcon(log.severity)}</div>

              {/* Timestamp */}
              <span className="text-[#869397] shrink-0 text-[11px]">[{log.timestamp}]</span>

              {/* Category */}
              <span className={`font-bold shrink-0 text-[11px] uppercase ${getCategoryColor(log.category)}`}>
                [{log.category}]
              </span>

              {/* Message */}
              <span className="text-[#dae2fd] break-words flex-1 leading-relaxed">
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
