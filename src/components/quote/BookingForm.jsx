import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, User, Mail, Phone, MessageSquare, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { getTerritoryOwner, mockAvailability } from './MockData';

export default function BookingForm({ zip, quote, onComplete, onBack }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
    preferredContact: 'phone',
    desiredTimeframe: '',
    bookedDate: null,
    bookedTime: ''
  });
  const [step, setStep] = useState(1);

  const territoryOwner = getTerritoryOwner(zip);
  const availableSlots = formData.bookedDate ? mockAvailability.getSlots(formData.bookedDate) : [];

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStep1Valid = formData.name && formData.email && formData.phone && formData.address;
  const isStep2Valid = formData.bookedDate && formData.bookedTime;

  const handleSubmit = () => {
    onComplete({
      ...formData,
      territoryOwner: territoryOwner?.name,
      territoryLocation: territoryOwner?.location
    });
  };

  const minDate = addDays(new Date(), 1);

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
            Book Your Consultation
          </h2>
          <p className="text-slate-600 mt-1">
            Schedule a time for your free in-person estimate
          </p>
        </div>
      </div>

      {/* Territory Owner Card */}
      {territoryOwner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1e3a5f]/10 to-[#c8540a]/5 border-2 border-[#1e3a5f]/30 rounded-2xl p-6 mb-6 shadow-lg"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Video */}
            <div className="flex-shrink-0">
              <video
                autoPlay
                loop
                muted
                className="w-24 h-24 rounded-full ring-4 ring-white shadow-md object-cover"
                src="https://base44.app/api/apps/69a72dd4b7aaafa27f7f2697/files/public/69a72dd4b7aaafa27f7f2697/dd5b08f1c_ElevenLabs_video_creatify-aurora_2026-03-06T03_21_59.mp4"
              />
            </div>

            {/* Info Section */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-[#c8540a] mb-1">Your Local Expert</p>
              <p className="text-2xl font-black text-slate-900">{territoryOwner.name}</p>
              <p className="text-sm font-semibold text-[#1e3a5f] mb-3">{territoryOwner.location}</p>

              {/* Google Reviews */}
              <div className="flex items-center justify-center md:justify-start gap-3 bg-white/60 rounded-xl px-4 py-2 w-fit mx-auto md:mx-0">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">4.9 out of 5</p>
                  <p className="text-xs text-slate-600">Based on 148 reviews</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#1e3a5f]' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step > 1 ? 'bg-emerald-500 text-white' : step === 1 ? 'bg-[#1e3a5f] text-white' : 'bg-slate-200'
          }`}>
            {step > 1 ? <Check className="w-4 h-4" /> : '1'}
          </div>
          <span className="font-medium hidden sm:block">Contact Info</span>
        </div>
        <div className="flex-1 h-1 bg-slate-200 rounded-full">
          <div className={`h-full bg-[#1e3a5f] rounded-full transition-all ${step > 1 ? 'w-full' : 'w-0'}`} />
        </div>
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#1e3a5f]' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step === 2 ? 'bg-[#1e3a5f] text-white' : 'bg-slate-200'
          }`}>
            2
          </div>
          <span className="font-medium hidden sm:block">Schedule</span>
        </div>
      </div>

      {step === 1 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 mb-6"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="flex items-center gap-2 text-slate-700 mb-2">
                <User className="w-4 h-4" /> Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="John Smith"
                className="h-12 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="address" className="flex items-center gap-2 text-slate-700 mb-2">
                <MapPin className="w-4 h-4" /> Project Address
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="123 Main St, City, State"
                className="h-12 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2 text-slate-700 mb-2">
                  <Mail className="w-4 h-4" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="john@example.com"
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2 text-slate-700 mb-2">
                  <Phone className="w-4 h-4" /> Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2 text-slate-700 mb-2">
                <MessageSquare className="w-4 h-4" /> Preferred Contact Method
              </Label>
              <RadioGroup
                value={formData.preferredContact}
                onValueChange={(v) => updateField('preferredContact', v)}
                className="flex gap-4"
              >
                {['phone', 'email', 'text'].map(method => (
                  <div key={method} className="flex items-center">
                    <RadioGroupItem value={method} id={method} className="peer sr-only" />
                    <Label
                      htmlFor={method}
                      className="px-4 py-2 rounded-lg border-2 border-slate-200 cursor-pointer hover:border-slate-300 peer-data-[state=checked]:border-[#1e3a5f] peer-data-[state=checked]:bg-[#1e3a5f]/5 transition-all capitalize"
                    >
                      {method}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-slate-700 mb-2 block">Desired Start Timeframe</Label>
              <Select value={formData.desiredTimeframe} onValueChange={(v) => updateField('desiredTimeframe', v)}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="When would you like to start?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asap">As soon as possible</SelectItem>
                  <SelectItem value="1-2weeks">Within 1-2 weeks</SelectItem>
                  <SelectItem value="2-4weeks">Within 2-4 weeks</SelectItem>
                  <SelectItem value="1-2months">Within 1-2 months</SelectItem>
                  <SelectItem value="flexible">Flexible / Just exploring</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => setStep(2)}
            disabled={!isStep1Valid}
            className="w-full h-14 text-lg font-semibold bg-[#1e3a5f] hover:bg-[#2a4d7a] rounded-xl mt-6 disabled:opacity-50"
          >
            Continue to Scheduling
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="flex items-center gap-2 text-slate-700 mb-3">
                <Calendar className="w-4 h-4" /> Select Date
              </Label>
              <CalendarComponent
                mode="single"
                selected={formData.bookedDate}
                onSelect={(date) => {
                  updateField('bookedDate', date);
                  updateField('bookedTime', '');
                }}
                disabled={(date) => isBefore(date, startOfDay(minDate)) || date.getDay() === 0}
                className="rounded-xl border"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 text-slate-700 mb-3">
                <Clock className="w-4 h-4" /> Select Time
              </Label>
              {formData.bookedDate ? (
                availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => updateField('bookedTime', slot)}
                        className={`p-3 rounded-xl border-2 font-medium transition-all ${
                          formData.bookedTime === slot
                            ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    No availability on this day
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-slate-400">
                  Please select a date first
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1 h-14 rounded-xl"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isStep2Valid}
              className="flex-1 h-14 text-lg font-semibold bg-[#d4a853] hover:bg-[#c49843] text-white rounded-xl disabled:opacity-50"
            >
              Confirm Booking
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}