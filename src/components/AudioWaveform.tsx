import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import { Play, Pause, Scissors, Copy, Clipboard, Trash2, ZoomIn, ZoomOut, Save, Download } from 'lucide-react';
import { cn } from '../lib/utils';

interface AudioWaveformProps {
  url?: string;
  base64?: string;
  onReady?: (wavesurfer: WaveSurfer) => void;
  className?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ url, base64, onReady, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const regionRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgba(245, 158, 11, 0.2)',
      progressColor: '#f59e0b',
      cursorColor: '#ffffff',
      barWidth: 2,
      barGap: 1,
      height: 120,
    });

    const regions = ws.registerPlugin(RegionsPlugin.create());
    wavesurferRef.current = ws;

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('ready', () => {
      if (onReady) onReady(ws);
    });

    // Enable region selection
    regions.enableDragSelection({
      color: 'rgba(245, 158, 11, 0.1)',
    });

    regions.on('region-created', (region) => {
      // Allow only one region at a time
      regions.getRegions().forEach(r => {
        if (r !== region) r.remove();
      });
      regionRef.current = region;
    });

    return () => {
      ws.destroy();
    };
  }, []);

  useEffect(() => {
    if (!wavesurferRef.current) return;
    
    if (url) {
      wavesurferRef.current.load(url);
    } else if (base64) {
      const byteString = atob(base64);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: 'audio/wav' });
      wavesurferRef.current.loadBlob(blob);
    }
  }, [url, base64]);

  const togglePlay = () => wavesurferRef.current?.playPause();
  
  const adjustZoom = (delta: number) => {
    const newZoom = Math.max(1, zoom + delta);
    setZoom(newZoom);
    wavesurferRef.current?.zoom(newZoom * 10);
  };

  return (
    <div className={cn("bg-bg-side p-4 border border-border-main", className)}>
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={togglePlay}
          className="p-3 bg-accent hover:bg-amber-400 text-black rounded-full transition-colors shadow-lg shadow-accent/20"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <div className="flex-1" ref={containerRef} />
        <div className="flex flex-col gap-2">
          <button onClick={() => adjustZoom(5)} className="p-1.5 hover:bg-zinc-800 rounded transition-colors"><ZoomIn size={16} /></button>
          <button onClick={() => adjustZoom(-5)} className="p-1.5 hover:bg-zinc-800 rounded transition-colors"><ZoomOut size={16} /></button>
        </div>
      </div>
      
      <div className="flex items-center gap-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-t border-zinc-800 pt-4">
        <button className="flex items-center gap-1.5 hover:text-white transition-colors">
          <Scissors size={14} className="text-accent" /> Cut
        </button>
        <button className="flex items-center gap-1.5 hover:text-white transition-colors">
          <Copy size={14} className="text-accent" /> Copy
        </button>
        <button className="flex items-center gap-1.5 hover:text-white transition-colors">
          <Clipboard size={14} className="text-accent" /> Paste
        </button>
        <button className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
          <Trash2 size={14} /> Clear
        </button>
        <div className="flex-1" />
        <div className="h-4 w-px bg-zinc-800"></div>
        <span className="font-mono text-zinc-700 tracking-tighter">Selection: 00:00.00 - 00:00.00</span>
      </div>
    </div>
  );
};
