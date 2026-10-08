import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  PlusCircle,
  Clock,
  Bot,
  Map,
  HelpCircle,
  Battery,
  Zap,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { robot, deliveryPhase } = useApp();

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/new-request', label: 'New Request', icon: PlusCircle, highlight: true },
    { to: '/requests', label: 'My Requests', icon: Clock },
    { to: '/robot', label: 'Robot Status', icon: Bot },
    { to: '/map', label: 'Hospital Map', icon: Map },
    { to: '/help', label: 'Help & Admin', icon: HelpCircle },
  ];

  return (
    <aside className="w-60 h-full bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none">
      {/* Navigation Links */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
          Hospital Delivery
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                    : item.highlight
                    ? 'text-blue-600 hover:bg-blue-50/60 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Robot Mini Status Card at Bottom */}
      <div className="p-3 border-t border-slate-100">
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  robot.status === 'IDLE' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                }`}
              />
              Robot MR-001
            </span>
            <span className="text-[11px] font-semibold text-slate-600">
              {robot.battery}%
            </span>
          </div>

          <div className="text-[11px] text-slate-500">
            <div>
              Status:{' '}
              <strong className="text-slate-800 font-medium">
                {robot.status === 'IDLE' ? 'Available' : 'Delivering'}
              </strong>
            </div>
            <div className="truncate">
              Location:{' '}
              <strong className="text-slate-800 font-medium">
                {robot.currentLocation}
              </strong>
            </div>
          </div>
        </div>

        {/* Discreet link to technical algorithms for grading / system check */}
        <div className="mt-2 text-center">
          <NavLink
            to="/admin"
            onClick={onCloseMobile}
            className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 transition"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>System Details & AI Architecture</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
};
