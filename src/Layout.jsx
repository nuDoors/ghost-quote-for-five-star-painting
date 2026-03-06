import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { createPageUrl } from '@/utils';

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
      
      {/* Home Button */}
      <button
        onClick={() => window.location.reload()}
        className="fixed top-4 left-4 z-50 p-3 bg-white rounded-full shadow-lg hover:shadow-xl hover:bg-slate-50 transition-all"
        title="Back to Home"
      >
        <Home className="w-5 h-5 text-[#1e3a5f]" />
      </button>

      {children}
    </div>
  );
}