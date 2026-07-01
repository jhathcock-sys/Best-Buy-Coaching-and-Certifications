import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { useCommandCenterStore } from './useCommandCenterStore';

export default function ProcessingQueue() {
  const manifest = useCommandCenterStore(state => state.manifest);

  if (!manifest) return null;

  return (
    <motion.div 
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="col-span-3 glass-card flex-column overflow-hidden p-0"
      data-testid="processing-queue"
    >
      <div className="p-md border-bottom border-glass bg-obsidian">
        <h3 className="text-sm text-white font-heading uppercase tracking-widest flex align-center gap-sm m-0">
          <Search size={16} className="text-muted" />
          Remaining Queue
        </h3>
        <div data-testid="queue-count" className="text-xxs text-muted mt-xs">{manifest.remaining_queue.length} files remaining</div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-sm bg-obsidian">
        <div className="flex-column gap-xs">
          <AnimatePresence>
            {manifest.remaining_queue.slice(0, 50).map((file, idx) => (
              <motion.div 
                key={file}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-sm rounded text-xs font-mono truncate border ${
                  idx === 0 ? 'bg-bby-blue-alpha-20 border-active text-white animate-pulse' : 'bg-glass-05 border-glass text-muted'
                }`}
                title={file}
                data-testid={`queue-item-${idx}`}
              >
                {idx === 0 ? '> ' : ''}{file.split('/').pop()}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
