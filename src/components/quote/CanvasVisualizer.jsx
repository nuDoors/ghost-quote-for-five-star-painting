import React, { useEffect, useRef, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Uses the LLM to segment an image into surface zones (as approximate polygon data),
 * then draws those zones onto a canvas with the selected color overlays.
 */
export default function CanvasVisualizer({ photo, surfaceColors, activeSurface, onSurfaceClick, relevantSurfaces }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [segments, setSegments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 1, h: 1 });
  const [canvasSize, setCanvasSize] = useState({ w: 1, h: 1 });

  // Load and segment the image using LLM vision
  useEffect(() => {
    if (!photo?.url) return;
    setSegments(null);
    setLoading(true);

    const surfaceList = relevantSurfaces.map(s => s.id).join(', ');

    base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this interior/exterior painting photo and identify the approximate pixel regions for each paintable surface.

Return a JSON object with surface segmentation. For each surface type that is visible, provide polygon points as percentages (0-100) of the image width and height.

Surface types to identify: ${surfaceList}

Instructions:
- "walls" = all flat wall surfaces (not ceiling, not trim)
- "ceiling" = the ceiling surface if visible
- "trim" = baseboards, window frames, door frames, crown molding
- "doors" = door panels themselves
- "cabinet_doors" = kitchen cabinet doors
- "cabinet_frames" = cabinet face frames
- Only include surfaces that are actually visible in the photo
- Each polygon should be a rough but reasonable approximation
- Provide multiple polygons per surface if needed (e.g. multiple walls)

Return ONLY valid JSON like:
{
  "walls": [
    { "points": [[x1,y1],[x2,y2],[x3,y3],[x4,y4]] },
    { "points": [[x1,y1],[x2,y2],[x3,y3],[x4,y4]] }
  ],
  "ceiling": [
    { "points": [[x1,y1],[x2,y2],[x3,y3],[x4,y4]] }
  ],
  "trim": [
    { "points": [[x1,y1],[x2,y2],[x3,y3],[x4,y4]] }
  ]
}

All coordinates are percentages 0-100.`,
      file_urls: [photo.url],
      response_json_schema: {
        type: 'object',
        properties: {
          walls: { type: 'array', items: { type: 'object', properties: { points: { type: 'array', items: { type: 'array', items: { type: 'number' } } } } } },
          ceiling: { type: 'array', items: { type: 'object', properties: { points: { type: 'array', items: { type: 'array', items: { type: 'number' } } } } } },
          trim: { type: 'array', items: { type: 'object', properties: { points: { type: 'array', items: { type: 'array', items: { type: 'number' } } } } } },
          doors: { type: 'array', items: { type: 'object', properties: { points: { type: 'array', items: { type: 'array', items: { type: 'number' } } } } } },
          cabinet_doors: { type: 'array', items: { type: 'object', properties: { points: { type: 'array', items: { type: 'array', items: { type: 'number' } } } } } },
          cabinet_frames: { type: 'array', items: { type: 'object', properties: { points: { type: 'array', items: { type: 'array', items: { type: 'number' } } } } } },
        }
      }
    }).then(result => {
      setSegments(result);
    }).catch(err => {
      console.error('Segmentation failed', err);
      setSegments({});
    }).finally(() => {
      setLoading(false);
    });
  }, [photo?.url]);

  // Draw onto canvas when segments or colors change
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.complete || canvasSize.w <= 1) return;

    const ctx = canvas.getContext('2d');
    const { w, h } = canvasSize;

    canvas.width = w;
    canvas.height = h;

    // Draw base image
    ctx.drawImage(img, 0, 0, w, h);

    if (!segments) return;

    // Draw each surface that has a color selected
    relevantSurfaces.forEach(surface => {
      const color = surfaceColors[surface.id];
      const zones = segments[surface.id];
      if (!color || !zones || zones.length === 0) return;

      // Parse hex color to rgba
      const hex = color.hex.replace('#', '');
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);

      // Sheen affects opacity/blend feel
      const sheenOpacity = {
        flat: 0.52,
        eggshell: 0.48,
        satin: 0.44,
        'semi-gloss': 0.40
      }[color.sheen] || 0.48;

      zones.forEach(zone => {
        if (!zone.points || zone.points.length < 3) return;

        // Convert percentage points to pixel coords
        const pts = zone.points.map(([px, py]) => [
          (px / 100) * w,
          (py / 100) * h
        ]);

        ctx.save();

        // Clip to polygon
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i][0], pts[i][1]);
        }
        ctx.closePath();
        ctx.clip();

        // Draw color overlay with multiply blend
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = sheenOpacity;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(0, 0, w, h);

        // Add a subtle second pass for richness
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = sheenOpacity * 0.25;
        ctx.fillStyle = `rgba(${r},${g},${b},1)`;
        ctx.fillRect(0, 0, w, h);

        ctx.restore();
      });
    });

    // Highlight active surface polygons with a glowing border
    if (activeSurface && segments[activeSurface]) {
      segments[activeSurface].forEach(zone => {
        if (!zone.points || zone.points.length < 3) return;
        const pts = zone.points.map(([px, py]) => [
          (px / 100) * w,
          (py / 100) * h
        ]);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i][0], pts[i][1]);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.stroke();
        ctx.restore();
      });
    }
  }, [segments, surfaceColors, activeSurface, canvasSize, relevantSurfaces]);

  const handleImageLoad = (e) => {
    const img = e.target;
    setImgNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    const container = canvasRef.current?.parentElement;
    if (container) {
      const cw = container.clientWidth;
      const ch = Math.round(cw * (img.naturalHeight / img.naturalWidth));
      setCanvasSize({ w: cw, h: ch });
    }
  };

  // Handle canvas click to identify which surface was clicked
  const handleCanvasClick = (e) => {
    if (!segments) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Check which surface the click falls inside
    for (const surface of relevantSurfaces) {
      const zones = segments[surface.id];
      if (!zones) continue;
      for (const zone of zones) {
        if (pointInPolygon([x, y], zone.points)) {
          onSurfaceClick(surface.id);
          return;
        }
      }
    }
    // If no surface matched, still let user pick
  };

  return (
    <div className="relative w-full">
      {/* Hidden img for canvas drawing */}
      <img
        ref={imgRef}
        src={photo?.url}
        alt=""
        crossOrigin="anonymous"
        onLoad={handleImageLoad}
        className="hidden"
      />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{ width: '100%', height: canvasSize.h > 1 ? canvasSize.h : 'auto', cursor: 'crosshair', borderRadius: '1rem' }}
        className="block bg-slate-100"
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/50 rounded-2xl flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin" 
               style={{ borderWidth: 3 }} />
          <p className="text-white font-medium text-sm">Analyzing surfaces with AI...</p>
          <p className="text-white/70 text-xs">Identifying walls, trim, ceiling & doors</p>
        </div>
      )}
    </div>
  );
}

// Ray-casting algorithm for point-in-polygon
function pointInPolygon(point, polygon) {
  if (!polygon || polygon.length < 3) return false;
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}