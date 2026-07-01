import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Bug, Database, Layout, Code2, Cpu } from 'lucide-react';
import { useCommandCenterStore } from './useCommandCenterStore';

export default function AgentCommLink() {
  const manifest = useCommandCenterStore(state => state.manifest);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [manifest?.agent_feed]);

  if (!manifest) return null;

  const getAgentIcon = (agent: string) => {
    if (agent.includes('qa')) return <Bug size={16} className="text-error" />;
    if (agent.includes('tech_debt')) return <Database size={16} className="text-warning" />;
    if (agent.includes('ux')) return <Layout size={16} className="text-bby-yellow" />;
    if (agent.includes('coder')) return <Code2 size={16} className="text-success" />;
    return <Cpu size={16} className="text-bby-blue" />;
  };

  const getAgentColorClass = (agent: string) => {
    if (agent.includes('qa')) return 'agent-icon-qa';
    if (agent.includes('tech_debt')) return 'agent-icon-tech_debt';
    if (agent.includes('ux')) return 'agent-icon-ux';
    if (agent.includes('coder')) return 'agent-icon-coder';
    return 'agent-icon-default';
  };

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="col-span-6 glass-card flex-column p-0 overflow-hidden"
      data-testid="agent-comm-link"
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
            <div data-testid="agent-comm-empty" className="text-center text-muted text-sm mt-xl font-mono">Awaiting transmission...</div>
          )}
          {manifest.agent_feed?.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`flex gap-sm ${msg.agent === 'orchestrator' ? 'flex-row-reverse' : 'flex-row'}`}
              data-testid="agent-message"
            >
              <div 
                className={`flex-shrink-0 w-8 h-8 rounded border flex-center ${getAgentColorClass(msg.agent)}`}
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
  );
}
