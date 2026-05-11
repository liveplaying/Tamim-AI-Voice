import React from 'react';
import { VoiceName, VoiceProfile } from '../types';
import { Settings, User, Sliders, Volume2, FastForward } from 'lucide-react';
import { cn } from '../lib/utils';

interface VoiceControlsProps {
  profile: VoiceProfile;
  onUpdate: (profile: VoiceProfile) => void;
  className?: string;
}

const VOICE_NAMES: VoiceName[] = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];

export const VoiceControls: React.FC<VoiceControlsProps> = ({ profile, onUpdate, className }) => {
  const handleChange = (field: keyof VoiceProfile, value: any) => {
    onUpdate({ ...profile, [field]: value });
  };

  return (
    <div className={cn("bg-bg-side p-6 space-y-6 border-r border-border-main", className)}>
      <div className="flex items-center gap-2 text-accent mb-2">
        <User size={18} />
        <h2 className="text-[10px] font-bold uppercase tracking-widest">Voice Dynamics</h2>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {VOICE_NAMES.map(name => (
          <button
            key={name}
            onClick={() => handleChange('voiceName', name)}
            className={cn(
              "px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded transition-all border",
              profile.voiceName === name 
                ? "bg-accent/20 border-accent text-accent shadow-[0_0_10px_rgba(245,158,11,0.2)]" 
                : "bg-bg-main border-zinc-800 text-zinc-500 hover:border-zinc-700"
            )}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
             <span>Speed</span>
             <span className="text-accent">{profile.speed}x</span>
          </div>
          <input 
            type="range" min="0.25" max="2.0" step="0.05"
            value={profile.speed}
            onChange={(e) => handleChange('speed', parseFloat(e.target.value))}
            className="w-full accent-accent h-1 bg-zinc-800 rounded-lg appearance-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
             <span>Pitch</span>
             <span className="text-accent">{profile.pitch} st</span>
          </div>
          <input 
            type="range" min="0.5" max="1.5" step="0.01"
            value={profile.pitch}
            onChange={(e) => handleChange('pitch', parseFloat(e.target.value))}
            className="w-full accent-accent h-1 bg-zinc-800 rounded-lg appearance-none"
          />
        </div>

        <div className="space-y-2">
           <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
             <span>Depth</span>
             <span className="text-accent">{Math.round(profile.volume * 100)}%</span>
           </div>
           <input 
             type="range" min="0" max="1.0" step="0.01"
             value={profile.volume}
             onChange={(e) => handleChange('volume', parseFloat(e.target.value))}
             className="w-full accent-accent h-1 bg-zinc-800 rounded-lg appearance-none"
           />
        </div>
      </div>

      <div className="space-y-3 pt-6 border-t border-border-main">
        <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Effects Palette</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-zinc-800/50 rounded border border-zinc-800">
            <span className="text-[10px] font-medium text-zinc-400">Noise Reduction</span>
            <div className="w-6 h-3 bg-accent rounded-full relative">
              <div className="w-2 h-2 bg-black rounded-full absolute right-0.5 top-0.5"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-4">
        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Profile Notes</label>
        <textarea 
          value={profile.tone}
          onChange={(e) => handleChange('tone', e.target.value)}
          placeholder="e.g. Mysterious, Educational..."
          className="w-full bg-bg-input border border-border-main rounded p-2 text-xs text-zinc-300 focus:outline-none focus:border-accent transition-colors h-20 resize-none leading-relaxed"
        />
      </div>
    </div>
  );
};
