import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { paintColors, sheenOptions, stainColors, stainFinishOptions, garageFlakeColors } from './MockData';
import FlakeChip from './FlakeChip';

export default function ColorPicker({ onSelect, onClose, selectedColor, surfaceId }) {
  const isStain = surfaceId === 'deck';
  const isGarage = surfaceId === 'garage_floor';
  const [brand, setBrand] = useState('Sherwin-Williams');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [selectedSheen, setSelectedSheen] = useState(isStain ? 'semi-transparent' : 'eggshell');
  const [tempColor, setTempColor] = useState(selectedColor);

  const filteredColors = isGarage
    ? garageFlakeColors.filter(color =>
        color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        color.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : isStain
    ? stainColors.filter(color =>
        color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        color.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : paintColors[brand].filter(color =>
        color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        color.code.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const toggleFavorite = (color) => {
    setFavorites(prev => 
      prev.some(f => f.code === color.code)
        ? prev.filter(f => f.code !== color.code)
        : [...prev, color]
    );
  };

  const handleConfirm = () => {
    if (tempColor) {
      onSelect({ ...tempColor, sheen: selectedSheen });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-2xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold text-slate-900">{isGarage ? 'Select Flake Color' : isStain ? 'Select Stain Color' : 'Select Color'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
        </div>

        {isGarage ? (
          <div className="flex-1 overflow-auto p-4">
            <p className="text-xs text-slate-500 mb-4">Decorative flake blends — choose the coating color for your garage floor.</p>
            <div className="space-y-3">
              {filteredColors.map(color => (
                <button
                  key={color.code}
                  onClick={() => setTempColor(color)}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl border-2 transition-all text-left ${
                    tempColor?.code === color.code
                      ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 ring-1 ring-[#1e3a5f]/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className="w-14 h-10 rounded-lg flex-shrink-0 border border-black/10"
                    style={{ background: `linear-gradient(135deg, ${color.hex}cc, ${color.hex})` }}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{color.name}</p>
                    <p className="text-xs text-slate-500">{color.description}</p>
                  </div>
                  {tempColor?.code === color.code && (
                    <Check className="w-5 h-5 text-[#1e3a5f] flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : isStain ? (
          <div className="flex-1 overflow-auto p-4">
            <p className="text-xs text-slate-500 mb-4">Wood stain colors — select a tone that complements your deck or fence.</p>
            <div className="space-y-3">
              {filteredColors.map(color => (
                <button
                  key={color.code}
                  onClick={() => setTempColor(color)}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl border-2 transition-all text-left ${
                    tempColor?.code === color.code
                      ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 ring-1 ring-[#1e3a5f]/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className="w-14 h-10 rounded-lg flex-shrink-0 border border-black/10"
                    style={{ background: `linear-gradient(135deg, ${color.hex}dd, ${color.hex})` }}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{color.name}</p>
                    <p className="text-xs text-slate-500">{color.description}</p>
                  </div>
                  {tempColor?.code === color.code && (
                    <Check className="w-5 h-5 text-[#1e3a5f] flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <Tabs value={brand} onValueChange={setBrand} className="flex-1 flex flex-col min-h-0">
            <TabsList className="w-full justify-start px-4 pt-2 bg-transparent gap-2">
              {Object.keys(paintColors).map(b => (
                <TabsTrigger
                  key={b}
                  value={b}
                  className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white rounded-lg px-3 py-1.5 text-sm"
                >
                  {b}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.keys(paintColors).map(b => (
              <TabsContent key={b} value={b} className="flex-1 overflow-auto p-4 mt-0">
                {favorites.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" /> Favorites
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {favorites.map(color => (
                        <button
                          key={color.code}
                          onClick={() => setTempColor(color)}
                          className={`w-10 h-10 rounded-lg border-2 ${
                            tempColor?.code === color.code ? 'border-[#1e3a5f] ring-2 ring-[#1e3a5f]/20' : 'border-slate-200'
                          }`}
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-3">
                  {filteredColors.map(color => (
                    <button
                      key={color.code}
                      onClick={() => setTempColor(color)}
                      className={`relative group aspect-square rounded-xl border-2 transition-all ${
                        tempColor?.code === color.code 
                          ? 'border-[#1e3a5f] ring-2 ring-[#1e3a5f]/20 scale-105' 
                          : 'border-slate-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(color);
                        }}
                        className="absolute top-1 right-1 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Heart className={`w-3 h-3 ${
                          favorites.some(f => f.code === color.code) 
                            ? 'text-red-500 fill-red-500' 
                            : 'text-slate-400'
                        }`} />
                      </button>
                      {tempColor?.code === color.code && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white drop-shadow-lg" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}

        {tempColor && (
          <div className="p-4 border-t bg-slate-50">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-xl border-2 border-slate-200"
                style={{ backgroundColor: tempColor.hex }}
              />
              <div>
                <p className="font-semibold text-slate-900">{tempColor.name}</p>
                <p className="text-sm text-slate-500">{tempColor.code}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-slate-700 mb-2">{isStain ? 'Finish' : 'Sheen'}</p>
              <div className="flex gap-2">
                {(isStain ? stainFinishOptions : sheenOptions).map(sheen => (
                  <button
                    key={sheen.id}
                    onClick={() => setSelectedSheen(sheen.id)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      selectedSheen === sheen.id
                        ? 'bg-[#1e3a5f] text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {sheen.name}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleConfirm}
              className="w-full h-12 bg-[#1e3a5f] hover:bg-[#2a4d7a] rounded-xl font-semibold"
            >
              Apply Color
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}