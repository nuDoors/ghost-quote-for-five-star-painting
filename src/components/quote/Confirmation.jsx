import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Clock, MapPin, User, Phone, Mail, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';

const serviceLabels = {
  interior: 'Interior Painting',
  exterior: 'Exterior Painting',
  cabinet: 'Cabinet Painting',
  trim: 'Wallpaper',
  deck: 'Deck & Fence Staining'
};

export default function Confirmation({ bookingData, service, quote }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle className="w-10 h-10 text-emerald-600" />
      </motion.div>

      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
        You're All Set!
      </h2>
      <p className="text-slate-600 text-lg mb-8">
        Your consultation has been scheduled
      </p>

      {/* Booking Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 text-left">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div>
            <p className="text-sm text-slate-500">Confirmation Number</p>
            <p className="text-xl font-bold text-[#1e3a5f]">
              FSP-{Date.now().toString().slice(-8)}
            </p>
          </div>
          <div className="w-16 h-16 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
            <span className="text-3xl text-white">★</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-[#1e3a5f]" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Date</p>
              <p className="font-semibold text-slate-900">
                {bookingData.bookedDate ? format(new Date(bookingData.bookedDate), 'EEEE, MMMM d, yyyy') : 'TBD'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-[#1e3a5f]" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Time</p>
              <p className="font-semibold text-slate-900">{bookingData.bookedTime || 'TBD'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-[#1e3a5f]" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Location</p>
              <p className="font-semibold text-slate-900">{bookingData.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5 text-[#1e3a5f]" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Service</p>
              <p className="font-semibold text-slate-900">{serviceLabels[service]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estimator Card */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2a4d7a] rounded-2xl p-6 mb-6 text-white text-left">
        <p className="text-white/80 text-sm mb-3">Your Estimator</p>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold">
              {bookingData.territoryOwner?.split(' ').map(n => n[0]).join('') || 'FS'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-lg">{bookingData.territoryOwner || 'Five Star Team'}</p>
            <p className="text-white/80">{bookingData.territoryLocation || 'Your Local Office'}</p>
          </div>
        </div>
      </div>

      {/* Estimate Reminder */}
      <div className="bg-[#d4a853]/10 border border-[#d4a853]/30 rounded-2xl p-4 mb-6">
        <p className="text-[#8b6914] font-medium">
          Estimated Quote: ${quote.estimate.low.toLocaleString()} – ${quote.estimate.high.toLocaleString()}
        </p>
        <p className="text-sm text-[#8b6914]/80 mt-1">
          Final pricing confirmed after in-person consultation
        </p>
      </div>

      {/* What's Next */}
      <div className="bg-slate-50 rounded-2xl p-6 text-left mb-6">
        <h3 className="font-semibold text-slate-900 mb-4">What's Next?</h3>
        <ol className="space-y-3">
          {[
            'You\'ll receive a confirmation email shortly',
            'Our estimator will call to confirm the appointment',
            'Prepare any questions about your project',
            'We\'ll provide a detailed proposal after the visit'
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[#1e3a5f] text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                {idx + 1}
              </span>
              <span className="text-slate-700">{item}</span>
            </li>
          ))}
        </ol>
      </div>

      <Button
        onClick={() => window.location.href = createPageUrl('Home')}
        className="w-full h-14 text-lg font-semibold bg-[#1e3a5f] hover:bg-[#2a4d7a] rounded-xl"
      >
        Back to Home
      </Button>
    </motion.div>
  );
}