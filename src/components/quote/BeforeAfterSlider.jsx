import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function BeforeAfterSlider({ beforeImage, afterImage, className = '' }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl cursor-ew-resize select-none ${className}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* Before Image (Full width background) */}
      <img
        src={beforeImage}
        alt="Before"
        className="w-full h-full object-cover"
        draggable={false}
      />

      {/* After Image (Clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={afterImage}
          alt="After"
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Slider Line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        {/* Slider Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="flex items-center gap-0.5">
            <div className="w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-slate-400" />
            <div className="w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-slate-400" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 text-white text-sm font-medium rounded-lg">
        Before
      </div>
      <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 text-slate-900 text-sm font-medium rounded-lg">
        After
      </div>
    </div>
  );
}