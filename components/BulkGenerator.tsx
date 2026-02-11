
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Download, FileUp, Loader2, CheckCircle2 } from 'lucide-react';
import JSZip from 'jszip';
import { QRCodeCanvas } from 'qrcode.react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface BulkGeneratorProps {
  lang: Language;
}

export const BulkGenerator: React.FC<BulkGeneratorProps> = ({ lang }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const t = TRANSLATIONS[lang];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatus('idle');
    setProgress(0);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      
      const zip = new JSZip();
      const canvas = document.createElement('canvas');
      const container = document.createElement('div');
      
      for (let i = 0; i < lines.length; i++) {
        const value = lines[i].split(',')[0].trim();
        if (!value) continue;

        // Using a hidden div to render QR components is tricky, so we'll use a direct method if possible.
        // Actually, for bulk, we can just use the QRCode canvas helper directly.
        // We'll simulate the rendering logic.
        const size = 512;
        const qrcode = (await import('qrcode')).default;
        
        try {
          const dataUrl = await qrcode.toDataURL(value, {
            width: size,
            margin: 2,
            errorCorrectionLevel: 'M'
          });
          const base64Data = dataUrl.split(',')[1];
          zip.file(`qr_${i + 1}_${value.substring(0, 10).replace(/[^a-z0-9]/gi, '_')}.png`, base64Data, { base64: true });
        } catch (err) {
          console.error('Error generating QR for', value, err);
        }

        setProgress(Math.round(((i + 1) / lines.length) * 100));
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr_codes_bulk_${Date.now()}.zip`;
      link.click();
      
      setIsProcessing(false);
      setStatus('success');
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex flex-col items-center text-center">
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-6 text-indigo-600 dark:text-indigo-400">
          <FileUp size={48} />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t.bulk}</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
          {t.bulkDesc}
        </p>

        <div className="w-full max-w-sm">
          <label className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Download className="w-10 h-10 mb-3 text-slate-400" />
              <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="font-semibold">{t.csvUpload}</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">CSV only</p>
            </div>
            <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} disabled={isProcessing} />
          </label>
        </div>

        {isProcessing && (
          <div className="mt-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                Processing...
              </span>
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg flex items-center gap-2">
            <CheckCircle2 size={20} />
            ZIP downloaded successfully!
          </div>
        )}
      </div>
    </div>
  );
};
