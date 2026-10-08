import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Bot, UserCheck, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';

export const DoctorLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginDoctor, doctors } = useApp();
  const [doctorIdInput, setDoctorIdInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (idToLogin: string) => {
    setErrorMessage('');
    const success = loginDoctor(idToLogin);
    if (success) {
      navigate('/');
    } else {
      setErrorMessage('Please enter a valid Doctor ID or select from the staff list.');
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorIdInput.trim()) {
      setErrorMessage('Please enter your Doctor ID.');
      return;
    }
    handleLogin(doctorIdInput);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto flex items-center justify-center text-white shadow-xs">
            <Bot className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">MediRoute AI</h1>
          <p className="text-xs text-slate-500 font-medium">Hospital Autonomous Delivery System</p>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <h2 className="text-base font-semibold text-slate-800 text-center">Doctor Login</h2>
          <p className="text-xs text-slate-500 text-center mt-0.5">
            Sign in with your clinical identification badge or ID
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Doctor ID
            </label>
            <input
              type="text"
              placeholder="e.g. DOC-102 or Dr. Kumar"
              value={doctorIdInput}
              onChange={(e) => setDoctorIdInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-xs flex items-center justify-center gap-2"
          >
            <span>Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Staff Selection for Fast Demo */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block text-center">
            Or select registered staff member:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {doctors.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => handleLogin(doc.id)}
                className="p-2 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-lg text-xs transition group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-blue-700 truncate">
                  {doc.name}
                </div>
                <div className="text-[10px] text-slate-500">{doc.id}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Help footer */}
        <div className="text-center pt-2 text-xs text-slate-500">
          <p>Need help?</p>
          <button
            onClick={() => navigate('/help')}
            className="text-blue-600 hover:text-blue-700 font-semibold underline mt-0.5 inline-flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Contact Hospital Administration
          </button>
        </div>
      </div>
    </div>
  );
};
