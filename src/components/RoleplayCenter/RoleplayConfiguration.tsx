import React from 'react';
import { Send, Users, ShieldCheck, Star, Award, CheckCircle2, ChevronRight, MessageSquare, PlusCircle, User, Loader2, Sparkles, RefreshCw, XCircle } from 'lucide-react';

export default function RoleplayConfiguration({ 
  scenarios,
  selectedScenario,
  setSelectedScenario,
  complexity,
  setComplexity,
  customerTone,
  setCustomerTone,
  startRoleplay,
  messages,
  inputText,
  setInputText,
  sendMessage,
  isLoading,
  messagesEndRef,
  endRoleplay,
  evaluation,
  saveAndReturn,
  roster
 }) {
  return (
    <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Consultative Practice Arena</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Select a customer profile to practice the Best Buy sales process and test your consultative skills.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {allScenarios.map(scenario => (
              <div key={scenario.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="tag-pill tag-pill-active">{scenario.category}</span>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      color: scenario.difficulty === 'Hard' ? 'var(--error)' : scenario.difficulty === 'Medium' ? 'var(--warning)' : 'var(--success)' 
                    }}>
                      {scenario.difficulty.toUpperCase()}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={scenario.avatar} alt="" style={{ width: 50, height: 50, borderRadius: '50%', border: '2px solid var(--bby-blue)', objectFit: 'cover' }} />
                    <div>
                      <h3 style={{ fontSize: '1.15rem' }}>{scenario.title}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Customer: {scenario.name}</p>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {scenario.description}
                  </p>
                </div>

                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => startRoleplay(scenario)}>
                  Launch Roleplay
                </button>
              </div>
            ))}
          </div>
        </div>
    </>
  );
}
