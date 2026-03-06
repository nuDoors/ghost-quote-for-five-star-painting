import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Upload, Copy, Check } from 'lucide-react';

export default function VideoUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      setVideoUrl(response.file_url);
      setFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(videoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Upload Video</h1>
      
      <div className="space-y-4">
        <input
          type="file"
          accept="video/mp4"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full border border-slate-300 rounded-lg p-3"
        />
        
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full gap-2"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload MP4'}
        </Button>

        {videoUrl && (
          <div className="bg-slate-100 p-4 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">Video URL:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={videoUrl}
                readOnly
                className="flex-1 bg-white border border-slate-300 rounded p-2 text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}