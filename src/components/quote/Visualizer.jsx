import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Palette, ChevronLeft, ChevronRight, RotateCcw, Paintbrush, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ColorPicker from './ColorPicker';

const surfaces = [
  { id: 'walls', name: 'Walls / Siding', color: '#3b82f6', hint: 'Click on the walls or siding' },
  { id: 'trim', name: 'Trim & Molding', color: '#f59e0b', hint: 'Click on trim or baseboards' },
  { id: 'ceiling', name: 'Ceiling', color: '#8b5cf6', hint: 'Click on the ceiling area' },
  { id: 'doors', name: 'Doors', color: '#10b981', hint: 'Click on door panels' },
  { id: 'cabinet_doors', name: 'Cabinet Doors', color: '#f43f5e', hint: 'Click on cabinet doors' },
  { id: 'cabinet_frames', name: 'Cabinet Frames', color: '#06b6d4', hint: 'Click on cabinet frames' },
];

export default function Visualizer({ photos, service, onComplete, onBack }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [activeSurface, setActiveSurface] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  // { [photoIndex]: { [surfaceId]: { color, regions: [{x,y,radius}] } } }
  const [paintData, setPaintData] = useState({});
  const [showSlider, setShowSlider] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const beforeCanvasRef = useRef(null);
  const afterCanvasRef = useRef(null);
  const sliderContainerRef = useRef(null);
  const imgRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  const currentPhoto = photos[currentPhotoIndex];
  const currentPaint = paintData[currentPhotoIndex] || {};

  const relevantSurfaces = surfaces.filter(s => {
    if (service === 'cabinet') return ['cabinet_doors', 'cabinet_frames', 'walls'].includes(s.id);
    if (service === 'trim') return ['trim', 'doors'].includes(s.id);
    if (service === 'exterior') return ['walls', 'trim', 'doors'].includes(s.id);
    return ['walls', 'trim', 'ceiling', 'doors'].includes(s.id);
  });

  // Draw the "after" canvas with all paint regions
  const drawAfterCanvas = useCallback(() => {
    const canvas = afterCanvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.complete || !img.naturalWidth) return;

    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Draw base image
    ctx.drawImage(img, 0, 0);

    // Draw each painted surface region
    Object.entries(currentPaint).forEach(([surfaceId, data]) => {
      if (!data.color || !data.regions?.length) return;
      const hex = data.color.hex.replace('#', '');
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);

      const sheenOpacity = { flat: 0.55, eggshell: 0.50, satin: 0.45, 'semi-gloss': 0.40 }[data.color.sheen] || 0.50;

      data.regions.forEach(region => {
        // Soft circular brush stroke
        const gradient = ctx.createRadialGradient(region.x, region.y, 0, region.x, region.y, region.radius);
        gradient.addColorStop(0, `rgba(${r},${g},${b},${sheenOpacity})`);
        gradient.addColorStop(0.7, `rgba(${r},${g},${b},${sheenOpacity * 0.8})`);
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);

        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(region.x, region.y, region.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    });
  }, [currentPaint]);

  // Draw base (before) canvas
  const drawBeforeCanvas = useCallback(() => {
    const canvas = beforeCanvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.complete || !img.naturalWidth) return;
    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
  }, []);

  useEffect(() => {
    if (imgLoaded) {
      drawBeforeCanvas();
      drawAfterCanvas();
    }
  }, [imgLoaded, drawBeforeCanvas, drawAfterCanvas]);

  useEffect(() => {
    drawAfterCanvas();
  }, [currentPaint, drawAfterCanvas]);

  // When photo changes, reset loaded state
  useEffect(() => {
    setImgLoaded(false);
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth) {
      setImgLoaded(true);
    }
  }, [currentPhotoIndex]);

  const handleCanvasClick = (e) => {
    if (!activeSurface) return;
    const canvas = afterCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const radius = Math.min(canvas.width, canvas.height) * 0.12;

    // Check if this surface has a color already, if not open color picker first
    const existing = currentPaint[activeSurface];
    if (!existing?.color) {
      // Store click position temporarily and open color picker
      setPaintData(prev => ({
        ...prev,
        [currentPhotoIndex]: {
          ...prev[currentPhotoIndex],
          [activeSurface]: {
            color: null,
            regions: [{ x, y, radius }]
          }
        }
      }));
      setShowColorPicker(true);
      return;
    }

    // Add paint region
    setPaintData(prev => {
      const photoData = prev[currentPhotoIndex] || {};
      const surfData = photoData[activeSurface] || { color: existing.color, regions: [] };
      return {
        ...prev,
        [currentPhotoIndex]: {
          ...photoData,
          [activeSurface]: {
            ...surfData,
            regions: [...surfData.regions, { x, y, radius }]
          }
        }
      };
    });
  };

  const handleColorSelect = (color) => {
    setShowColorPicker(false);
    if (!activeSurface) return;

    setPaintData(prev => {
      const photoData = prev[currentPhotoIndex] || {};
      const existing = photoData[activeSurface] || { regions: [] };
      return {
        ...prev,
        [currentPhotoIndex]: {
          ...photoData,
          [activeSurface]: {
            ...existing,
            color
          }
        }
      };
    });
  };

  const clearSurface = (surfaceId) => {
    setPaintData(prev => {
      const photoData = { ...(prev[currentPhotoIndex] || {}) };
      delete photoData[surfaceId];
      return { ...prev, [currentPhotoIndex]: photoData };
    });
  };

  // Slider drag
  const handleSliderMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };
  const handleSliderMouseMove = useCallback((e) => {
    if (!isDragging || !sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
    setSliderPos(Math.max(0, Math.min(100, (x / rect.width) * 100)));
  }, [isDragging]);
  const handleSliderMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleSliderMouseMove);
      window.addEventListener('mouseup', handleSliderMouseUp);
      window.addEventListener('touchmove', handleSliderMouseMove);
      window.addEventListener('touchend', handleSliderMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleSliderMouseMove);
      window.removeEventListener('mouseup', handleSliderMouseUp);
      window.removeEventListener('touchmove', handleSliderMouseMove);
      window.removeEventListener('touchend', handleSliderMouseUp);
    };
  }, [isDragging, handleSliderMouseMove]);

  const hasPaint = Object.values(currentPaint).some(d => d?.color && d?.regions?.length > 0);

  const surfaceInfo = relevantSurfaces.find(s => s.id === activeSurface);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Paint Visualizer</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            1. Pick a surface below → 2. Click it in your photo to paint → 3. Compare before & after
          </p>
        </div>
      </div>

      {/* Surface Selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {relevantSurfaces.map(surface => {
          const data = currentPaint[surface.id];
          const isActive = activeSurface === surface.id;
          return (
            <button
              key={surface.id}
              onClick={() => setActiveSurface(isActive ? null : surface.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                isActive
                  ? 'border-transparent text-white scale-105 shadow-lg'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
              style={isActive ? { backgroundColor: surface.color, borderColor: surface.color } : {}}
            >
              <div
                className="w-4 h-4 rounded-full border-2 border-white/50 flex-shrink-0"
                style={{ backgroundColor: data?.color?.hex || surface.color }}
              />
              {surface.name}
              {data?.color && (
                <span className="text-xs opacity-70">({data.regions?.length || 0} strokes)</span>
              )}
              {data?.color && !isActive && (
                <button
                  onClick={(e) => { e.stopPropagation(); clearSurface(surface.id); }}
                  className="w-4 h-4 rounded-full bg-slate-300 hover:bg-red-400 flex items-center justify-center text-white ml-1"
                >
                  ×
                </button>
              )}
            </button>
          );
        })}
      </div>

      {/* Active surface hint */}
      <AnimatePresence>
        {activeSurface && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 mb-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: surfaceInfo?.color }}
          >
            <Paintbrush className="w-4 h-4" />
            {currentPaint[activeSurface]?.color
              ? `Painting: ${surfaceInfo?.name} — click anywhere on the photo to apply paint strokes`
              : `Click on the photo where the ${surfaceInfo?.name.toLowerCase()} are — you'll pick a color first`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Viewer: toggle between paint mode and before/after */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 mb-4" style={{ minHeight: 200 }}>
        {/* Hidden image for canvas source */}
        <img
          ref={imgRef}
          src={currentPhoto.url}
          crossOrigin="anonymous"
          onLoad={() => setImgLoaded(true)}
          className="hidden"
          alt=""
        />

        {!showSlider ? (
          /* Paint Mode: show the after canvas */
          <div className="relative">
            <canvas
              ref={afterCanvasRef}
              onClick={handleCanvasClick}
              className="w-full block"
              style={{ cursor: activeSurface ? 'crosshair' : 'default', maxHeight: '60vh', objectFit: 'contain' }}
            />
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {/* No surface selected overlay */}
            {!activeSurface && imgLoaded && !hasPaint && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/60 rounded-2xl px-6 py-4 text-center text-white">
                  <Paintbrush className="w-8 h-8 mx-auto mb-2 opacity-70" />
                  <p className="font-semibold">Select a surface above</p>
                  <p className="text-sm text-white/70 mt-1">Then click on the photo to apply paint</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Before / After Slider Mode */
          <div
            ref={sliderContainerRef}
            className="relative overflow-hidden select-none"
            onMouseDown={handleSliderMouseDown}
            onTouchStart={handleSliderMouseDown}
            style={{ cursor: 'ew-resize' }}
          >
            {/* Before (original) */}
            <canvas
              ref={beforeCanvasRef}
              className="w-full block"
              style={{ maxHeight: '60vh' }}
            />
            {/* After (painted) - clipped */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <canvas
                ref={afterCanvasRef}
                className="w-full block"
                style={{ maxHeight: '60vh' }}
              />
            </div>
            {/* Slider line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xl pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center">
                <div className="flex gap-0.5">
                  <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-r-[6px] border-transparent border-r-slate-500" />
                  <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[6px] border-transparent border-l-slate-500" />
                </div>
              </div>
            </div>
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 text-white text-sm font-semibold rounded-lg pointer-events-none">Before</div>
            <div className="absolute top-4 right-4 px-3 py-1 bg-white text-slate-900 text-sm font-semibold rounded-lg pointer-events-none">After</div>
          </div>
        )}

        {/* Photo navigation */}
        {photos.length > 1 && (
          <>
            <button onClick={() => setCurrentPhotoIndex(p => Math.max(p - 1, 0))} disabled={currentPhotoIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg disabled:opacity-30 z-10">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentPhotoIndex(p => Math.min(p + 1, photos.length - 1))} disabled={currentPhotoIndex === photos.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg disabled:opacity-30 z-10">
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Toggle paint / compare */}
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setShowSlider(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              !showSlider ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Paintbrush className="w-4 h-4 inline mr-1.5" />Paint
          </button>
          <button
            onClick={() => setShowSlider(true)}
            disabled={!hasPaint}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 ${
              showSlider ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Before / After
          </button>
        </div>

        {/* Undo last stroke */}
        {activeSurface && currentPaint[activeSurface]?.regions?.length > 0 && (
          <Button variant="outline" size="sm" className="gap-2"
            onClick={() => {
              setPaintData(prev => {
                const photoData = prev[currentPhotoIndex] || {};
                const surfData = photoData[activeSurface] || {};
                const regions = [...(surfData.regions || [])];
                regions.pop();
                return {
                  ...prev,
                  [currentPhotoIndex]: {
                    ...photoData,
                    [activeSurface]: { ...surfData, regions }
                  }
                };
              });
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Undo stroke
          </Button>
        )}

        {/* Change color for active surface */}
        {activeSurface && currentPaint[activeSurface]?.color && (
          <Button variant="outline" size="sm" className="gap-2"
            onClick={() => setShowColorPicker(true)}
          >
            <div className="w-4 h-4 rounded-full border border-slate-300"
              style={{ backgroundColor: currentPaint[activeSurface].color.hex }} />
            Change color
          </Button>
        )}

        <div className="flex-1" />
        <span className="text-xs text-slate-400">{currentPhotoIndex + 1}/{photos.length}</span>
      </div>

      {/* Photo strip */}
      {photos.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {photos.map((photo, idx) => (
            <button key={idx} onClick={() => setCurrentPhotoIndex(idx)}
              className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                idx === currentPhotoIndex ? 'border-[#1e3a5f] ring-2 ring-[#1e3a5f]/20' : 'border-slate-200'
              }`}>
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <Button
        onClick={() => onComplete(paintData)}
        className="w-full h-14 text-lg font-semibold bg-[#1e3a5f] hover:bg-[#2a4d7a] rounded-xl"
      >
        Continue to Quote
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>

      {/* Color Picker */}
      <AnimatePresence>
        {showColorPicker && (
          <ColorPicker
            onSelect={handleColorSelect}
            onClose={() => setShowColorPicker(false)}
            selectedColor={activeSurface ? currentPaint[activeSurface]?.color : null}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}