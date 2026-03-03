import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Home, Building, Grid3X3, DoorOpen, Fence } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const serviceConfig = {
  interior: {
    icon: Home,
    title: 'Interior Painting Details',
    description: 'Tell us about the rooms you want painted'
  },
  exterior: {
    icon: Building,
    title: 'Exterior Painting Details',
    description: 'Describe your home\'s exterior'
  },
  cabinet: {
    icon: Grid3X3,
    title: 'Cabinet Painting Details',
    description: 'Tell us about your kitchen cabinets'
  },
  trim: {
    icon: DoorOpen,
    title: 'Trim & Doors Details',
    description: 'Estimate your trim work'
  },
  deck: {
    icon: Fence,
    title: 'Deck & Fence Details',
    description: 'Describe your outdoor surfaces'
  }
};

export default function ProjectDetails({ service, onComplete, onBack }) {
  const [details, setDetails] = useState({});
  const config = serviceConfig[service];
  const Icon = config.icon;

  const updateDetail = (key, value) => {
    setDetails(prev => ({ ...prev, [key]: value }));
  };

  const renderInteriorForm = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium text-slate-900">Number of Rooms</Label>
        <div className="flex items-center gap-4 mt-3">
          <Slider
            value={[details.rooms || 1]}
            onValueChange={([v]) => updateDetail('rooms', v)}
            min={1}
            max={10}
            step={1}
            className="flex-1"
          />
          <span className="text-2xl font-bold text-[#1e3a5f] w-12 text-center">
            {details.rooms || 1}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div>
            <Label className="text-base font-medium text-slate-900">Ceilings</Label>
            <p className="text-sm text-slate-500">Paint the ceilings too?</p>
          </div>
          <Switch
            checked={details.ceilings || false}
            onCheckedChange={(v) => updateDetail('ceilings', v)}
          />
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div>
            <Label className="text-base font-medium text-slate-900">Trim</Label>
            <p className="text-sm text-slate-500">Include baseboards & trim?</p>
          </div>
          <Switch
            checked={details.trim || false}
            onCheckedChange={(v) => updateDetail('trim', v)}
          />
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl md:col-span-2">
          <div>
            <Label className="text-base font-medium text-slate-900">Stairs</Label>
            <p className="text-sm text-slate-500">Include stairway painting?</p>
          </div>
          <Switch
            checked={details.stairs || false}
            onCheckedChange={(v) => updateDetail('stairs', v)}
          />
        </div>
      </div>

      <div>
        <Label className="text-base font-medium text-slate-900 block mb-3">Paint Tier</Label>
        <RadioGroup
          value={details.paintTier || 'good'}
          onValueChange={(v) => updateDetail('paintTier', v)}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { value: 'good', label: 'Good', desc: 'Standard quality' },
            { value: 'better', label: 'Better', desc: 'Premium durability' },
            { value: 'best', label: 'Best', desc: 'Top-tier finish' }
          ].map((tier) => (
            <div key={tier.value}>
              <RadioGroupItem value={tier.value} id={tier.value} className="peer sr-only" />
              <Label
                htmlFor={tier.value}
                className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border-2 border-slate-200 cursor-pointer hover:bg-slate-100 peer-data-[state=checked]:border-[#1e3a5f] peer-data-[state=checked]:bg-[#1e3a5f]/5 transition-all"
              >
                <span className="font-semibold text-slate-900">{tier.label}</span>
                <span className="text-xs text-slate-500 mt-1">{tier.desc}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );

  const renderExteriorForm = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium text-slate-900 block mb-3">Number of Stories</Label>
        <RadioGroup
          value={String(details.stories || 1)}
          onValueChange={(v) => updateDetail('stories', parseInt(v))}
          className="grid grid-cols-3 gap-3"
        >
          {[1, 2, 3].map((num) => (
            <div key={num}>
              <RadioGroupItem value={String(num)} id={`story-${num}`} className="peer sr-only" />
              <Label
                htmlFor={`story-${num}`}
                className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border-2 border-slate-200 cursor-pointer hover:bg-slate-100 peer-data-[state=checked]:border-[#1e3a5f] peer-data-[state=checked]:bg-[#1e3a5f]/5 transition-all"
              >
                <span className="text-2xl font-bold text-[#1e3a5f]">{num}</span>
                <span className="text-sm text-slate-500">Stor{num === 1 ? 'y' : 'ies'}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-medium text-slate-900 block mb-3">Siding Type</Label>
        <RadioGroup
          value={details.sidingType || 'vinyl'}
          onValueChange={(v) => updateDetail('sidingType', v)}
          className="grid grid-cols-2 gap-3"
        >
          {[
            { value: 'wood', label: 'Wood' },
            { value: 'vinyl', label: 'Vinyl' },
            { value: 'stucco', label: 'Stucco' },
            { value: 'fiber-cement', label: 'Fiber Cement' }
          ].map((type) => (
            <div key={type.value}>
              <RadioGroupItem value={type.value} id={type.value} className="peer sr-only" />
              <Label
                htmlFor={type.value}
                className="flex items-center justify-center p-4 bg-slate-50 rounded-xl border-2 border-slate-200 cursor-pointer hover:bg-slate-100 peer-data-[state=checked]:border-[#1e3a5f] peer-data-[state=checked]:bg-[#1e3a5f]/5 transition-all"
              >
                <span className="font-medium text-slate-900">{type.label}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <Label className="text-base font-medium text-slate-900">Include Trim</Label>
          <Switch
            checked={details.trim || false}
            onCheckedChange={(v) => updateDetail('trim', v)}
          />
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <Label className="text-base font-medium text-slate-900">Include Doors</Label>
          <Switch
            checked={details.doors || false}
            onCheckedChange={(v) => updateDetail('doors', v)}
          />
        </div>
      </div>

      <div>
        <Label className="text-base font-medium text-slate-900 block mb-3">Current Condition</Label>
        <RadioGroup
          value={details.condition || 'good'}
          onValueChange={(v) => updateDetail('condition', v)}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { value: 'excellent', label: 'Excellent', desc: 'Minor prep needed' },
            { value: 'good', label: 'Good', desc: 'Standard prep' },
            { value: 'fair', label: 'Fair', desc: 'Extra prep required' }
          ].map((cond) => (
            <div key={cond.value}>
              <RadioGroupItem value={cond.value} id={cond.value} className="peer sr-only" />
              <Label
                htmlFor={cond.value}
                className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border-2 border-slate-200 cursor-pointer hover:bg-slate-100 peer-data-[state=checked]:border-[#1e3a5f] peer-data-[state=checked]:bg-[#1e3a5f]/5 transition-all"
              >
                <span className="font-semibold text-slate-900">{cond.label}</span>
                <span className="text-xs text-slate-500 mt-1 text-center">{cond.desc}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );

  const renderCabinetForm = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium text-slate-900 block mb-3">Kitchen Size</Label>
        <RadioGroup
          value={details.kitchenSize || 'medium'}
          onValueChange={(v) => updateDetail('kitchenSize', v)}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { value: 'small', label: 'Small', desc: '< 150 sq ft' },
            { value: 'medium', label: 'Medium', desc: '150-250 sq ft' },
            { value: 'large', label: 'Large', desc: '> 250 sq ft' }
          ].map((size) => (
            <div key={size.value}>
              <RadioGroupItem value={size.value} id={size.value} className="peer sr-only" />
              <Label
                htmlFor={size.value}
                className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border-2 border-slate-200 cursor-pointer hover:bg-slate-100 peer-data-[state=checked]:border-[#1e3a5f] peer-data-[state=checked]:bg-[#1e3a5f]/5 transition-all"
              >
                <span className="font-semibold text-slate-900">{size.label}</span>
                <span className="text-xs text-slate-500 mt-1">{size.desc}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-medium text-slate-900">Estimated Door Count</Label>
        <div className="flex items-center gap-4 mt-3">
          <Slider
            value={[details.doorCount || 20]}
            onValueChange={([v]) => updateDetail('doorCount', v)}
            min={5}
            max={50}
            step={1}
            className="flex-1"
          />
          <span className="text-2xl font-bold text-[#1e3a5f] w-12 text-center">
            {details.doorCount || 20}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div>
            <Label className="text-base font-medium text-slate-900">Paint Frames</Label>
            <p className="text-sm text-slate-500">Face frames around doors</p>
          </div>
          <Switch
            checked={details.paintFrames || false}
            onCheckedChange={(v) => updateDetail('paintFrames', v)}
          />
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div>
            <Label className="text-base font-medium text-slate-900">Paint Boxes</Label>
            <p className="text-sm text-slate-500">Interior of cabinet boxes</p>
          </div>
          <Switch
            checked={details.paintBoxes || false}
            onCheckedChange={(v) => updateDetail('paintBoxes', v)}
          />
        </div>
      </div>

      <div>
        <Label className="text-base font-medium text-slate-900 block mb-3">Finish Tier</Label>
        <RadioGroup
          value={details.finishTier || 'standard'}
          onValueChange={(v) => updateDetail('finishTier', v)}
          className="grid grid-cols-2 gap-3"
        >
          {[
            { value: 'standard', label: 'Standard', desc: 'Quality brushed finish' },
            { value: 'premium', label: 'Premium', desc: 'Sprayed factory finish' }
          ].map((tier) => (
            <div key={tier.value}>
              <RadioGroupItem value={tier.value} id={`finish-${tier.value}`} className="peer sr-only" />
              <Label
                htmlFor={`finish-${tier.value}`}
                className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border-2 border-slate-200 cursor-pointer hover:bg-slate-100 peer-data-[state=checked]:border-[#1e3a5f] peer-data-[state=checked]:bg-[#1e3a5f]/5 transition-all"
              >
                <span className="font-semibold text-slate-900">{tier.label}</span>
                <span className="text-xs text-slate-500 mt-1 text-center">{tier.desc}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );

  const renderTrimForm = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium text-slate-900">Estimated Linear Feet</Label>
        <p className="text-sm text-slate-500 mb-3">Total length of trim, baseboards, and doors</p>
        <div className="flex items-center gap-4">
          <Slider
            value={[details.linearFeet || 200]}
            onValueChange={([v]) => updateDetail('linearFeet', v)}
            min={50}
            max={500}
            step={10}
            className="flex-1"
          />
          <span className="text-2xl font-bold text-[#1e3a5f] w-20 text-center">
            {details.linearFeet || 200} ft
          </span>
        </div>
      </div>
    </div>
  );

  const renderDeckForm = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium text-slate-900">Estimated Square Feet</Label>
        <p className="text-sm text-slate-500 mb-3">Total area of deck and/or fence</p>
        <div className="flex items-center gap-4">
          <Slider
            value={[details.squareFeet || 300]}
            onValueChange={([v]) => updateDetail('squareFeet', v)}
            min={100}
            max={1000}
            step={25}
            className="flex-1"
          />
          <span className="text-2xl font-bold text-[#1e3a5f] w-24 text-center">
            {details.squareFeet || 300} sq ft
          </span>
        </div>
      </div>
    </div>
  );

  const renderForm = () => {
    switch (service) {
      case 'interior': return renderInteriorForm();
      case 'exterior': return renderExteriorForm();
      case 'cabinet': return renderCabinetForm();
      case 'trim': return renderTrimForm();
      case 'deck': return renderDeckForm();
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-[#1e3a5f]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{config.title}</h2>
            <p className="text-slate-600">{config.description}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        {renderForm()}
      </div>

      <Button
        onClick={() => onComplete(details)}
        className="w-full h-14 text-lg font-semibold bg-[#1e3a5f] hover:bg-[#2a4d7a] rounded-xl"
      >
        Continue to Photos
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </motion.div>
  );
}