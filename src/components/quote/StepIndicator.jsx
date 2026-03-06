import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  { id: 1, name: 'Location' },
  { id: 2, name: 'Service' },
  { id: 3, name: 'Details' },
  { id: 4, name: 'Photos' },
  { id: 5, name: 'Visualize' },
  { id: 6, name: 'Quote' },
  { id: 7, name: 'Book' }
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="w-full py-4 px-2">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: currentStep >= step.id ? 1 : 0.8 }}
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  currentStep > step.id
                    ? 'bg-[#c8540a] text-white'
                    : currentStep === step.id
                    ? 'bg-[#c8540a] text-white ring-4 ring-[#c8540a]/20'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  step.id
                )}
              </motion.div>
              <span className={`mt-2 text-xs font-medium hidden md:block ${
                currentStep >= step.id ? 'text-[#1e3a5f]' : 'text-slate-400'
              }`}>
                {step.name}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className="flex-1 h-1 mx-2 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: currentStep > step.id ? '100%' : '0%' }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-[#c8540a]"
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}