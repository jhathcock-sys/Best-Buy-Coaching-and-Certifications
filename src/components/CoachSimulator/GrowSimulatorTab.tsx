import React, { useState } from 'react';
import { Users, Send, Check } from 'lucide-react';

export default function GrowSimulatorTab({
  allEmployees,
  startCoaching,
  isVoiceMode,
  speakText,
  onImportScenario
}) {
  const [importText, setImportText] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const [parseLogs, setParseLogs] = useState(null);

  const handleImportPastCoaching = () => {
    if (!importText.trim()) {
      alert("Please paste some coaching text first!");
      return;
    }
    
    let name = "Advisor";
    let gap = "Memberships";
    
    const nameMatch = importText.match(/(?:coaching log|employee|name|advisor):\s*([a-zA-Z\s\/]+)/i) || 
                      importText.match(/(?:log for|coaching):\s*([a-zA-Z\s\/]+)/i) ||
                      importText.match(/^([a-zA-Z\s\/]+)\s+(?:is struggling|has a gap|needs)/im);
                      
    if (nameMatch) {
      name = nameMatch[1].trim().split('\n')[0].split('(')[0].trim();
    }
    
    const gapMatch = importText.match(/(?:gap|opportunity|focus|metric):\s*([a-zA-Z0-9\s\%\-\+\/\$]+)/i) ||
                     importText.match(/(?:struggling with|low on):\s*([a-zA-Z0-9\s\%\-\+\/\$]+)/i);
                     
    if (gapMatch) {
      gap = gapMatch[1].trim().split('\n')[0].trim();
    } else {
      const lowerText = importText.toLowerCase();
      if (lowerText.includes('membership') || lowerText.includes('total') || lowerText.includes('plus')) {
        gap = 'Memberships';
      } else if (lowerText.includes('credit card') || lowerText.includes('card') || lowerText.includes('app')) {
        gap = 'BBY Credit Cards';
      } else if (lowerText.includes('gsp') || lowerText.includes('warranty') || lowerText.includes('protection')) {
        gap = 'GSP Attach';
      } else if (lowerText.includes('survey') || lowerText.includes('csat') || lowerText.includes('5-star')) {
        gap = '5-Star Surveys';
      } else if (lowerText.includes('rph') || lowerText.includes('revenue')) {
        gap = 'RPH';
      }
    }
    
    const customScen = {
      id: `imported-${Date.now()}`,
      title: `Imported: ${name} (${gap})`,
      role: 'Employee',
      name: `${name} (Imported)`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      description: `Custom scenario extracted from pasted coaching notes. Focus Area: ${gap}.`,
      metricGap: gap,
      initialGreeting: `Hey Boss. I read your feedback notes about my gap in ${gap}. I want to do better, but I'm really struggling on the floor. Can you help me figure out what I should do?`,
      personality: 'Receptive and willing to learn, but needs specific, actionable guidance.',
      coachingGoal: `Coach ${name} to close their performance gap in ${gap}.`
    };
    
    if (onImportScenario) {
      onImportScenario(customScen);
    }
    
    setParseLogs({ name, gap });
    setImportSuccess(true);
    setImportText('');
    setTimeout(() => {
      setImportSuccess(false);
    }, 5000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
      
      {/* Active Employees List */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users color="var(--bby-blue)" size={22} /> Employee Coaching Scenarios
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '1.75rem' }}>
          Select an advisor to run a simulated GROW coaching conversation. Guide them behaviorally to address their metric targets.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {allEmployees.map(employee => (
            <div 
              key={employee.id} 
              style={{ 
                padding: '1.25rem', 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid var(--border-glass)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img src={employee.avatar} alt="" style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid var(--bby-blue)' }} />
                <div>
                  <h3 style={{ fontSize: '0.95rem' }}>{employee.name}</h3>
                  <span className="tag-pill" style={{ background: 'var(--error-glow)', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)', fontSize: '0.7rem', padding: '0.2rem 0.5rem', marginTop: '0.25rem' }}>
                    Focus: {employee.metricGap}
                  </span>
                </div>
              </div>
              
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {employee.description}
              </p>
              
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}
                onClick={() => startCoaching(employee, isVoiceMode, speakText)}
              >
                Start Practice Session
              </button>
            </div>
          ))}
          
          {allEmployees.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              No custom scenarios available. Import one using the NLP parser.
            </div>
          )}
        </div>
      </div>

      {/* Right side area: Quick NLP Scenario Importer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Create Custom Scenario</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Paste notes from a previous coaching log or leadership feedback form. The AI parser will automatically generate a roleplay scenario based on your historical notes.
          </p>
          
          <textarea 
            className="form-control"
            placeholder="Paste coaching notes here... e.g. 'Jane is struggling with membership attach on the floor...'"
            style={{ minHeight: '120px', marginBottom: '1rem' }}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          
          <button 
            className={`btn ${importSuccess ? 'btn-secondary' : 'btn-primary'}`} 
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
              borderColor: importSuccess ? 'var(--success)' : '', color: importSuccess ? 'var(--success)' : ''
             }}
            onClick={handleImportPastCoaching}
          >
            {importSuccess ? (
              <>
                <Check size={18} />
                Successfully imported scenario for {parseLogs?.name}
              </>
            ) : (
              <>
                <Send size={18} />
                Parse Notes & Generate Scenario
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
