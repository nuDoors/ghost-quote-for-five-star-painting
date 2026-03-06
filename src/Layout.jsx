import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <style>{`
        :root {
          --fsp-navy: #1a3a5c;
          --fsp-orange: #c8540a;
          --fsp-orange-light: #e06820;
          --fsp-gold: #d4a853;
          --fsp-light-bg: #f5f7fa;
        }
        .fsp-btn-orange {
          background-color: var(--fsp-orange);
          color: white;
          transition: background-color 0.2s;
        }
        .fsp-btn-orange:hover {
          background-color: var(--fsp-orange-light);
        }
        .fsp-gradient-bg {
          background: linear-gradient(135deg, #f5f7fa 0%, #eef1f6 100%);
        }
      `}</style>
      {children}
    </div>
  );
}