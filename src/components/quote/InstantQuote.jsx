import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, DollarSign, CheckCircle, AlertCircle, Gauge, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateEstimate, calculateConfidence } from './MockData';

const serviceLabels = {
  interior: 'Interior Painting',
  exterior: 'Exterior Painting',
  cabinet: 'Cabinet Painting',
  trim: 'Wallpaper',
  deck: 'Deck & Fence Staining',
  garage: 'Garage Floor Coating'
};

const getLineItems = (service, details) => {
  const items = [];
  
  switch (service) {
    case 'interior':
      items.push({ label: `${details.rooms || 1} Room${(details.rooms || 1) > 1 ? 's' : ''} - Walls`, included: true });
      if (details.ceilings) items.push({ label: 'Ceiling Painting', included: true });
      if (details.trim) items.push({ label: 'Trim & Baseboards', included: true });
      if (details.stairs) items.push({ label: 'Stairway', included: true });
      items.push({ label: `${details.paintTier?.charAt(0).toUpperCase()}${details.paintTier?.slice(1) || 'Good'} Tier Paint`, included: true });
      break;
    case 'exterior':
      items.push({ label: `${details.stories || 1}-Story Exterior`, included: true });
      items.push({ label: `${details.sidingType?.replace('-', ' ').charAt(0).toUpperCase()}${details.sidingType?.slice(1) || 'Vinyl'} Siding`, included: true });
      if (details.trim) items.push({ label: 'Exterior Trim', included: true });
      if (details.doors) items.push({ label: 'Entry Doors', included: true });
      break;
    case 'cabinet':
      items.push({ label: `${details.kitchenSize?.charAt(0).toUpperCase()}${details.kitchenSize?.slice(1) || 'Medium'} Kitchen`, included: true });
      items.push({ label: `${details.doorCount || 20} Cabinet Doors`, included: true });
      if (details.paintFrames) items.push({ label: 'Face Frames', included: true });
      if (details.paintBoxes) items.push({ label: 'Cabinet Box Interiors', included: true });
      items.push({ label: `${details.finishTier?.charAt(0).toUpperCase()}${details.finishTier?.slice(1) || 'Standard'} Finish`, included: true });
      break;
    case 'trim':
      items.push({ label: `${details.linearFeet || 200} Square Feet`, included: true });
      items.push({ label: 'Wallpaper Installation', included: true });
      items.push({ label: 'Surface Prep & Priming', included: true });
      break;
    case 'deck':
      items.push({ label: `${details.squareFeet || 300} Square Feet`, included: true });
      items.push({ label: 'Surface Preparation', included: true });
      items.push({ label: 'Stain Application (2 Coats)', included: true });
      break;
    case 'garage':
      items.push({ label: `${details.squareFeet || 400} Square Feet`, included: true });
      items.push({ label: `${details.coatingType === 'polyurea' ? 'Polyurea' : 'Epoxy'} Coating`, included: true });
      items.push({ label: 'Crack Filling & Surface Prep', included: true });
      items.push({ label: 'Anti-Slip Broadcast (Optional)', included: true });
      break;
  }
  
  // Standard inclusions
  items.push({ label: 'Surface Preparation', included: true });
  items.push({ label: 'Premium Materials', included: true });
  items.push({ label: 'Clean-up & Disposal', included: true });
  
  return items;
};

export default function InstantQuote({ service, details, photos, visualizerSelections, onComplete, onBack }) {
  const [showMonthly, setShowMonthly] = useState(true);
  const estimate = calculateEstimate(service, details);
  const confidence = calculateConfidence(photos.length, Object.keys(details).length > 2);
  const lineItems = getLineItems(service, details);

  const getConfidenceColor = () => {
    return 'text-emerald-600';
  };

  const getConfidenceLabel = () => {
    return 'High Confidence';
  };

  // Calculate monthly payment (assuming 12-month financing at 0% APR for demo)
  const monthlyPayment = Math.round(estimate.low / 12);
  const monthlyPaymentHigh = Math.round(estimate.high / 12);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Your Instant Quote
          </h2>
          <p className="text-slate-600 mt-1">
            {serviceLabels[service]}
          </p>
        </div>
      </div>

      {/* Main Price Card */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-gradient-to-br from-[#1e3a5f] to-[#2a4d7a] rounded-3xl p-6 md:p-8 text-white mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#d4a853]" />
            <span className="text-white/80 font-medium">
              {showMonthly ? 'Monthly Payment' : 'Total Price Range'}
            </span>
          </div>
          <button
            onClick={() => setShowMonthly(!showMonthly)}
            className="text-sm font-semibold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
          >
            {showMonthly ? 'Total' : 'Monthly'}
          </button>
        </div>

        {showMonthly ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-baseline gap-2 mb-4"
          >
            <span className="text-4xl md:text-5xl font-bold">
              ${monthlyPayment.toLocaleString()}
            </span>
            <span className="text-2xl text-white/60">–</span>
            <span className="text-4xl md:text-5xl font-bold">
              ${monthlyPaymentHigh.toLocaleString()}
            </span>
            <span className="text-white/60 text-lg ml-2">/mo</span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-baseline gap-2 mb-4"
          >
            <span className="text-4xl md:text-5xl font-bold">
              ${estimate.low.toLocaleString()}
            </span>
            <span className="text-2xl text-white/60">–</span>
            <span className="text-4xl md:text-5xl font-bold">
              ${estimate.high.toLocaleString()}
            </span>
          </motion.div>
        )}

        {showMonthly && (
          <p className="text-sm text-white/60 mb-4">12-month financing available</p>
        )}
        
        {/* Confidence Meter */}
        <div className="bg-white/10 rounded-xl p-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              <span className="text-sm font-medium">Quote Confidence</span>
            </div>
            <span className={`text-sm font-bold ${getConfidenceColor().replace('text-', 'text-white/')}`}>
              {getConfidenceLabel()}
            </span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '85%' }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-emerald-400"
            />
          </div>
          <p className="text-xs text-white/60 mt-2">
            Based on {photos.length} photos and project details provided
          </p>
        </div>
      </motion.div>

      {/* Line Items */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#1e3a5f]" />
          What's Included
        </h3>
        <div className="space-y-3">
          {lineItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className="text-slate-700">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900">Important Note</p>
            <p className="text-sm text-amber-700 mt-1">
              This estimate is based on the information provided. Final pricing will be confirmed 
              after an in-person verification by one of our professional estimators.
            </p>
          </div>
        </div>
      </div>

      <Button
        onClick={() => onComplete({ estimate, confidence, lineItems })}
        className="w-full h-14 text-lg font-semibold bg-[#d4a853] hover:bg-[#c49843] text-white rounded-xl"
      >
        Book Your Consultation
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </motion.div>
  );
}