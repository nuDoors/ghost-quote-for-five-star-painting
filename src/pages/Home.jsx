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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">★</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1e3a5f]">Five Star Painting</h1>
                <p className="text-xs text-slate-500">A Neighborly Company</p>
              </div>
            </div>
            {currentStep < 8 && (
              <div className="hidden md:block text-sm text-slate-500">
                Ghost Quote™ Demo
              </div>
            )}
          </div>
        </div>
        
        {/* Step Indicator */}
        {currentStep < 8 && (
          <div className="border-t border-slate-100 bg-white/50">
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
      <footer className="border-t border-slate-100 bg-white/50 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Five Star Painting. All rights reserved.</p>
          <p className="mt-1">Part of the Neighborly family of home service brands.</p>
        </div>
      </footer>
    </div>
  );
}