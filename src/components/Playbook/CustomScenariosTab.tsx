import React from 'react';
import { Trash2, Compass } from 'lucide-react';
import CustomScenarioForm from './CustomScenarioForm';

export default function CustomScenariosTab({ customScenarios = [], onAddCustomScenario, onDeleteCustomScenario }: any) {
  return (
    <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          
          {/* Extracted Form Component */}
          <CustomScenarioForm onAddCustomScenario={onAddCustomScenario} />

          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', margin: 0 }}>
                <Compass size={20} color="var(--bby-blue)" /> Custom Scenarios Library
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.775rem', marginTop: '0.15rem' }}>Active custom customer personas loaded into your local store consult database.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {customScenarios.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', border: '1.5px dashed var(--border-glass)', borderRadius: '16px', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                  No custom roleplay scenarios added yet. Use the form on the left to configure your first one!
                </div>
              ) : (
                customScenarios.map((scen: any) => (
                  <div 
                    key={scen.id}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '1rem', 
                      background: 'rgba(255, 255, 255, 0.01)', 
                      border: '1px solid var(--border-glass)',
                      borderRadius: '12px' 
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={scen.avatar} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border-glass)' }} />
                      <div>
                        <h4 style={{ fontSize: '0.95rem', margin: 0, color: '#fff', fontWeight: 600 }}>{scen.title}</h4>
                        <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Customer: {scen.name} | {scen.difficulty}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-trash"
                      style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: 0 }}
                      onClick={() => onDeleteCustomScenario(scen.id)}
                      title="Remove Custom Scenario"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
    </div>
  );
}
