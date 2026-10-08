import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useApp } from '../../context/AppContext';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isLoggedIn, deliveryPhase, phaseMessage, robot } = useApp();
  const location = useLocation();

  if (!isLoggedIn && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-800">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-60 h-full shadow-xl bg-white">
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Workspace Column */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Active Delivery Progress Notice (if active and not on tracking screen) */}
        {deliveryPhase !== 'IDLE' && (
          <div className="px-4 py-2 bg-blue-50/90 border-b border-blue-100 text-xs flex items-center justify-between text-blue-900 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              <span className="font-semibold">Robot is on a delivery:</span>
              <span className="text-blue-700">{phaseMessage}</span>
            </div>
            <a
              href="/tracking"
              className="text-blue-700 hover:text-blue-900 font-bold underline"
            >
              View Progress →
            </a>
          </div>
        )}

        {/* Independent Page View Container with clean scrollbar and bounds */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 bg-[#f8fafc]">
          <div className="max-w-5xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
