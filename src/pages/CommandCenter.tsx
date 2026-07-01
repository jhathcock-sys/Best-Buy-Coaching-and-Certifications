import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { useCommandCenterStore } from '../components/CommandCenter/useCommandCenterStore';
import SystemStatusPanel from '../components/CommandCenter/SystemStatusPanel';
import AgentCommLink from '../components/CommandCenter/AgentCommLink';
import ProcessingQueue from '../components/CommandCenter/ProcessingQueue';

export default function CommandCenter() {
  const fetchManifest = useCommandCenterStore(state => state.fetchManifest);
  const manifest = useCommandCenterStore(state => state.manifest);

  useEffect(() => {
    let isMounted = true;
    
    fetchManifest();
    const interval = setInterval(() => {
      if (isMounted) fetchManifest();
    }, 1500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchManifest]);

  if (!manifest) {
    return (
      <div className="min-h-screen bg-space flex-center">
        <div className="flex-column align-center gap-md">
          <Activity className="text-bby-blue animate-pulse" size={48} />
          <h2 className="text-xl text-white font-heading uppercase tracking-widest">Initializing Aegis Link...</h2>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round((manifest.file_index / manifest.total_files) * 100);

  return (
    <div className="min-h-screen bg-space p-xl bg-radial-hover" data-testid="command-center-page">
      
      {/* HEADER */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-between align-center mb-xl border-bottom border-glass pb-md"
      >
        <div className="flex align-center gap-md">
          <div className="p-sm rounded-full bg-bby-blue-alpha-10 border border-active flex-center">
            <Activity className="text-bby-blue" size={24} />
          </div>
          <div>
            <h1 className="text-2xl text-white font-heading m-0 uppercase tracking-widest">Aegis Command Center</h1>
            <p className="text-xs text-bby-blue uppercase tracking-widest m-0 mt-xxs">Stateful Purification Loop Active</p>
          </div>
        </div>
        
        <div className="flex gap-xl align-center">
          <div className="flex-column align-end">
            <span className="text-xxs text-muted uppercase tracking-wider">Progress</span>
            <span className="text-xl text-white font-extrabold">{progressPercent}%</span>
          </div>
          <div className="h-40px w-200px bg-obsidian rounded-full border-glass overflow-hidden relative">
            <motion.div 
              className="absolute left-0 top-0 bottom-0 bg-bby-blue"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <div className="absolute inset-0 flex-center text-xs text-white font-semibold z-10 mix-blend-difference">
              {manifest.file_index} / {manifest.total_files} Files
            </div>
          </div>
        </div>
      </motion.div>

      {/* THREE COLUMN GRID */}
      <div className="grid grid-cols-12 gap-lg h-[calc(100vh-140px)]">
        <SystemStatusPanel />
        <AgentCommLink />
        <ProcessingQueue />
      </div>
    </div>
  );
}
