import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Wand2, Brush, RotateCcw, Trash2, Eye, ChevronLeft, ChevronRight, Plus, Layers, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ColorPicker from './ColorPicker';
import { AnimatePresence as AP } from 'framer-motion';

// Surface types grouped by service
const SURFACE_OPTIONS = {
  exterior: [
    { id: 'siding', name: 'Siding / Body', color: '#3b82f6' },
    { id: 'trim', name: 'Trim', color: '#f59e0b' },
    { id: 'front_door', name: 'Front Door', color: '#10b981' },
    { id: 'shutters', name: 'Shutters', color: '#8b5cf6' },
    { id: 'garage_door', name: 'Garage Door', color: '#f43f5e' },
    { id: 'accent', name: 'Accent', color: '#06b6d4' },
  ],
  interior: [
    { id: 'walls', name: 'Walls', color: '#3b82f6' },
    { id: 'trim', name: 'Trim', color: '#f59e0b' },
    { id: 'ceiling', name: 'Ceiling', color: '#8b5cf6' },
    { id: 'doors', name: 'Doors', color: '#10b981' },
    { id: 'accent_wall', name: 'Accent Wall', color: '#f43f5e' },
  ],
  cabinet: [
    { id: 'cabinet_doors', name: 'Cabinet Doors', color: '#f43f5e' },
    { id: 'cabinet_frames', name: 'Cabinet Frames', color: '#06b6d4' },
    { id: 'walls', name: 'Walls', color: '#3b82f6' },
  ],
  trim: [
    { id: 'trim', name: 'Trim', color: '#f59e0b' },
    { id: 'doors', name: 'Doors', color: '#10b981' },
  ],
  deck: [
    { id: 'deck', name: 'Deck Surface', color: '#a16207' },
    { id: 'rails', name: 'Railings', color: '#78716c' },
  ],
};

function getSurfaces(service) {
  if (service === 'interior') return SURFACE_OPTIONS.interior;
  if (service === 'exterior') return SURFACE_OPTIONS.exterior;
  if (service === 'cabinet') return SURFACE_OPTIONS.cabinet;
  if (service === 'trim') return SURFACE_OPTIONS.trim;
  if (service === 'deck') return SURFACE_OPTIONS.deck;
  return SURFACE_OPTIONS.interior;
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

// Flood fill returning a Uint8ClampedArray mask (1 per pixel)
function floodFillMask(imageData, startX, startY, tolerance = 35) {
  const { width, height, data } = imageData;
  const mask = new Uint8ClampedArray(width * height); // 0 or 255

  const idx = (x, y) => (y * width + x) * 4;
  const start = idx(startX, startY);
  const sr = data[start], sg = data[start+1], sb = data[start+2];

  const colorDiff = (x, y) => {
    const i = idx(x, y);
    return Math.abs(data[i]-sr) + Math.abs(data[i+1]-sg) + Math.abs(data[i+2]-sb);
  };

  const visited = new Uint8ClampedArray(width * height);
  const queue = [[startX, startY]];
  visited[startY * width + startX] = 1;

  while (queue.length) {
    const [x, y] = queue.pop();
    if (colorDiff(x, y) <= tolerance * 3) {
      mask[y * width + x] = 255;
      const neighbors = [[x+1,y],[x-1,y],[x,y+1],[x,y-1]];
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height && !visited[ny * width + nx]) {
          visited[ny * width + nx] = 1;
          queue.push([nx, ny]);
        }
      }
    }
  }
  return mask;
}

// Apply brush stroke to a mask
function applyBrush(mask, width, height, x, y, radius, add = true) {
  const newMask = new Uint8ClampedArray(mask);
  const r2 = radius * radius;
  const x0 = Math.max(0, x - radius);
  const x1 = Math.min(width - 1, x + radius);
  const y0 = Math.max(0, y - radius);
  const y1 = Math.min(height - 1, y + radius);
  for (let py = y0; py <= y1; py++) {
    for (let px = x0; px <= x1; px++) {
      if ((px-x)*(px-x) + (py-y)*(py-y) <= r2) {
        newMask[py * width + px] = add ? 255 : 0;
      }
    }
  }
  return newMask;
}

// Merge two masks with OR
function mergeMasks(a, b) {
  const out = new Uint8ClampedArray(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] | b[i];
  return out;
}

