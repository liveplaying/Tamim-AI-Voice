import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  Settings, 
  FileAudio, 
  Sparkles, 
  Plus, 
  History, 
  Download, 
  Save,
  Wand2,
  AlertCircle,
  Loader2,
  Search,
  Volume2,
  Filter,
  Type,
  Music
} from 'lucide-react';
import { generateTTS, generateScript } from './services/gemini';
import { AudioWaveform } from './components/AudioWaveform';
import { VoiceControls } from './components/VoiceControls';
import { ProjectList } from './components/ProjectList';
import { VoiceProfile, AudioProject } from './types';
import { cn } from './lib/utils';

export default function App() {
  const [activeProfile, setActiveProfile] = useState<VoiceProfile>({
    id: 'default',
    name: 'Standard Doc',
    voiceName: 'Kore',
    pitch: 1.0,
    speed: 1.0,
    volume: 0.8,
    tone: 'Professional Documentary',
    createdAt: Date.now()
  });

  const [project, setProject] = useState<AudioProject>({
    id: 'temp',
    title: 'New Documentary',
    script: '',
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [topic, setTopic] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<AudioProject[]>([]);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('docuvoice_projects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse projects");
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('docuvoice_projects', JSON.stringify(projects));
  }, [projects]);

  const handleSaveProject = () => {
    const existing = projects.find(p => p.id === project.id);
    if (existing) {
      setProjects(projects.map(p => p.id === project.id ? project : p));
    } else {
      const newId = project.id === 'temp' ? Math.random().toString(36).substring(7) : project.id;
      setProjects([...projects, { ...project, id: newId }]);
      setProject(prev => ({ ...prev, id: newId }));
    }
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    if (project.id === id) {
      setProject({
        id: 'temp',
        title: 'New Documentary',
        script: '',
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
  };

  const handleNewProject = () => {
    setProject({
      id: 'temp',
      title: 'New Documentary',
      script: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    setTopic('');
  };

  const handleSTT = () => {
    // Basic Web Speech API check
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    
    setIsGeneratingScript(true); // Re-using spinner for UX
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setProject(prev => ({ ...prev, script: prev.script + ' ' + transcript }));
      setIsGeneratingScript(false);
    };
    recognition.onerror = () => setIsGeneratingScript(false);
  };

  const handleGenerateScript = async () => {
    if (!topic) return;
    setError(null);
    setIsGeneratingScript(true);
    try {
      const script = await generateScript(topic, activeProfile.tone);
      setProject(prev => ({ ...prev, script }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate script');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!project.script) return;
    setError(null);
    setIsGenerating(true);
    try {
      const base64 = await generateTTS(project.script, activeProfile.voiceName, activeProfile.speed);
      setProject(prev => ({ ...prev, base64Audio: base64, updatedAt: Date.now() }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate audio');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadMP3 = () => {
    if (!project.base64Audio) return;
    const byteString = atob(project.base64Audio);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '_')}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-bg-main text-zinc-300 flex flex-col font-sans selection:bg-accent/30">
      {/* Top Header */}
      <header className="h-14 border-b border-border-main bg-bg-side flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)] text-black">
            <Mic size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-[0.3em] text-white">DocuVoice <span className="text-accent">Pro</span></h1>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-0.5">Professional Audio Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-xs font-medium uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors" onClick={handleNewProject}>New</button>
          <div className="h-4 w-px bg-zinc-800" />
          <button 
            onClick={handleSaveProject}
            className="px-4 py-1.5 bg-accent text-black text-xs font-bold rounded hover:bg-amber-400 uppercase tracking-widest transition-all"
          >
            Save Project
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar: Projects */}
        <ProjectList 
          projects={projects}
          activeId={project.id}
          onSelect={setProject}
          onDelete={handleDeleteProject}
        />

        {/* Sidebar: Controls */}
        <VoiceControls 
          profile={activeProfile} 
          onUpdate={setActiveProfile} 
          className="w-80 shrink-0"
        />

        {/* Main Content: Script & Generation */}
        <section className="flex-1 flex flex-col p-8 overflow-y-auto">
          <div className="max-w-4xl w-full mx-auto space-y-8 pb-12">
            
            {/* Project Title & Topic */}
            <div className="space-y-4">
              <input 
                type="text"
                value={project.title}
                onChange={(e) => setProject(p => ({ ...p, title: e.target.value }))}
                className="bg-transparent text-3xl font-light tracking-tight focus:outline-none w-full border-b border-transparent focus:border-accent/30 pb-2 text-white"
                placeholder="Project Title"
              />
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"><Search size={16} /></span>
                  <input 
                    type="text"
                    placeholder="Enter documentary topic..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-bg-side border border-border-main rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <button 
                  onClick={handleGenerateScript}
                  disabled={isGeneratingScript || !topic}
                  className="px-6 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center gap-2 text-xs font-mono uppercase tracking-widest transition-colors"
                >
                  {isGeneratingScript ? <Loader2 className="animate-spin text-accent" size={16} /> : <Sparkles className="text-accent" size={16} />}
                  Auto Script
                </button>
              </div>
            </div>

            {/* Script Area */}
            <div className="relative group">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-accent/20 group-focus-within:bg-accent transition-colors" />
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 block">Documentary Script</label>
              <textarea 
                value={project.script}
                onChange={(e) => setProject(p => ({ ...p, script: e.target.value }))}
                placeholder="Write or generate your documentary script here..."
                className="w-full bg-transparent border-none text-lg leading-relaxed focus:outline-none h-[400px] resize-none font-serif placeholder:text-zinc-800"
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between border-t border-border-main pt-8">
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Estimated Length</span>
                  <span className="text-sm font-mono text-accent">~{Math.ceil(project.script.length / 15)} seconds</span>
                </div>
                <div className="flex items-center gap-4 border-l border-border-main pl-6">
                   <button 
                    onClick={handleSTT}
                    className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-zinc-300" 
                    title="Speech to Text"
                   >
                     <Type size={18} />
                   </button>
                   <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-zinc-300" title="Audio Effects">
                     <Filter size={18} />
                   </button>
                   <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-zinc-300" title="Background Music">
                     <Music size={18} />
                   </button>
                </div>
              </div>

              <button 
                onClick={handleGenerateAudio}
                disabled={isGenerating || !project.script}
                className="group relative px-8 py-4 bg-accent hover:bg-amber-400 text-black disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg shadow-accent/20 overflow-hidden transition-all active:scale-95"
              >
                <div className="relative z-10 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em]">
                   {isGenerating ? (
                     <>
                      <Loader2 className="animate-spin" size={20} />
                      Synthesizing...
                     </>
                   ) : (
                     <>
                      <Wand2 size={20} />
                      Generate Audio
                     </>
                   )}
                </div>
                {!isGenerating && <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />}
              </button>
            </div>

            {/* Waveform Visualization */}
            <AnimatePresence>
              {(project.base64Audio || isGenerating) && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="pt-4"
                >
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Audio Preview & Timeline</h3>
                    <div className="flex gap-2">
                       {project.base64Audio && (
                         <button 
                           onClick={downloadMP3}
                           className="flex items-center gap-2 text-[10px] bg-accent/10 text-accent px-3 py-1.5 rounded border border-accent/20 font-mono hover:bg-accent/20 transition-all font-bold"
                         >
                           <Download size={12} />
                           EXPORT AUDIO (WAV)
                         </button>
                       )}
                       <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-1.5 rounded border border-green-500/20 font-mono">
                         {isGenerating ? 'GENERATING' : 'ENGINE READY'}
                       </span>
                    </div>
                  </div>
                  <AudioWaveform 
                    base64={project.base64Audio} 
                    className="rounded-xl overflow-hidden shadow-2xl border-zinc-800"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-400 text-sm overflow-hidden"
              >
                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                <p>{error}</p>
              </motion.div>
            )}

          </div>
        </section>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-8 border-t border-border-main bg-bg-side flex items-center px-6 justify-between text-[10px] font-mono text-zinc-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
            <span>ENGINE STATUS: STABLE</span>
          </div>
          <span>MODEL: GEMINI-3.1-FLASH-TTS</span>
        </div>
        <div className="flex items-center gap-4 uppercase tracking-widest">
           <span className="text-zinc-700">CPU: 0.2%</span>
           <span className="text-zinc-700">LATENCY: 42ms</span>
          <span className="text-white/10">48kHz / 24bit</span>
        </div>
      </footer>
    </div>
  );
}
