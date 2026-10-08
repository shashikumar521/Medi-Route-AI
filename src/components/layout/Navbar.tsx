import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Bot,
  Battery,
  User,
  LogOut,
  Play,
  RotateCcw,
  Menu,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const navigate = useNavigate();
  const { currentDoctor, logoutDoctor, robot, deliveryPhase, startDemoDelivery, resetRobotToDock } = useApp();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0 select-none shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Hospital Brand */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-slate-900 tracking-tight">MediRoute</span>
              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Hospital Delivery System</p>
          </div>
        </div>
      </div>

      {/* Center & Right Telemetry and Profile */}
      <div className="flex items-center gap-3">
        {/* Simple Robot Status Badge */}
        <div
          onClick={() => navigate('/robot')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs cursor-pointer transition"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              robot.status === 'IDLE'
                ? 'bg-emerald-500'
                : 'bg-amber-500 animate-pulse'
            }`}
          />
          <span className="text-slate-600 font-medium">Robot MR-001:</span>
          <span className="font-semibold text-slate-900">
            {robot.status === 'IDLE' ? 'Available' : 'Delivering'}
          </span>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1 text-slate-700">
            <Battery className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold">{robot.battery}%</span>
          </div>
        </div>

        {/* Try Demo Option (clearly separated) */}
        <button
          onClick={startDemoDelivery}
          disabled={deliveryPhase !== 'IDLE' && robot.status !== 'IDLE'}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg text-xs font-semibold transition"
          title="Try automated demo delivery"
        >
          <Play className="w-3.5 h-3.5 text-blue-600 fill-current" />
          <span>Try Demo</span>
        </button>

        {/* Doctor Identity & Logout */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-800 text-xs font-bold">
            {currentDoctor.name.replace('Dr. ', '').charAt(0)}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-900">{currentDoctor.name}</div>
            <div className="text-[10px] text-slate-500 font-medium">{currentDoctor.id}</div>
          </div>
          <button
            onClick={() => {
              logoutDoctor();
              navigate('/login');
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            title="Switch Doctor / Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
