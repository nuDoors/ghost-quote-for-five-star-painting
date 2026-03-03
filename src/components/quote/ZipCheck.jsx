import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isZipServiceable } from './MockData';

export default function ZipCheck({ onComplete, onWaitlist }) {
  const [zip, setZip] = useState('');
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [waitlistData, setWaitlistData] = useState({ name: '', email: '', phone: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleCheck = () => {
    if (zip.length === 5) {
      if (isZipServiceable(zip)) {
        onComplete(zip);
      } else {
        setShowWaitlist(true);
      }
    }
  };

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    onWaitlist({ ...waitlistData, zip });
    setSubmitted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#1e3a5f]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-[#1e3a5f]" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          Let's Get Started
        </h2>
        <p className="text-slate-600">
          Enter your zip code to check service availability
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!showWaitlist ? (
          <motion.div
            key="zip-input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter zip code"
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                className="h-14 text-lg pl-12 rounded-xl border-2 border-slate-200 focus:border-[#1e3a5f] transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              />
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
            <Button
              onClick={handleCheck}
              disabled={zip.length !== 5}
              className="w-full h-14 text-lg font-semibold bg-[#1e3a5f] hover:bg-[#2a4d7a] rounded-xl transition-all duration-300 disabled:opacity-50"
            >
              Continue
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-center text-sm text-slate-500">
              Try: 90210, 10001, 60601, 75201, 33101
            </p>
          </motion.div>
        ) : !submitted ? (
          <motion.div
            key="waitlist-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">Not yet in your area</p>
                  <p className="text-sm text-amber-700 mt-1">
                    We're expanding fast! Join our waitlist and we'll notify you when we launch in {zip}.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleWaitlistSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-slate-700">Full Name</Label>
                <Input
                  id="name"
                  value={waitlistData.name}
                  onChange={(e) => setWaitlistData({ ...waitlistData, name: e.target.value })}
                  className="h-12 mt-1 rounded-xl"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-slate-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={waitlistData.email}
                  onChange={(e) => setWaitlistData({ ...waitlistData, email: e.target.value })}
                  className="h-12 mt-1 rounded-xl"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-slate-700">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={waitlistData.phone}
                  onChange={(e) => setWaitlistData({ ...waitlistData, phone: e.target.value })}
                  className="h-12 mt-1 rounded-xl"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold bg-[#d4a853] hover:bg-[#c49843] text-white rounded-xl"
              >
                Join Waitlist
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setShowWaitlist(false); setZip(''); }}
                className="w-full"
              >
                Try a different zip code
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="waitlist-success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">You're on the list!</h3>
            <p className="text-slate-600">
              We'll notify you at {waitlistData.email} when Five Star Painting launches in {zip}.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}