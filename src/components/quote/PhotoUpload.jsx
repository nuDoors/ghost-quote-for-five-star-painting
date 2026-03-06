import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Camera, Upload, X, Scan, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function PhotoUpload({ onComplete, onBack }) {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [scanMode, setScanMode] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    
    for (const file of files) {
      if (photos.length >= 8) break;
      
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setPhotos(prev => [...prev, { url: file_url, scanMode }]);
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
    
    setUploading(false);
    setScanMode(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const triggerUpload = (isScan = false) => {
    setScanMode(isScan);
    fileInputRef.current?.click();
  };

  const canContinue = photos.length >= 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Upload Project Photos
          </h2>
          <p className="text-slate-600 mt-1">
            Add 3-8 photos of the areas you want painted
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => triggerUpload(false)}
          disabled={uploading || photos.length >= 8}
          className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-slate-300 rounded-2xl hover:border-[#1e3a5f] hover:bg-slate-50 transition-all disabled:opacity-50"
        >
          <div className="w-14 h-14 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center mb-3">
            <Upload className="w-7 h-7 text-[#1e3a5f]" />
          </div>
          <span className="font-semibold text-slate-900">Upload Photos</span>
          <span className="text-sm text-slate-500 mt-1">Select from gallery</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => triggerUpload(true)}
          disabled={uploading || photos.length >= 8}
          className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-slate-300 rounded-2xl hover:border-[#d4a853] hover:bg-amber-50 transition-all disabled:opacity-50"
        >
          <div className="w-14 h-14 bg-[#d4a853]/20 rounded-xl flex items-center justify-center mb-3">
            <Scan className="w-7 h-7 text-[#d4a853]" />
          </div>
          <span className="font-semibold text-slate-900">Scan Room</span>
          <span className="text-sm text-slate-500 mt-1">Take new photos</span>
        </motion.button>
      </div>

      {uploading && (
        <div className="flex items-center justify-center gap-3 p-4 bg-[#1e3a5f]/5 rounded-xl mb-6">
          <div className="w-5 h-5 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#1e3a5f] font-medium">Uploading...</span>
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-600">
            {photos.length} of 8 photos uploaded
          </span>
          {!canContinue && (
            <span className="text-amber-600 font-medium">
              Add at least {3 - photos.length} more
            </span>
          )}
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(photos.length / 8) * 100}%` }}
            className={`h-full ${canContinue ? 'bg-emerald-500' : 'bg-[#d4a853]'}`}
          />
        </div>
      </div>

      <AnimatePresence>
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
          >
            {photos.map((photo, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-xl overflow-hidden group"
              >
                <img
                  src={photo.url}
                  alt={`Project photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {photo.scanMode && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-[#d4a853] text-white text-xs font-medium rounded-lg">
                    Scan
                  </div>
                )}
                <button
                  onClick={() => removePhoto(idx)}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {photos.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 mb-6">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No photos uploaded yet</p>
          <p className="text-sm text-slate-400 mt-1">Upload photos to continue</p>
        </div>
      )}

      <Button
        onClick={() => onComplete(photos)}
        disabled={!canContinue}
        className="w-full h-14 text-lg font-semibold bg-[#1e3a5f] hover:bg-[#2a4d7a] rounded-xl disabled:opacity-50"
      >
        Continue to Visualizer
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </motion.div>
  );
}