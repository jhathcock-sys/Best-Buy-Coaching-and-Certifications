import { create } from 'zustand';

export interface AgentMessage {
  agent: string;
  type: 'VETO' | 'AGREE' | 'INFO' | 'ACTION';
  message: string;
  timestamp: string;
}

export interface Manifest {
  total_files: number;
  file_index: number;
  current_checkpoint: {
    phase: number;
    file_path: string;
  };
  processed_queue: string[];
  remaining_queue: string[];
  active_vetos: string[];
  agent_feed: AgentMessage[];
}

interface CommandCenterState {
  manifest: Manifest | null;
  fetchManifest: () => Promise<void>;
}

export const useCommandCenterStore = create<CommandCenterState>((set) => ({
  manifest: null,
  fetchManifest: async () => {
    try {
      const res = await fetch('/loop_manifest.json?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        set({ manifest: data });
      }
    } catch (e) {
      console.error('Failed to fetch manifest', e);
    }
  }
}));
