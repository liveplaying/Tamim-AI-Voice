import React from 'react';
import { AudioProject } from '../types';
import { FileAudio, Clock, MoreVertical, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';

interface ProjectListProps {
  projects: AudioProject[];
  activeId?: string;
  onSelect: (project: AudioProject) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, activeId, onSelect, onDelete, className }) => {
  return (
    <div className={cn("bg-bg-side border-r border-border-main w-64 flex flex-col", className)}>
      <div className="h-10 bg-zinc-900 border-b border-border-main flex items-center justify-between px-4">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">History</h2>
        <span className="text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">{projects.length}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 ? (
          <div className="p-6 text-center space-y-2 opacity-30">
            <Clock size={20} className="mx-auto" />
            <p className="text-[10px] font-bold uppercase tracking-tighter">Empty Library</p>
          </div>
        ) : (
          projects.sort((a,b) => b.updatedAt - a.updatedAt).map(p => (
            <div
              key={p.id}
              onClick={() => onSelect(p)}
              className={cn(
                "p-4 border-b border-zinc-800/50 cursor-pointer transition-all group",
                p.id === activeId ? "bg-accent/10 border-l-2 border-l-accent" : "hover:bg-accent/5"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className={cn("text-xs font-bold truncate pr-2 transition-colors", p.id === activeId ? "text-white" : "text-zinc-400 group-hover:text-zinc-200")}>{p.title || 'Untitled'}</h3>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase italic">
                <FileAudio size={10} />
                <span>{formatDistanceToNow(p.updatedAt)} ago</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
