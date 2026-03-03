import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Upload, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { createPageUrl } from '@/utils';

export default function DemoAdmin() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ service: 'exterior', scenario_name: '', color_tags: '', is_default: false });
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [beforePreview, setBeforePreview] = useState(null);
  const [afterPreview, setAfterPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: pairs = [], isLoading } = useQuery({
    queryKey: ['demoPairs-all'],
    queryFn: () => base44.entities.DemoImagePair.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DemoImagePair.delete(id),
    onSuccess: () => qc.invalidateQueries(['demoPairs-all']),
  });

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'before') { setBeforeFile(file); setBeforePreview(url); }
    else { setAfterFile(file); setAfterPreview(url); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!beforeFile || !afterFile) return;
    setSaving(true);
    try {
      const [{ file_url: beforeUrl }, { file_url: afterUrl }] = await Promise.all([
        base44.integrations.Core.UploadFile({ file: beforeFile }),
        base44.integrations.Core.UploadFile({ file: afterFile }),
      ]);
      await base44.entities.DemoImagePair.create({
        service: form.service,
        scenario_name: form.scenario_name,
        before_url: beforeUrl,
        after_url: afterUrl,
        color_tags: form.color_tags.split(',').map(t => t.trim()).filter(Boolean),
        is_default: form.is_default,
      });
      qc.invalidateQueries(['demoPairs-all']);
      setForm({ service: 'exterior', scenario_name: '', color_tags: '', is_default: false });
      setBeforeFile(null); setAfterFile(null);
      setBeforePreview(null); setAfterPreview(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const serviceLabels = { exterior: 'Exterior', interior: 'Interior', cabinet: 'Cabinets', trim: 'Trim & Doors', deck: 'Deck & Fence' };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#1e3a5f] text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10"
            onClick={() => window.location.href = createPageUrl('Admin')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Demo Image Pairs</h1>
            <p className="text-sm text-white/70">Manage before/after visualizer images</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Upload form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-5">Upload New Pair</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 block text-slate-700">Service Type</Label>
                <Select value={form.service} onValueChange={v => setForm(p => ({ ...p, service: v }))}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(serviceLabels).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block text-slate-700">Scenario Name</Label>
                <Input value={form.scenario_name} onChange={e => setForm(p => ({ ...p, scenario_name: e.target.value }))}
                  placeholder="e.g. Navy Siding & White Trim" className="h-11 rounded-xl" />
              </div>
            </div>

            <div>
              <Label className="mb-1 block text-slate-700">Color Tags (comma-separated)</Label>
              <Input value={form.color_tags} onChange={e => setForm(p => ({ ...p, color_tags: e.target.value }))}
                placeholder="e.g. navy, white, blue" className="h-11 rounded-xl" />
              <p className="text-xs text-slate-400 mt-1">Used to match user color selections to the best demo pair</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Before Image', key: 'before', preview: beforePreview, file: beforeFile },
                { label: 'After Image', key: 'after', preview: afterPreview, file: afterFile },
              ].map(({ label, key, preview }) => (
                <div key={key}>
                  <Label className="mb-2 block text-slate-700">{label}</Label>
                  <label className={`relative flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all overflow-hidden ${
                    preview ? 'border-emerald-400' : 'border-slate-300 hover:border-[#1e3a5f]'
                  }`}>
                    <input type="file" accept="image/*" onChange={e => handleFileChange(e, key)} className="hidden" />
                    {preview ? (
                      <img src={preview} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-sm">Click to upload</span>
                      </div>
                    )}
                  </label>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <Label className="text-slate-900 font-medium">Set as Default</Label>
                <p className="text-xs text-slate-500">Use as the fallback pair for this service type</p>
              </div>
              <Switch checked={form.is_default} onCheckedChange={v => setForm(p => ({ ...p, is_default: v }))} />
            </div>

            <Button type="submit" disabled={saving || !beforeFile || !afterFile}
              className="w-full h-12 bg-[#1e3a5f] hover:bg-[#2a4d7a] rounded-xl font-semibold disabled:opacity-50">
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Uploading…
                </span>
              ) : saved ? (
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Saved!</span>
              ) : (
                <span className="flex items-center gap-2"><Upload className="w-4 h-4" /> Upload Pair</span>
              )}
            </Button>
          </form>
        </div>

        {/* Existing pairs */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Uploaded Pairs</h2>
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Loading…</div>
          ) : pairs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">
              <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No pairs uploaded yet. Built-in demo pairs are in use.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pairs.map(pair => (
                <motion.div key={pair.id} layout
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="grid grid-cols-2 h-32">
                    <div className="relative">
                      <img src={pair.before_url} alt="Before" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded">Before</div>
                    </div>
                    <div className="relative">
                      <img src={pair.after_url} alt="After" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-white text-slate-900 text-xs rounded font-medium">After</div>
                    </div>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{pair.scenario_name || 'Untitled'}</p>
                      <p className="text-xs text-slate-500">{serviceLabels[pair.service]} {pair.is_default && '· Default'}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(pair.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}