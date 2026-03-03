import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Palette, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ColorPicker from './ColorPicker';
import BeforeAfterSlider from './BeforeAfterSlider';

const surfaces = [
  { id: 'walls', name: 'Walls', color: 'bg-blue-500' },
  { id: 'trim', name: 'Trim', color: 'bg-amber-500' },
  { id: 'ceiling', name: 'Ceiling', color: 'bg-purple-500' },
  { id: 'doors', name: 'Doors', color: 'bg-emerald-500' },
  { id: 'cabinet_doors', name: 'Cabinet Doors', color: 'bg-rose-500' },
  { id: 'cabinet_frames', name: 'Cabinet Frames', color: 'bg-cyan-500' }
];

export default function Visualizer({ photos, service, onComplete, onBack }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [selections, setSelections] = useState({});
  const [activeSurface, setActiveSurface] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);

  const currentPhoto = photos[currentPhotoIndex];
  const currentSelections = selections[currentPhotoIndex] || {};

  const relevantSurfaces = surfaces.filter(s => {
    if (service === 'cabinet') return ['cabinet_doors', 'cabinet_frames', 'walls'].includes(s.id);
    if (service === 'trim') return ['trim', 'doors'].includes(s.id);
    if (service === 'exterior') return ['walls', 'trim', 'doors'].includes(s.id);
    return ['walls', 'trim', 'ceiling', 'doors'].includes(s.id);
  });

  const handleColorSelect = (color) => {
    if (activeSurface) {
      setSelections(prev => ({
        ...prev,
        [currentPhotoIndex]: {
          ...prev[currentPhotoIndex],
          [activeSurface]: color
        }
      }));
    }
    setShowColorPicker(false);
    setActiveSurface(null);
  };

  const handleSurfaceClick = (surfaceId) => {
    setActiveSurface(surfaceId);
    setShowColorPicker(true);
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex(prev => Math.min(prev + 1, photos.length - 1));
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex(prev => Math.max(prev - 1, 0));
  };

  // Generate a simple color overlay for visualization
  const generateOverlay = () => {
    const overlays = [];
    Object.entries(currentSelections).forEach(([surface, color]) => {
      if (color) {
        const surfaceConfig = surfaces.find(s => s.id === surface);
        overlays.push({
          surface,
          color: color.hex,
          opacity: 0.4
        });
      }
    });
    return overlays;
  };

  const hasSelections = Object.values(selections).some(s => Object.keys(s).length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Paint Visualizer
          </h2>
          <p className="text-slate-600 mt-1">
            Select surfaces and assign colors to preview your project
          </p>
        </div>
        {hasSelections && (
          <Button
            variant="outline"
            onClick={() => setShowBeforeAfter(true)}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            Compare
          </Button>
        )}
      </div>

      {/* Photo Display */}
      <div className="relative bg-slate-100 rounded-2xl overflow-hidden mb-4 aspect-video">
        <img
          src={currentPhoto.url}
          alt={`Project photo ${currentPhotoIndex + 1}`}
          className="w-full h-full object-cover"
        />
        
        {/* Color overlays */}
        {generateOverlay().map((overlay, idx) => (
          <div
            key={idx}
            className="absolute inset-0 mix-blend-multiply pointer-events-none transition-opacity duration-300"
            style={{ backgroundColor: overlay.color, opacity: overlay.opacity }}
          />
        ))}

        {/* Photo navigation */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              disabled={currentPhotoIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextPhoto}
              disabled={currentPhotoIndex === photos.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Photo counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/60 text-white text-sm font-medium rounded-full">
          {currentPhotoIndex + 1} / {photos.length}
        </div>
      </div>

      {/* Photo thumbnails */}
      {photos.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {photos.map((photo, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPhotoIndex(idx)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                idx === currentPhotoIndex ? 'border-[#1e3a5f] ring-2 ring-[#1e3a5f]/20' : 'border-slate-200'
              }`}
            >
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Surface Selection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#1e3a5f]" />
          Select Surface to Paint
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {relevantSurfaces.map(surface => {
            const selection = currentSelections[surface.id];
            return (
              <button
                key={surface.id}
                onClick={() => handleSurfaceClick(surface.id)}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  activeSurface === surface.id
                    ? 'border-[#1e3a5f] bg-[#1e3a5f]/5'
                    : selection
                    ? 'border-slate-300 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg ${selection ? '' : surface.color} flex items-center justify-center`}
                    style={selection ? { backgroundColor: selection.hex } : {}}
                  >
                    {!selection && (
                      <span className="text-white text-xs font-bold">
                        {surface.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-900">{surface.name}</p>
                    {selection && (
                      <p className="text-xs text-slate-500">
                        {selection.name} • {selection.sheen}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Button
        onClick={() => onComplete(selections)}
        className="w-full h-14 text-lg font-semibold bg-[#1e3a5f] hover:bg-[#2a4d7a] rounded-xl"
      >
        Continue to Quote
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>

      {/* Color Picker Modal */}
      <AnimatePresence>
        {showColorPicker && (
          <ColorPicker
            onSelect={handleColorSelect}
            onClose={() => { setShowColorPicker(false); setActiveSurface(null); }}
            selectedColor={currentSelections[activeSurface]}
          />
        )}
      </AnimatePresence>

      {/* Before/After Modal */}
      <AnimatePresence>
        {showBeforeAfter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowBeforeAfter(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-3xl"
            >
              <BeforeAfterSlider
                beforeImage={currentPhoto.url}
                afterImage={currentPhoto.url}
                className="aspect-video"
              />
              <p className="text-center text-white/80 mt-4 text-sm">
                Drag the slider to compare before and after
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}