import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Sparkles, Paintbrush, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ColorPicker from './ColorPicker';
import { builtInDemoPairs, pickBestPair } from './DemoPairs';

const ALL_SURFACES = [
  { id: 'siding',         name: 'Siding',          color: '#3b82f6', services: ['exterior'] },
  { id: 'walls',          name: 'Walls',            color: '#3b82f6', services: ['interior', 'cabinet'] },
  { id: 'trim',           name: 'Trim',             color: '#f59e0b', services: ['exterior', 'interior', 'trim'] },
  { id: 'doors',          name: 'Doors',            color: '#10b981', services: ['exterior', 'interior', 'trim'] },
  { id: 'shutters',       name: 'Shutters',         color: '#8b5cf6', services: ['exterior'] },
  { id: 'garage',         name: 'Garage',           color: '#6b7280', services: ['exterior'] },
  { id: 'ceiling',        name: 'Ceiling',          color: '#a855f7', services: ['interior'] },
  { id: 'cabinet_doors',  name: 'Cabinet Doors',    color: '#f43f5e', services: ['cabinet'] },
  { id: 'cabinet_frames', name: 'Cabinet Frames',   color: '#06b6d4', services: ['cabinet'] },
  { id: 'deck',           name: 'Deck / Fence',     color: '#92400e', services: ['deck'] },
  { id: 'garage_floor',  name: 'Garage Floor',     color: '#6b7280', services: ['garage'] },
];

const ANALYZING_MESSAGES = [
  'Analyzing surfaces…',
  'Detecting edges and materials…',
  'Applying color profiles…',
  'Rendering final preview…',
];

