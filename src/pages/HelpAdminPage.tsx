import React from 'react';
import { HelpCircle, Phone, AlertCircle, Info, ShieldCheck, Mail } from 'lucide-react';

export const HelpAdminPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-2xl mx-auto py-2">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Hospital Administration & Support</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Emergency contacts, pharmacy dispatch, and delivery assistance for doctors.
        </p>
      </div>

      {/* Emergency & Key Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Central Pharmacy Dispensary</h2>
            <p className="text-xs text-slate-500 mt-0.5">For urgent compounding & prescription approvals</p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs font-semibold text-slate-700">
            Internal Extension: <strong className="text-blue-600">402</strong> (24/7)
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Autonomous Fleet Operations</h2>
            <p className="text-xs text-slate-500 mt-0.5">Robot MR-001 supervisor & technical support</p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs font-semibold text-slate-700">
            Internal Extension: <strong className="text-emerald-600">119</strong> (Fleet Desk)
          </div>
        </div>
      </div>

      {/* Frequently Encountered Scenarios */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Delivery Guidelines & FAQ</h2>

        <div className="space-y-3 text-xs divide-y divide-slate-100">
          <div className="pt-2 space-y-1">
            <span className="font-bold text-slate-800">What if an item is out of stock?</span>
            <p className="text-slate-500 leading-relaxed">
              The system automatically validates inventory in real time. If an item is out of stock, please contact Pharmacy (ext. 402) for alternative pharmaceutical stock.
            </p>
          </div>

          <div className="pt-3 space-y-1">
            <span className="font-bold text-slate-800">What if a hospital corridor is blocked for maintenance?</span>
            <p className="text-slate-500 leading-relaxed">
              Robot MR-001 automatically evaluates the hospital map and re-routes along the lowest-cost clear corridor. You do not need to manually change routes.
            </p>
          </div>

          <div className="pt-3 space-y-1">
            <span className="font-bold text-slate-800">How does the robot return?</span>
            <p className="text-slate-500 leading-relaxed">
              Once delivery is confirmed at the patient room, the robot autonomously recalculates its path back to its docking bay in the Main Corridor. It does not stay in the patient room.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
