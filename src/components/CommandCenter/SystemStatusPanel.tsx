import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useCommandCenterStore } from './useCommandCenterStore';

export default function SystemStatusPanel() {
  const manifest = useCommandCenterStore(state => state.manifest);

  if (!manifest) return null;

  const isObj = typeof manifest.current_checkpoint === 'object' && manifest.current_checkpoint !== null;
  const filePath = isObj ? (manifest.current_checkpoint as any).file_path : (manifest.remaining_queue?.[0] || 'Unknown');
  const activeFileName = typeof filePath === 'string' ? filePath.split('/').pop() || 'Unknown' : 'Unknown';
  const phase = isObj ? (manifest.current_checkpoint as any).phase : 1;

  return (
    <motion.div 
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="col-span-3 flex-column gap-lg"
      data-testid="system-status-panel"
    >
      <div className="glass-card flex-column gap-md border-active relative overflow-hidden">
        <div className="absolute inset-0 bg-bby-blue-alpha-05 pointer-events-none animate-pulse" />
        <h3 className="text-sm text-bby-blue font-heading uppercase tracking-widest flex align-center gap-sm m-0">
          <Terminal size={16} />
          Current Target
        </h3>
        <div>
          <div className="text-xxs text-muted mb-xs">Active File</div>
          <div data-testid="active-file-name" className="text-lg text-white font-mono truncate" title={manifest.current_checkpoint.file_path}>
            {activeFileName}
          </div>
        </div>
        <div>
          <div className="text-xxs text-muted mb-xs">Execution Phase</div>
          <div className="flex gap-xs">
            {[1, 2, 3, 4, 5].map(p => (
              <div 
                key={p} 
                className={`h-2 flex-1 rounded-sm ${phase >= p ? 'bg-bby-blue' : 'bg-glass-10'}`} 
              />
            ))}
          </div>
          <div data-testid="phase-indicator" className="text-xs text-bby-blue mt-xs text-right">Phase {phase}</div>
        </div>
      </div>

      <div className="glass-card flex-1 overflow-y-auto">
        <h3 className="text-sm text-error font-heading uppercase tracking-widest flex align-center gap-sm m-0 mb-md">
          <ShieldAlert size={16} />
          Active System Vetos
        </h3>
        <div className="flex-column gap-sm">
          <AnimatePresence>
            {manifest.active_vetos?.length === 0 && (
               <motion.div data-testid="zero-anomalies" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-success flex align-center gap-xs">
                 <CheckCircle2 size={14} /> Zero Active Anomalies
               </motion.div>
            )}
            {manifest.active_vetos?.map((veto, idx) => (
              <motion.div 
                key={idx}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="p-sm rounded bg-error-alpha-10 border border-error text-xs text-error font-mono leading-tight"
                data-testid="active-veto-item"
              >
                {veto}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
