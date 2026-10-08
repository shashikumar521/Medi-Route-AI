import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GraphCanvas } from '../components/map/GraphCanvas';
import { NodeId, InventoryItem } from '../types';
import {
  Search,
  Check,
  AlertCircle,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Pill,
  BriefcaseMedical,
  FlaskConical,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const NewRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    inventory,
    nodes,
    currentDoctor,
    submitDoctorRequest,
    checkItemAvailability,
    deliveryPhase,
    activeOrder,
  } = useApp();

  // Wizard Step: 1 = Select Item, 2 = Select Quantity & Availability, 3 = Select Map Location, 4 = Confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Selected State
  const initialCategory = searchParams.get('cat') || 'ALL';
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedLocation, setSelectedLocation] = useState<NodeId>('Room F-102');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Pre-select item if category provided
  useEffect(() => {
    if (initialCategory !== 'ALL' && !selectedItem) {
      const match = inventory.find((i) => i.category === initialCategory);
      if (match) setSelectedItem(match);
    }
  }, [initialCategory, inventory]);

  // Inventory availability for selected item & quantity
  const stockCheck = selectedItem
    ? checkItemAvailability(selectedItem.name, quantity)
    : { available: false, message: 'Please select an item' };

  // Filter items
  const filteredItems = inventory.filter((item) => {
    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setQuantity(1);
    setCurrentStep(2);
  };

  const handleConfirmAndDispatch = () => {
    if (!selectedItem || !selectedLocation) return;
    setSubmitting(true);
    setSubmissionError(null);

    const res = submitDoctorRequest(
      selectedItem.name,
      quantity,
      selectedLocation,
      notes || `Prescribed by ${currentDoctor.name}`
    );

    setSubmitting(false);

    if (res.success) {
      // Navigate to tracking progress screen
      navigate('/tracking');
    } else {
      setSubmissionError(res.message);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      {/* Top Header & Breadcrumb Step Indicator */}
      <div className="space-y-3 pb-2 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              New Delivery Request
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Request hospital medicines, surgical items or transport patient specimens.
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            Cancel & Exit
          </button>
        </div>

        {/* 4-Step Progress Indicator */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div
            className={`flex items-center gap-1.5 ${
              currentStep === 1
                ? 'text-blue-600 font-bold'
                : currentStep > 1
                ? 'text-emerald-600 font-medium'
                : 'text-slate-400'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                currentStep === 1
                  ? 'bg-blue-600 text-white'
                  : currentStep > 1
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {currentStep > 1 ? '✓' : '1'}
            </span>
            <span>Select Item</span>
          </div>

          <span className="text-slate-300">───</span>

          <div
            className={`flex items-center gap-1.5 ${
              currentStep === 2
                ? 'text-blue-600 font-bold'
                : currentStep > 2
                ? 'text-emerald-600 font-medium'
                : 'text-slate-400'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                currentStep === 2
                  ? 'bg-blue-600 text-white'
                  : currentStep > 2
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {currentStep > 2 ? '✓' : '2'}
            </span>
            <span>Quantity</span>
          </div>

          <span className="text-slate-300">───</span>

          <div
            className={`flex items-center gap-1.5 ${
              currentStep === 3
                ? 'text-blue-600 font-bold'
                : currentStep > 3
                ? 'text-emerald-600 font-medium'
                : 'text-slate-400'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                currentStep === 3
                  ? 'bg-blue-600 text-white'
                  : currentStep > 3
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {currentStep > 3 ? '✓' : '3'}
            </span>
            <span>Select Room on Map</span>
          </div>

          <span className="text-slate-300">───</span>

          <div
            className={`flex items-center gap-1.5 ${
              currentStep === 4 ? 'text-blue-600 font-bold' : 'text-slate-400'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                currentStep === 4 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              4
            </span>
            <span>Confirm</span>
          </div>
        </div>
      </div>

      {/* ================= STEP 1: SELECT ITEM ================= */}
      {currentStep === 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">What do you need?</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose an item from the pharmacy or hospital catalog.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search item name, e.g. Paracetamol, Antibiotic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-2 text-xs">
            {['ALL', 'Medication', 'Kit', 'Specimen', 'Document'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL'
                  ? 'All Items'
                  : cat === 'Medication'
                  ? 'Medicines'
                  : cat === 'Kit'
                  ? 'Surgical Kits'
                  : cat === 'Specimen'
                  ? 'Specimens / Samples'
                  : 'Documents'}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectItem(item)}
                className={`p-4 rounded-xl border text-left transition flex items-center justify-between group ${
                  selectedItem?.id === item.id
                    ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                    : item.quantity > 0
                    ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                    : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                }`}
                disabled={item.quantity === 0}
              >
                <div>
                  <div className="font-bold text-sm text-slate-900 group-hover:text-blue-700">
                    {item.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Storage: {item.location} • {item.dosage || item.category}
                  </div>
                  <div className="mt-2 text-xs font-semibold">
                    {item.quantity > 0 ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> {item.quantity} in stock
                      </span>
                    ) : (
                      <span className="text-red-500">Out of stock</span>
                    )}
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-400 transition">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= STEP 2: SELECT QUANTITY & CHECK AVAILABILITY ================= */}
      {currentStep === 2 && selectedItem && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider">
                Selected Item
              </span>
              <h2 className="text-lg font-bold text-slate-900">{selectedItem.name}</h2>
              <p className="text-xs text-slate-500">{selectedItem.location}</p>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Change Item
            </button>
          </div>

          {/* Simple Quantity Counter */}
          <div className="text-center py-4 space-y-3">
            <label className="text-sm font-semibold text-slate-700 block">
              How many do you need?
            </label>

            <div className="inline-flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-2 shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-lg font-bold text-slate-700 shadow-xs transition"
              >
                −
              </button>

              <span className="w-16 text-2xl font-bold text-slate-900">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-lg font-bold text-slate-700 shadow-xs transition"
              >
                +
              </button>
            </div>
          </div>

          {/* Availability Status in Simple English */}
          <div
            className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${
              stockCheck.available
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {stockCheck.available ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold">✓ Available in Hospital Inventory</div>
                  <div className="text-xs text-emerald-700 mt-0.5">
                    {stockCheck.message}
                  </div>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <div className="font-bold">✕ This item is currently unavailable.</div>
                  <div className="text-xs text-red-700 mt-0.5">
                    {stockCheck.message}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              disabled={!stockCheck.available}
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition"
            >
              <span>Next: Select Location on Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: MANUALLY SELECT LOCATION ON HOSPITAL MAP ================= */}
      {currentStep === 3 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Where should it be delivered?
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click or tap any room directly on the hospital map below.
            </p>
          </div>

          {/* Quick Select Buttons */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">Quick Select Room:</span>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                'Room F-102',
                'Room A-101',
                'Room B-204',
                'Room C-305',
                'ICU',
                'Ward A',
                'Ward B',
                'Emergency Ward',
              ].map((rm) => (
                <button
                  key={rm}
                  type="button"
                  onClick={() => setSelectedLocation(rm)}
                  className={`px-3 py-1.5 rounded-lg border font-medium transition ${
                    selectedLocation === rm
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {rm}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Hospital Map (Doctor clicks node directly!) */}
          <div className="rounded-xl overflow-hidden border border-slate-200">
            <GraphCanvas
              height={380}
              selectedNode={selectedLocation}
              onNodeSelect={(nodeId) => {
                // Ensure doctor doesn't send delivery to Charging Station
                if (nodeId === 'Charging Station') return;
                setSelectedLocation(nodeId);
              }}
            />
          </div>

          {/* Selected Location Confirmation Bar */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-emerald-800 font-medium block">
                  Selected Delivery Location:
                </span>
                <span className="text-base font-bold text-emerald-950">
                  {selectedLocation}
                </span>
              </div>
            </div>

            <span className="text-xs text-emerald-700 font-semibold hidden sm:inline">
              ✓ Location Highlighted
            </span>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition"
            >
              <span>Confirm Location & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: REQUEST SUMMARY & CONFIRMATION ================= */}
      {currentStep === 4 && selectedItem && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="text-center pb-2">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Delivery Request Summary</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Please review details before the robot is dispatched.
            </p>
          </div>

          {submissionError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{submissionError}</span>
            </div>
          )}

          {/* Clean Summary Card */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl divide-y divide-slate-200/80 text-sm">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Item</span>
              <span className="font-bold text-slate-900">{selectedItem.name}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Quantity</span>
              <span className="font-bold text-slate-900">{quantity} units</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Deliver To</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-emerald-600" />
                {selectedLocation}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Requesting Doctor</span>
              <span className="font-bold text-slate-900">
                {currentDoctor.name} ({currentDoctor.id})
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Pickup Location</span>
              <span className="text-slate-700 font-medium">{selectedItem.location}</span>
            </div>
          </div>

          {/* Optional Nursing Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Instructions for bedside nurse (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Immediate post-operative administration, bed 2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Final Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirmAndDispatch}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2"
            >
              <span>Confirm & Dispatch Robot</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
