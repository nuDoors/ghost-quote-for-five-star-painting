import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import StepIndicator from '@/components/quote/StepIndicator';
import ZipCheck from '@/components/quote/ZipCheck';
import ServiceSelection from '@/components/quote/ServiceSelection';
import ProjectDetails from '@/components/quote/ProjectDetails';
import PhotoUpload from '@/components/quote/PhotoUpload';
import Visualizer from '@/components/quote/Visualizer';
import InstantQuote from '@/components/quote/InstantQuote';
import BookingForm from '@/components/quote/BookingForm';
import Confirmation from '@/components/quote/Confirmation';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [quoteData, setQuoteData] = useState({
    zip: '',
    service: '',
    details: {},
    photos: [],
    visualizerSelections: {},
    quote: null,
    booking: null
  });

  const updateQuoteData = (updates) => {
    setQuoteData(prev => ({ ...prev, ...updates }));
  };

  const handleZipComplete = (zip) => {
    updateQuoteData({ zip });
    setCurrentStep(2);
  };

  const handleWaitlist = async (data) => {
    try {
      await base44.entities.Lead.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        zip: data.zip,
        status: 'waitlist',
        is_waitlist: true
      });
    } catch (error) {
      console.error('Error saving waitlist:', error);
    }
  };

  const handleServiceSelect = (service) => {
    updateQuoteData({ service });
    setCurrentStep(3);
  };

  const handleDetailsComplete = (details) => {
    updateQuoteData({ details });
    setCurrentStep(4);
  };

  const handlePhotosComplete = (photos) => {
    updateQuoteData({ photos });
    setCurrentStep(5);
  };

  const handleVisualizerComplete = (selections) => {
    updateQuoteData({ visualizerSelections: selections });
    setCurrentStep(6);
  };

  const handleQuoteComplete = (quote) => {
    updateQuoteData({ quote });
    setCurrentStep(7);
  };

  const handleBookingComplete = async (booking) => {
    updateQuoteData({ booking });
    
    // Save lead to database
    try {
      await base44.entities.Lead.create({
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        address: booking.address,
        zip: quoteData.zip,
        service: quoteData.service,
        project_details: quoteData.details,
        photos: quoteData.photos.map(p => p.url),
        visualizer_selections: quoteData.visualizerSelections,
        estimate_low: quoteData.quote.estimate.low,
        estimate_high: quoteData.quote.estimate.high,
        confidence_score: quoteData.quote.confidence,
        preferred_contact: booking.preferredContact,
        desired_timeframe: booking.desiredTimeframe,
        booked_date: booking.bookedDate ? booking.bookedDate.toISOString().split('T')[0] : null,
        booked_time: booking.bookedTime,
        territory_owner: booking.territoryOwner,
        territory_location: booking.territoryLocation,
        status: 'booked',
        is_waitlist: false
      });
    } catch (error) {
      console.error('Error saving lead:', error);
    }
    
    setCurrentStep(8);
  };

  const goBack = (toStep) => {
    setCurrentStep(toStep);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ZipCheck
            onComplete={handleZipComplete}
            onWaitlist={handleWaitlist}
          />
        );
      case 2:
        return (
          <ServiceSelection
            onSelect={handleServiceSelect}
            onBack={() => goBack(1)}
          />
        );
      case 3:
        return (
          <ProjectDetails
            service={quoteData.service}
            onComplete={handleDetailsComplete}
            onBack={() => goBack(2)}
          />
        );
      case 4:
        return (
          <PhotoUpload
            onComplete={handlePhotosComplete}
            onBack={() => goBack(3)}
          />
        );
      case 5:
        return (
          <Visualizer
            photos={quoteData.photos}
            service={quoteData.service}
            onComplete={handleVisualizerComplete}
            onBack={() => goBack(4)}
          />
        );
      case 6:
        return (
          <InstantQuote
            service={quoteData.service}
            details={quoteData.details}
            photos={quoteData.photos}
            visualizerSelections={quoteData.visualizerSelections}
            onComplete={handleQuoteComplete}
            onBack={() => goBack(5)}
          />
        );
      case 7:
        return (
          <BookingForm
            zip={quoteData.zip}
            quote={quoteData.quote}
            onComplete={handleBookingComplete}
            onBack={() => goBack(6)}
          />
        );
      case 8:
        return (
          <Confirmation
            bookingData={quoteData.booking}
            service={quoteData.service}
            quote={quoteData.quote}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen fsp-gradient-bg">
      {/* Top Bar */}
      <div className="bg-[#1a3a5c] text-white text-xs py-1.5 px-4 text-center">
        <span className="opacity-80">A Neighborly Company</span>
        <span className="mx-3 opacity-40">|</span>
        <a href="tel:8882613633" className="font-semibold hover:underline">(888) 261-3633</a>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-md border-b-4 border-[#c8540a]">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a72dd4b7aaafa27f7f2697/35e9a74f8_NeighborlyXGhostQuoteaiPitchDeck.jpg"
                alt="Five Star Painting"
                className="h-12 w-auto"
              />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {currentStep < 8 && (
                <span className="hidden md:inline-block text-xs font-semibold text-[#c8540a] bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                  Ghost Quote™
                </span>
              )}
              <a href="tel:8882613633" className="hidden sm:flex items-center gap-2 bg-[#1a3a5c] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#14304f] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z" />
                </svg>
                (888) 261-3633
              </a>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        {currentStep < 8 && (
          <div className="border-t border-slate-100 bg-slate-50">
            <div className="max-w-6xl mx-auto px-4">
              <StepIndicator currentStep={currentStep} />
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a3a5c] text-white py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
                <span className="text-[#c8540a] text-xl font-black">★</span>
              </div>
              <div>
                <div className="font-black text-base uppercase tracking-tight">Five Star Painting</div>
                <div className="text-white/50 text-xs">A Neighborly Company</div>
              </div>
            </div>
            <div className="text-center text-white/60 text-sm">
              <p>© {new Date().getFullYear()} Five Star Painting. All rights reserved.</p>
              <p className="mt-0.5">Part of the Neighborly family of home service brands.</p>
            </div>
            <div className="text-white/80 text-sm font-semibold">
              <a href="tel:8882613633" className="hover:text-white">(888) 261-3633</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}