// Render composite: base image + per-surface color overlays
function renderComposite(baseImageData, surfaceMap, surfaces) {
  const { width, height } = baseImageData;
  const out = new ImageData(new Uint8ClampedArray(baseImageData.data), width, height);

  surfaces.forEach(surf => {
    const entry = surfaceMap[surf.id];
    if (!entry?.color || !entry?.mask) return;
    const [r, g, b] = hexToRgb(entry.color.hex);
    const sheenAlpha = { flat: 0.52, eggshell: 0.44, satin: 0.38, 'semi-gloss': 0.32 }[entry.color.sheen] || 0.44;
    const mask = entry.mask;

    for (let i = 0; i < width * height; i++) {
      if (!mask[i]) continue;
      const p = i * 4;
      const br = out.data[p], bg = out.data[p+1], bb = out.data[p+2];
      // Luminosity-preserving blend: multiply base luminance with target color
      const lum = (0.299 * br + 0.587 * bg + 0.114 * bb) / 255;
      const blendR = r * lum;
      const blendG = g * lum;
      const blendB = b * lum;
      out.data[p]   = Math.round(br * (1 - sheenAlpha) + blendR * sheenAlpha);
      out.data[p+1] = Math.round(bg * (1 - sheenAlpha) + blendG * sheenAlpha);
      out.data[p+2] = Math.round(bb * (1 - sheenAlpha) + blendB * sheenAlpha);
    }
  });
  return out;
}

// Overlay the active selection mask with marching-ants-style dashed highlight
function drawMaskOverlay(ctx, mask, width, height, color = 'rgba(255,255,0,0.35)') {
  if (!mask) return;
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width; tempCanvas.height = height;
  const tCtx = tempCanvas.getContext('2d');
  const imgData = tCtx.createImageData(width, height);
  const [r,g,b] = [255, 220, 0];
  for (let i = 0; i < mask.length; i++) {
    if (mask[i]) {
      imgData.data[i*4] = r;
      imgData.data[i*4+1] = g;
      imgData.data[i*4+2] = b;
      imgData.data[i*4+3] = 120;
    }
  }
  tCtx.putImageData(imgData, 0, 0);
  ctx.drawImage(tempCanvas, 0, 0);
}

