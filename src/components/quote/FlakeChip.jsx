import React, { useRef, useEffect } from 'react';

// Draws a realistic multi-color epoxy flake chip on a canvas
export default function FlakeChip({ colors, size = 56, className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Background = darkest color
    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, size, size);

    // Draw many random irregular flake shapes
    const seed = colors.join('').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    let s = seed;
    const rand = () => {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    };

    const numFlakes = Math.floor(size * size / 6);
    for (let i = 0; i < numFlakes; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const colorHex = colors[Math.floor(rand() * colors.length)];
      const w = 2 + rand() * 6;
      const h = 1 + rand() * 4;
      const angle = rand() * Math.PI;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = colorHex;
      ctx.globalAlpha = 0.75 + rand() * 0.25;

      // Irregular polygon (4-6 points)
      const pts = Math.floor(4 + rand() * 3);
      ctx.beginPath();
      for (let p = 0; p < pts; p++) {
        const px = (rand() - 0.5) * w;
        const py = (rand() - 0.5) * h;
        p === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }, [colors, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}