import React from 'react';
import { motion } from 'framer-motion';
import { Home, Building, Grid3X3, DoorOpen, Fence, Car, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const services = [
  {
    id: 'interior',
    name: 'Interior Painting',
    description: 'Transform your living spaces with expert interior painting',
    icon: Home,
    image: 'https://images.unsplash.com/photo-1562663474-6cbb3eaa4d14?w=400&h=300&fit=crop'
  },
  {
    id: 'exterior',
    name: 'Exterior Painting',
    description: 'Boost curb appeal with durable exterior finishes',
    icon: Building,
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop'
  },
  {
    id: 'cabinet',
    name: 'Cabinet Painting',
    description: 'Refresh your kitchen with professionally painted cabinets',
    icon: Grid3X3,
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a72dd4b7aaafa27f7f2697/6448fcd6d_ChatGPTImageMar5202608_37_44PM.png'
  },
  {
    id: 'trim',
    name: 'Wallpaper',
    description: 'Expert wallpaper installation and removal',
    icon: DoorOpen,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
  },
  {
    id: 'deck',
    name: 'Deck & Fence Staining',
    description: 'Protect and beautify your outdoor wood surfaces',
    icon: Fence,
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a72dd4b7aaafa27f7f2697/92c75c7aa_ChatGPTImageMar5202608_56_46PM.png'
  },
  {
    id: 'garage',
    name: 'Garage Floor Coating',
    description: 'Durable epoxy or polyurea coatings for garage floors',
    icon: Car,
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a72dd4b7aaafa27f7f2697/bd36ac6f3_ChatGPTImageMar5202609_05_44PM.png'
  }
];

export default function ServiceSelection({ onSelect, onBack }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Select Your Service
          </h2>
          <p className="text-slate-600 mt-1">
            What type of painting project do you have in mind?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
        {services.map((service, idx) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onSelect(service.id)}
            className="group cursor-pointer h-full"
          >
            <div className="relative bg-white rounded-2xl overflow-hidden border-2 border-slate-100 hover:border-[#1e3a5f] transition-all duration-300 hover:shadow-xl h-full">
              <div className="h-36 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.name}
                  className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${service.id === 'garage' ? 'object-top' : ''}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
              <div className="absolute top-3 right-3">
                <div className="w-10 h-10 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center shadow-lg">
                  <service.icon className="w-5 h-5 text-[#1e3a5f]" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#1e3a5f] transition-colors">
                  {service.name}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {service.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}