export default function Visualizer({ photos, service, onComplete, onBack }) {
  const surfaces = getSurfaces(service);

  const [photoIdx, setPhotoIdx] = useState(0);
  // perPhoto: { [photoIdx]: { surfaceMap: { [surfId]: { mask, color } }, history: [...] } }
  const [perPhoto, setPerPhoto] = useState({});

  const [tool, setTool] = useState('magic'); // 'magic' | 'brush_add' | 'brush_sub'
  const [brushSize, setBrushSize] = useState(20);
  const [activeSurface, setActiveSurface] = useState(surfaces[0]?.id || null);
  const [pendingMask, setPendingMask] = useState(null); // mask being built before assigning to surface
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerTarget, setColorPickerTarget] = useState(null); // surfaceId
  const [showSlider, setShowSlider] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [sliderDragging, setSliderDragging] = useState(false);
  const [imageData, setImageData] = useState(null); // original ImageData for current photo
  const [showLabelPrompt, setShowLabelPrompt] = useState(false);
  const [pendingLabelMask, setPendingLabelMask] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(surfaces[0]?.id || null);

  const canvasRef = useRef(null);
  const sliderCanvasRef = useRef(null);
  const sliderAfterRef = useRef(null);
  const hiddenImgRef = useRef(null);
  const sliderContainerRef = useRef(null);
  const isBrushing = useRef(false);

  const photo = photos[photoIdx];
  const photoState = perPhoto[photoIdx] || { surfaceMap: {}, history: [] };
  const surfaceMap = photoState.surfaceMap;

  // Load image into imageData when photo changes
  useEffect(() => {
    setImageData(null);
    setPendingMask(null);
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = img.naturalWidth;
      tmpCanvas.height = img.naturalHeight;
      const ctx = tmpCanvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      setImageData(ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight));
    };
    img.src = photo.url;
  }, [photo.url]);

  // Re-render canvas whenever imageData, surfaceMap, or pendingMask changes
  useEffect(() => {
    if (!imageData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');

    // Render composite (base + all surface colors)
    const composite = renderComposite(imageData, surfaceMap, surfaces);
    ctx.putImageData(composite, 0, 0);

    // Draw pending selection mask overlay
    if (pendingMask) {
      drawMaskOverlay(ctx, pendingMask, imageData.width, imageData.height);
    }
  }, [imageData, surfaceMap, pendingMask, surfaces]);

  // Also draw slider canvases
  useEffect(() => {
    if (!imageData || !sliderCanvasRef.current || !sliderAfterRef.current) return;
    const bCtx = sliderCanvasRef.current.getContext('2d');
    sliderCanvasRef.current.width = imageData.width;
    sliderCanvasRef.current.height = imageData.height;
    bCtx.putImageData(imageData, 0, 0);

    const aCtx = sliderAfterRef.current.getContext('2d');
    sliderAfterRef.current.width = imageData.width;
    sliderAfterRef.current.height = imageData.height;
    aCtx.putImageData(renderComposite(imageData, surfaceMap, surfaces), 0, 0);
  }, [imageData, surfaceMap, surfaces, showSlider]);

  const updatePhotoState = useCallback((updater) => {
    setPerPhoto(prev => {
      const cur = prev[photoIdx] || { surfaceMap: {}, history: [] };
      const next = updater(cur);
      return { ...prev, [photoIdx]: next };
    });
  }, [photoIdx]);

  const canvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = imageData.width / rect.width;
    const scaleY = imageData.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return [Math.round((clientX - rect.left) * scaleX), Math.round((clientY - rect.top) * scaleY)];
  };

  const handleCanvasClick = (e) => {
    if (!imageData) return;
    const [x, y] = canvasCoords(e);

    if (tool === 'magic') {
      const newMask = floodFillMask(imageData, x, y, 35);
      const merged = pendingMask ? mergeMasks(pendingMask, newMask) : newMask;
      setPendingMask(merged);
      // Show label prompt after magic select
      setPendingLabelMask(merged);
      setShowLabelPrompt(true);
    }
  };

  const handleCanvasMouseDown = (e) => {
    if (tool === 'brush_add' || tool === 'brush_sub') {
      isBrushing.current = true;
      applyBrushStroke(e);
    }
  };
  const handleCanvasMouseMove = (e) => {
    if (isBrushing.current && (tool === 'brush_add' || tool === 'brush_sub')) {
      applyBrushStroke(e);
    }
  };
  const handleCanvasMouseUp = () => { isBrushing.current = false; };

  const applyBrushStroke = (e) => {
    if (!imageData) return;
    const [x, y] = canvasCoords(e);
    const add = tool === 'brush_add';
    const base = pendingMask || new Uint8ClampedArray(imageData.width * imageData.height);
    const updated = applyBrush(base, imageData.width, imageData.height, x, y, brushSize, add);
    setPendingMask(updated);
  };

  const handleLabelConfirm = () => {
    if (!pendingLabelMask || !selectedLabel) return;
    updatePhotoState(cur => {
      const existing = cur.surfaceMap[selectedLabel]?.mask;
      const merged = existing ? mergeMasks(existing, pendingLabelMask) : pendingLabelMask;
      const newSurfaceMap = {
        ...cur.surfaceMap,
        [selectedLabel]: {
          ...(cur.surfaceMap[selectedLabel] || {}),
          mask: merged,
        }
      };
      return {
        surfaceMap: newSurfaceMap,
        history: [...cur.history, cur.surfaceMap]
      };
    });
    setPendingMask(null);
    setPendingLabelMask(null);
    setShowLabelPrompt(false);
    setActiveSurface(selectedLabel);
    // Open color picker for this surface
    setColorPickerTarget(selectedLabel);
    setShowColorPicker(true);
  };

  const handleUndo = () => {
    updatePhotoState(cur => {
      if (!cur.history.length) return cur;
      const prev = cur.history[cur.history.length - 1];
      return { surfaceMap: prev, history: cur.history.slice(0, -1) };
    });
    setPendingMask(null);
  };

  const handleReset = () => {
    setPerPhoto(prev => ({ ...prev, [photoIdx]: { surfaceMap: {}, history: [] } }));
    setPendingMask(null);
    setPendingLabelMask(null);
    setShowLabelPrompt(false);
  };

  const handleColorSelect = (color) => {
    const target = colorPickerTarget;
    setShowColorPicker(false);
    setColorPickerTarget(null);
    if (!target) return;
    updatePhotoState(cur => ({
      ...cur,
      surfaceMap: {
        ...cur.surfaceMap,
        [target]: {
          ...(cur.surfaceMap[target] || {}),
          color,
        }
      }
    }));
  };

  // Slider drag
  const handleSliderDown = (e) => {
    setSliderDragging(true);
    e.preventDefault();
  };
  useEffect(() => {
    if (!sliderDragging) return;
    const move = (e) => {
      if (!sliderContainerRef.current) return;
      const rect = sliderContainerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setSliderPos(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
    };
    const up = () => setSliderDragging(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [sliderDragging]);

  const paintedSurfaces = surfaces.filter(s => surfaceMap[s.id]?.color && surfaceMap[s.id]?.mask);
  const hasMask = surfaces.some(s => surfaceMap[s.id]?.mask);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900">Paint Visualizer</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {tool === 'magic' ? '🪄 Click on any area to select it, then assign a color' : '🖌️ Brush to add/remove from selection'}
          </p>
        </div>
        {hasMask && (
          <Button variant="outline" className="gap-2 ml-2" onClick={() => { setShowSlider(s => !s); }}>
            <Eye className="w-4 h-4" />
            {showSlider ? 'Paint Mode' : 'Before / After'}
          </Button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {/* Tool selector */}
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          <button onClick={() => setTool('magic')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${tool === 'magic' ? 'bg-white shadow text-[#1e3a5f]' : 'text-slate-500 hover:text-slate-700'}`}>
            <Wand2 className="w-4 h-4" /> Magic Select
          </button>
          <button onClick={() => setTool('brush_add')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${tool === 'brush_add' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>
            <Brush className="w-4 h-4" /> Add
          </button>
          <button onClick={() => setTool('brush_sub')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${tool === 'brush_sub' ? 'bg-white shadow text-red-500' : 'text-slate-500 hover:text-slate-700'}`}>
            <Brush className="w-4 h-4" /> Subtract
          </button>
        </div>

        {/* Brush size (only for brush tools) */}
        {(tool === 'brush_add' || tool === 'brush_sub') && (
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
            <span className="text-xs text-slate-600">Size</span>
            <input type="range" min={5} max={60} value={brushSize} onChange={e => setBrushSize(+e.target.value)} className="w-20" />
            <span className="text-xs font-medium w-6">{brushSize}</span>
          </div>
        )}

        <div className="flex-1" />

        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleUndo} disabled={!photoState.history?.length}>
          <RotateCcw className="w-4 h-4" /> Undo
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50" onClick={handleReset} disabled={!hasMask && !pendingMask}>
          <Trash2 className="w-4 h-4" /> Reset
        </Button>
      </div>

      {/* Main canvas area */}
      <div className="relative bg-slate-900 rounded-2xl overflow-hidden mb-4">
        {!showSlider ? (
          /* Paint / select mode */
          <canvas
            ref={canvasRef}
            className="w-full block"
            style={{ maxHeight: '58vh', objectFit: 'contain', cursor: tool === 'magic' ? 'crosshair' : tool === 'brush_add' ? 'cell' : 'no-drop' }}
            onClick={tool === 'magic' ? handleCanvasClick : undefined}
            onMouseDown={tool !== 'magic' ? handleCanvasMouseDown : undefined}
            onMouseMove={tool !== 'magic' ? handleCanvasMouseMove : undefined}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          />
        ) : (
          /* Before/After slider */
          <div
            ref={sliderContainerRef}
            className="relative overflow-hidden select-none"
            style={{ cursor: 'ew-resize' }}
            onMouseDown={handleSliderDown}
            onTouchStart={handleSliderDown}
          >
            <canvas ref={sliderCanvasRef} className="w-full block" style={{ maxHeight: '58vh' }} />
            <div className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
              <canvas ref={sliderAfterRef} className="w-full block" style={{ maxHeight: '58vh' }} />
            </div>
            {/* Slider handle */}
            <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: `${sliderPos}%` }}>
              <div className="absolute inset-y-0 left-0 w-0.5 bg-white shadow-xl" />
              <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center">
                <div className="flex gap-0.5">
                  <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-r-[7px] border-transparent border-r-slate-500" />
                  <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[7px] border-transparent border-l-slate-500" />
                </div>
              </div>
            </div>
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 text-white text-sm font-semibold rounded-lg pointer-events-none">Before</div>
            <div className="absolute top-4 right-4 px-3 py-1 bg-white text-slate-900 text-sm font-semibold rounded-lg pointer-events-none">After</div>
          </div>
        )}

        {/* No image yet */}
        {!imageData && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Photo nav */}
        {photos.length > 1 && (
          <>
            <button onClick={() => setPhotoIdx(p => Math.max(0, p-1))} disabled={photoIdx === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPhotoIdx(p => Math.min(photos.length-1, p+1))} disabled={photoIdx === photos.length-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Photo strip */}
      {photos.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {photos.map((p, i) => (
            <button key={i} onClick={() => setPhotoIdx(i)}
              className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === photoIdx ? 'border-[#1e3a5f] ring-2 ring-[#1e3a5f]/20' : 'border-slate-200'}`}>
              <img src={p.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Surface legend / color assignment */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-[#1e3a5f]" />
          <h3 className="font-semibold text-slate-900">Surfaces & Colors</h3>
          {paintedSurfaces.length > 0 && (
            <span className="ml-auto text-xs text-emerald-600 font-medium">{paintedSurfaces.length} surface{paintedSurfaces.length > 1 ? 's' : ''} painted</span>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {surfaces.map(surf => {
            const data = surfaceMap[surf.id];
            const hasMaskForSurf = !!data?.mask;
            return (
              <div key={surf.id}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${activeSurface === surf.id ? 'border-[#1e3a5f] bg-[#1e3a5f]/5' : 'border-slate-100 bg-slate-50'}`}>
                {/* Color swatch / pick button */}
                <button
                  onClick={() => { setColorPickerTarget(surf.id); setActiveSurface(surf.id); setShowColorPicker(true); }}
                  className="w-9 h-9 rounded-lg flex-shrink-0 border-2 border-white shadow-sm hover:scale-110 transition-transform flex items-center justify-center"
                  style={{ backgroundColor: data?.color?.hex || surf.color }}
                  title="Pick color"
                >
                  {!data?.color && <Plus className="w-3 h-3 text-white" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">{surf.name}</p>
                  {data?.color ? (
                    <p className="text-xs text-slate-500 truncate">{data.color.name} · {data.color.sheen}</p>
                  ) : (
                    <p className="text-xs text-slate-400">{hasMaskForSurf ? 'No color yet' : 'Not selected'}</p>
                  )}
                </div>
                {hasMaskForSurf && (
                  <button
                    onClick={() => { setColorPickerTarget(surf.id); setShowColorPicker(true); }}
                    className="text-xs text-[#1e3a5f] hover:underline flex-shrink-0"
                  >Edit</button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Button onClick={() => onComplete(perPhoto)} className="w-full h-14 text-lg font-semibold bg-[#1e3a5f] hover:bg-[#2a4d7a] rounded-xl">
        Continue to Quote
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>

      {/* Surface label prompt (after magic select) */}
      <AnimatePresence>
        {showLabelPrompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="text-lg font-bold text-slate-900 mb-1">What did you select?</h3>
              <p className="text-sm text-slate-500 mb-4">Label this region so we can assign it a color.</p>
              <Select value={selectedLabel} onValueChange={setSelectedLabel}>
                <SelectTrigger className="h-12 rounded-xl mb-4">
                  <SelectValue placeholder="Select surface type..." />
                </SelectTrigger>
                <SelectContent>
                  {surfaces.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => { setShowLabelPrompt(false); setPendingMask(null); setPendingLabelMask(null); }}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-[#1e3a5f] hover:bg-[#2a4d7a]" onClick={handleLabelConfirm} disabled={!selectedLabel}>
                  <Check className="w-4 h-4 mr-1" /> Confirm & Pick Color
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color Picker */}
      <AnimatePresence>
        {showColorPicker && (
          <ColorPicker
            onSelect={handleColorSelect}
            onClose={() => { setShowColorPicker(false); setColorPickerTarget(null); }}
            selectedColor={colorPickerTarget ? surfaceMap[colorPickerTarget]?.color : null}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}