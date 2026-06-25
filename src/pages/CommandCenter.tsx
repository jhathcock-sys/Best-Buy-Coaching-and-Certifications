import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ShieldAlert, CheckCircle2, Activity, Database, Cpu, Search, Bug, Layout, Code2 } from 'lucide-react';

interface AgentMessage {
  agent: string;
  type: 'VETO' | 'AGREE' | 'INFO' | 'ACTION';
  message: string;
  timestamp: string;
}

interface Manifest {
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

export default function CommandCenter() {
  const [manifest, setManifest] = useState<Manifest | null>(null);

  useEffect(() => {
    const fetchManifest = async () => {
      try {
        const res = await fetch('/loop_manifest.json?t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          setManifest(data);
        }
      } catch (e) {
        console.error('Failed to fetch manifest', e);
      }
    };

    fetchManifest();
    const interval = setInterval(fetchManifest, 1500);
    return () => clearInterval(interval);
  }, []);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [manifest?.agent_feed]);

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
  const activeFileName = manifest.current_checkpoint.file_path.split('/').pop() || 'Unknown';

  const getAgentIcon = (agent: string) => {
    if (agent.includes('qa')) return <Bug size={16} className="text-error" />;
    if (agent.includes('tech_debt')) return <Database size={16} className="text-warning" />;
    if (agent.includes('ux')) return <Layout size={16} className="text-bby-yellow" />;
    if (agent.includes('coder')) return <Code2 size={16} className="text-success" />;
    return <Cpu size={16} className="text-bby-blue" />;
  };

  const getAgentColor = (agent: string) => {
    if (agent.includes('qa')) return 'var(--error)';
    if (agent.includes('tech_debt')) return 'var(--warning)';
    if (agent.includes('ux')) return 'var(--bby-yellow)';
    if (agent.includes('coder')) return 'var(--success)';
    return 'var(--bby-blue)';
  };

  return (
    <div className="min-h-screen bg-space p-xl" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, var(--bg-card-hover), transparent 70%)' }}>
      
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
            <div className="absolute inset-0 flex-center text-xs text-white font-semibold z-10" style={{ mixBlendMode: 'difference' }}>
              {manifest.file_index} / {manifest.total_files} Files
            </div>
          </div>
        </div>
      </motion.div>

      {/* THREE COLUMN GRID */}
      <div className="grid grid-cols-12 gap-lg h-[calc(100vh-140px)]">
        
        {/* LEFT: System Status */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="col-span-3 flex-column gap-lg"
        >
          <div className="glass-card flex-column gap-md border-active relative overflow-hidden">
            <div className="absolute inset-0 bg-bby-blue-alpha-05 pointer-events-none animate-pulse" />
            <h3 className="text-sm text-bby-blue font-heading uppercase tracking-widest flex align-center gap-sm m-0">
              <Terminal size={16} />
              Current Target
            </h3>
            <div>
              <div className="text-xxs text-muted mb-xs">Active File</div>
              <div className="text-lg text-white font-mono truncate" title={manifest.current_checkpoint.file_path}>
                {activeFileName}
              </div>
            </div>
            <div>
              <div className="text-xxs text-muted mb-xs">Execution Phase</div>
              <div className="flex gap-xs">
                {[1, 2, 3, 4, 5].map(phase => (
                  <div 
                    key={phase} 
                    className={`h-2 flex-1 rounded-sm ${manifest.current_checkpoint.phase >= phase ? 'bg-bby-blue' : 'bg-glass-10'}`} 
                  />
                ))}
              </div>
              <div className="text-xs text-bby-blue mt-xs text-right">Phase {manifest.current_checkpoint.phase}</div>
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
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-success flex align-center gap-xs">
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
                  >
                    {veto}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* CENTER: Agent Comm Link */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="col-span-6 glass-card flex-column p-0 overflow-hidden"
        >
          <div className="p-md border-bottom border-glass bg-obsidian flex-between align-center">
            <h3 className="text-sm text-white font-heading uppercase tracking-widest flex align-center gap-sm m-0">
              <Activity size={16} className="text-bby-blue" />
              Agent Comm Link
            </h3>
            <div className="flex align-center gap-xs">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
              </span>
              <span className="text-xxs text-success uppercase tracking-widest">Live Stream</span>
            </div>
          </div>
          
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-lg flex-column gap-md bg-obsidian scroll-smooth">
            <AnimatePresence>
              {(!manifest.agent_feed || manifest.agent_feed.length === 0) && (
                <div className="text-center text-muted text-sm mt-xl font-mono">Awaiting transmission...</div>
              )}
              {manifest.agent_feed?.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`flex gap-sm ${msg.agent === 'orchestrator' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div 
                    className="flex-shrink-0 w-8 h-8 rounded border border-glass flex-center"
                    style={{ backgroundColor: `${getAgentColor(msg.agent)}20`, borderColor: getAgentColor(msg.agent) }}
                  >
                    {getAgentIcon(msg.agent)}
                  </div>
                  
                  <div className={`max-w-[80%] flex-column ${msg.agent === 'orchestrator' ? 'align-end' : 'align-start'}`}>
                    <div className="flex align-center gap-sm mb-xxs">
                      <span className="text-xxs text-muted uppercase tracking-wider">{msg.agent}</span>
                      <span className="text-[10px] text-glass-40 font-mono">{msg.timestamp}</span>
                    </div>
                    <div 
                      className={`p-sm rounded-lg text-sm ${
                        msg.type === 'VETO' ? 'bg-error-alpha-10 border border-error text-error' :
                        msg.type === 'AGREE' ? 'bg-success-alpha-10 border border-success text-success' :
                        msg.agent === 'orchestrator' ? 'bg-bby-blue-alpha-20 border border-active text-white' :
                        'bg-glass-10 border border-glass text-white'
                      }`}
                    >
                      {msg.type !== 'INFO' && <strong className="block mb-xs text-xs">[{msg.type}]</strong>}
                      <span className="font-mono leading-relaxed whitespace-pre-wrap">{msg.message}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* RIGHT: Processing Queue */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="col-span-3 glass-card flex-column overflow-hidden p-0"
        >
          <div className="p-md border-bottom border-glass bg-obsidian">
            <h3 className="text-sm text-white font-heading uppercase tracking-widest flex align-center gap-sm m-0">
              <Search size={16} className="text-muted" />
              Remaining Queue
            </h3>
            <div className="text-xxs text-muted mt-xs">{manifest.remaining_queue.length} files remaining</div>
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
                  >
                    {idx === 0 ? '> ' : ''}{file.split('/').pop()}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