export default function Visualizer({ photos, service, onComplete, onBack }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [surfaceColors, setSurfaceColors] = useState({}); // { surfaceId: { color, sheen } }
  const [activeSurface, setActiveSurface] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Rendering state
  const [rendered, setRendered] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderMsgIdx, setRenderMsgIdx] = useState(0);
  const [afterOpacity, setAfterOpacity] = useState(0);

  // Slider
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);

  // Selected demo pair
  const [activePair, setActivePair] = useState(null);

  const relevantSurfaces = ALL_SURFACES.filter(s => {
    if (service === 'cabinet') {
      return s.services.includes(service) && s.id !== 'walls' && s.id !== 'cabinet_frames';
    }
    return s.services.includes(service);
  });

  // Load admin-uploaded pairs from DB, fall back to built-ins
  const { data: dbPairs = [] } = useQuery({
    queryKey: ['demoPairs', service],
    queryFn: () => base44.entities.DemoImagePair.filter({ service }),
    initialData: [],
  });

  const allPairs = [...(dbPairs.length ? dbPairs : []), ...builtInDemoPairs.filter(p => p.service === service)];

  // Pick best pair whenever selections change
  useEffect(() => {
    const pair = pickBestPair(allPairs, service, { ...surfaceColors });
    setActivePair(pair || null);
    // If we re-pick a new pair, reset rendered state
    setRendered(false);
    setAfterOpacity(0);
  }, [service, JSON.stringify(surfaceColors), dbPairs.length]);

  // Render preview animation
  const handleRender = () => {
    if (!activePair) return;
    setRendering(true);
    setRendered(false);
    setAfterOpacity(0);
    setRenderMsgIdx(0);

    // Cycle through messages
    let idx = 0;
    const interval = setInterval(() => {
      idx += 1;
      if (idx < ANALYZING_MESSAGES.length) {
        setRenderMsgIdx(idx);
      } else {
        clearInterval(interval);
      }
    }, 320);

    // After 1.3s, fade in the after image
    setTimeout(() => {
      clearInterval(interval);
      setRendering(false);
      setRendered(true);
      // Animate opacity from 0 → 1
      let op = 0;
      const fadeInterval = setInterval(() => {
        op += 0.05;
        setAfterOpacity(Math.min(op, 1));
        if (op >= 1) clearInterval(fadeInterval);
      }, 30);
    }, 1350);
  };

  const resetRender = () => {
    setRendered(false);
    setAfterOpacity(0);
    setSliderPos(50);
  };

  // Slider drag handlers
  const handleSliderPointerDown = (e) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handleSliderPointerMove = (e) => {
    if (!isDragging || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setSliderPos(Math.max(0, Math.min(100, (x / rect.width) * 100)));
  };
  const handleSliderPointerUp = () => setIsDragging(false);

  const handleColorSelect = (color) => {
    if (!activeSurface) return;
    setSurfaceColors(prev => ({ ...prev, [activeSurface]: color }));
    setShowColorPicker(false);
    setActiveSurface(null);
    resetRender();
  };

  const clearSurface = (id, e) => {
    e.stopPropagation();
    setSurfaceColors(prev => { const n = { ...prev }; delete n[id]; return n; });
    resetRender();
  };

  const hasSelections = Object.keys(surfaceColors).length > 0;
  const currentPhoto = photos[currentPhotoIndex];
  const beforeUrl = activePair?.before_url || currentPhoto?.url;
  const afterUrl = activePair?.after_url || currentPhoto?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center mb-5">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Paint Visualizer</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Select surfaces, pick colors, then click <strong>Render Preview</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Image viewer */}
        <div className="lg:col-span-2 space-y-3">

          {/* Main image area */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video">
            {!rendered ? (
              /* Before / current state */
              <img
                src={beforeUrl}
                alt="Before"
                className="w-full h-full object-cover"
              />
            ) : (
              /* Before/After slider */
              <div
                ref={sliderRef}
                className="relative w-full h-full select-none"
                style={{ cursor: isDragging ? 'ew-resize' : 'col-resize' }}
                onPointerDown={handleSliderPointerDown}
                onPointerMove={handleSliderPointerMove}
                onPointerUp={handleSliderPointerUp}
              >
                {/* Before (full) */}
                <img
                  src={beforeUrl}
                  alt="Before"
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
                {/* After (clipped left portion) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                  <img
                    src={afterUrl}
                    alt="After"
                    className="w-full h-full object-cover"
                    draggable={false}
                    style={{ opacity: afterOpacity, transition: afterOpacity < 1 ? 'none' : undefined }}
                  />
                </div>
                {/* Slider handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none"
                  style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center border border-slate-200">
                    <div className="flex gap-0.5">
                      <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-r-[6px] border-transparent border-r-slate-400" />
                      <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[6px] border-transparent border-l-slate-400" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/70 text-white text-xs font-semibold rounded-lg pointer-events-none">Before</div>
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-white text-slate-900 text-xs font-semibold rounded-lg pointer-events-none">After</div>
              </div>
            )}

            {/* Rendering overlay */}
            <AnimatePresence>
              {rendering && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4 z-20"
                >
                  <div className="relative">
                    <div className="w-14 h-14 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-white" />
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={renderMsgIdx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="text-white font-semibold text-base"
                    >
                      {ANALYZING_MESSAGES[renderMsgIdx]}
                    </motion.p>
                  </AnimatePresence>
                  <div className="flex gap-1.5">
                    {ANALYZING_MESSAGES.map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i <= renderMsgIdx ? 'bg-white' : 'bg-white/30'}`} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Photo nav */}
            {photos.length > 1 && (
              <>
                <button onClick={() => { setCurrentPhotoIndex(p => Math.max(p - 1, 0)); resetRender(); }}
                  disabled={currentPhotoIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg disabled:opacity-30 z-10">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => { setCurrentPhotoIndex(p => Math.min(p + 1, photos.length - 1)); resetRender(); }}
                  disabled={currentPhotoIndex === photos.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg disabled:opacity-30 z-10">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* AI disclaimer */}
          {rendered && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-xs text-slate-400 italic"
            >
              Preview generated using AI surface detection. Final result may vary based on lighting and finish.
            </motion.p>
          )}

          {/* Render button */}
          <Button
            onClick={rendered ? resetRender : handleRender}
            disabled={rendering || !hasSelections}
            className={`w-full h-13 text-base font-semibold rounded-xl transition-all ${
              rendered
                ? 'bg-slate-700 hover:bg-slate-800'
                : 'bg-gradient-to-r from-[#1e3a5f] to-[#2a5298] hover:opacity-95'
            } text-white disabled:opacity-50`}
          >
            {rendering ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Rendering…
              </span>
            ) : rendered ? (
              <span className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Reset &amp; Re-paint
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Render Preview
              </span>
            )}
          </Button>

          {/* Scenario selector if multiple pairs */}
          {allPairs.length > 1 && (
            <div>
              <p className="text-xs text-slate-500 mb-2 font-medium">Demo Scenarios</p>
              <div className="flex gap-2 flex-wrap">
                {allPairs.map((pair, i) => (
                  <button
                    key={pair.id || i}
                    onClick={() => { setActivePair(pair); resetRender(); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      activePair?.id === pair.id || activePair?.scenario_name === pair.scenario_name
                        ? 'border-[#1e3a5f] bg-[#1e3a5f]/10 text-[#1e3a5f]'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {pair.scenario_name || `Scenario ${i + 1}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Photo strip */}
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.map((photo, idx) => (
                <button key={idx} onClick={() => { setCurrentPhotoIndex(idx); resetRender(); }}
                  className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                    idx === currentPhotoIndex ? 'border-[#1e3a5f] ring-2 ring-[#1e3a5f]/20' : 'border-slate-200'
                  }`}>
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Surface + color panel */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2 text-sm">
              <Paintbrush className="w-4 h-4 text-[#1e3a5f]" />
              Select Surfaces &amp; Colors
            </h3>
            <div className="space-y-2">
              {relevantSurfaces.map(surface => {
                const sel = surfaceColors[surface.id];
                const isActive = activeSurface === surface.id;
                return (
                  <button
                    key={surface.id}
                    onClick={() => {
                      setActiveSurface(surface.id);
                      setShowColorPicker(true);
                      resetRender();
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      isActive
                        ? 'border-[#1e3a5f] bg-[#1e3a5f]/5'
                        : sel
                        ? 'border-slate-200 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex-shrink-0 border border-black/10"
                      style={{ backgroundColor: sel?.hex || surface.color + '33' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{surface.name}</p>
                      {sel ? (
                        <p className="text-xs text-slate-500 truncate">{sel.name} · {sel.sheen}</p>
                      ) : (
                        <p className="text-xs text-slate-400">Tap to choose color</p>
                      )}
                    </div>
                    {sel && (
                      <button
                        onClick={(e) => clearSurface(surface.id, e)}
                        className="w-5 h-5 rounded-full bg-slate-200 hover:bg-red-400 hover:text-white flex items-center justify-center text-slate-500 text-xs flex-shrink-0"
                      >
                        ×
                      </button>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected colors summary */}
          {hasSelections && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 p-4"
            >
              <h3 className="font-semibold text-slate-900 mb-3 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Color Summary
              </h3>
              <div className="space-y-2">
                {Object.entries(surfaceColors).map(([id, color]) => {
                  const surf = ALL_SURFACES.find(s => s.id === id);
                  return (
                    <div key={id} className="flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 rounded-md border border-black/10 flex-shrink-0"
                        style={{ backgroundColor: color.hex }} />
                      <span className="text-slate-600 flex-shrink-0">{surf?.name}:</span>
                      <span className="text-slate-900 font-medium truncate">{color.name}</span>
                    </div>
                  );
                })}
              </div>
              {rendered && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-400 italic">
                    Colors shown for reference. Pre-rendered visualization active.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Continue button */}
           <Button
             onClick={() => onComplete({ surfaceColors, activePair })}
             disabled={!rendered}
             className="w-full h-12 font-semibold bg-[#1e3a5f] hover:bg-[#2a4d7a] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
           >
             Continue to Quote
             <ArrowRight className="ml-2 w-4 h-4" />
           </Button>
        </div>
      </div>

      {/* Color Picker */}
      <AnimatePresence>
        {showColorPicker && (
          <ColorPicker
            onSelect={handleColorSelect}
            onClose={() => { setShowColorPicker(false); setActiveSurface(null); }}
            selectedColor={activeSurface ? surfaceColors[activeSurface] : null}
            surfaceId={activeSurface}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}