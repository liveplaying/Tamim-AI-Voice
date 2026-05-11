export type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export interface VoiceProfile {
  id: string;
  name: string;
  voiceName: VoiceName;
  pitch: number; // 0.5 to 2.0
  speed: number; // 0.25 to 4.0
  volume: number; // 0 to 1.0
  tone: string;
  createdAt: number;
}

export interface AudioProject {
  id: string;
  title: string;
  script: string;
  audioUrl?: string; // This could be a Blob URL or base64 for local persistence
  base64Audio?: string;
  profileId?: string;
  createdAt: number;
  updatedAt: number;
}
