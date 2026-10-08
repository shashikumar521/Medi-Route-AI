import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Pill,
  BriefcaseMedical,
  FlaskConical,
  FileText,
  Bot,
  Battery,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  PlusCircle,
  Play,
  RotateCcw,
} from 'lucide-react';

export const DoctorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentDoctor, robot, orders, startDemoDelivery, deliveryPhase } = useApp();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const recentDoctorRequests = orders.slice(0, 3);

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* Welcome Greeting Banner */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {getGreeting()}, {currentDoctor.name}
        </h1>
        <p className="text-sm text-slate-500">
          Hospital Autonomous Delivery System is ready for your clinical requests.
        </p>
      </div>

      {/* Primary Action Section: "What do you need?" */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-800">What do you need?</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Request Medicine */}
          <button
            onClick={() => navigate('/new-request?cat=Medication')}
            className="p-5 bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition shadow-xs group flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Pill className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold text-slate-900 group-hover:text-blue-700 flex items-center justify-between">
                <span>Request Medicine</span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Order prescribed tablets, IV fluids, analgesics or injections from the Pharmacy.
              </p>
            </div>
          </button>

          {/* Card 2: Request Medical Item */}
          <button
            onClick={() => navigate('/new-request?cat=Kit')}
            className="p-5 bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition shadow-xs group flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <BriefcaseMedical className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold text-slate-900 group-hover:text-blue-700 flex items-center justify-between">
                <span>Request Medical Item</span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Sterile surgical kits, bandages, syringes, catheter sets, and surgical trays.
              </p>
            </div>
          </button>

          {/* Card 3: Send Sample */}
          <button
            onClick={() => navigate('/new-request?cat=Specimen')}
            className="p-5 bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition shadow-xs group flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold text-slate-900 group-hover:text-blue-700 flex items-center justify-between">
                <span>Send Sample</span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Transport blood vials, biopsies, and specimens securely to the Pathology Lab.
              </p>
            </div>
          </button>

          {/* Card 4: Other Hospital Item */}
          <button
            onClick={() => navigate('/new-request?cat=Document')}
            className="p-5 bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition shadow-xs group flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold text-slate-900 group-hover:text-blue-700 flex items-center justify-between">
                <span>Other Hospital Item</span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Medical reports, encrypted patient envelopes, files, or emergency supplies.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Two Column Section: Simple Robot Status & My Recent Requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Robot Status Section */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">Robot Status</h3>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                robot.status === 'IDLE'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              ● {robot.status === 'IDLE' ? 'Available' : 'Delivering'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Robot ID:</span>
              <strong className="text-slate-900 font-semibold">{robot.id}</strong>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Current Location:</span>
              <strong className="text-slate-900 font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                {robot.currentLocation}
              </strong>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Battery:</span>
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <Battery className="w-4 h-4 text-emerald-600" />
                <span>{robot.battery}%</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => navigate('/robot')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              View Full Robot Details <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* My Recent Requests */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-600" />
              <h3 className="font-bold text-sm text-slate-900">My Recent Requests</h3>
            </div>
            <button
              onClick={() => navigate('/requests')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {recentDoctorRequests.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No recent delivery requests.</p>
            ) : (
              recentDoctorRequests.map((order) => (
                <div
                  key={order.id}
                  onClick={() => navigate('/requests')}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 rounded-lg text-xs flex items-center justify-between cursor-pointer transition"
                >
                  <div>
                    <div className="font-bold text-slate-900">
                      {order.item} × {order.quantity}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Destination: {order.destination}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      order.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'Navigating' || order.status === 'Processing'
                        ? 'bg-blue-100 text-blue-800 animate-pulse'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {order.status === 'Completed' ? '✓ Completed' : order.status}
                  </span>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => navigate('/new-request')}
            className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create New Request</span>
          </button>
        </div>
      </div>
    </div>
  );
};
