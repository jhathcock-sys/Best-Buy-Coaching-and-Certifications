import React, { useState } from 'react';
import { Users, Send, Check } from 'lucide-react';
import { Employee } from '../../types';

export interface GrowSimulatorTabProps {
  allEmployees: Employee[];
  startCoaching: (employee: Employee, isVoiceMode: boolean, speakText: (text: string) => void) => void;
  isVoiceMode: boolean;
  speakText: (text: string) => void;
  onImportScenario: (scenario: any) => void;
}

export default function GrowSimulatorTab({
  allEmployees,
  startCoaching,
  isVoiceMode,
  speakText,
  onImportScenario
}: GrowSimulatorTabProps) {
  const [importText, setImportText] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const [parseLogs, setParseLogs] = useState<{name: string; gap: string} | null>(null);

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
    <div className="grid gap-xl" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }} data-testid="grow-simulator-container">
      
      {/* Active Employees List */}
      <div className="glass-card">
        <h2 className="text-xl mb-sm flex align-center gap-sm m-0">
          <Users color="var(--bby-blue)" size={22} /> Employee Coaching Scenarios
        </h2>
        <p className="text-sm text-secondary mb-xl m-0">
          Select an advisor to run a simulated GROW coaching conversation. Guide them behaviorally to address their metric targets.
        </p>

        <div className="flex-column gap-lg">
          {(allEmployees || []).map(employee => (
            <div 
              key={employee.id} 
              className="p-xl bg-white-alpha-02 border border-glass rounded-2xl flex-column gap-md"
              data-testid={`employee-scenario-card-${employee.id}`}
            >
              <div className="flex-row gap-md align-center">
                <img src={employee.avatar} alt="" className="w-44px h-44px rounded-full border-2 border-bby-blue" />
                <div>
                  <h3 className="text-base m-0">{employee.name}</h3>
                  <span className="tag-pill bg-error-glow text-error border border-error-alpha-20 text-xs py-xs px-sm mt-xs inline-block">
                    Focus: {employee.metricGap}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-secondary line-height-normal m-0">
                {employee.description || `Needs coaching on ${employee.metricGap}`}
              </p>
              
              <button 
                className="btn btn-secondary w-full p-md text-sm cursor-pointer" 
                onClick={() => startCoaching(employee, isVoiceMode, speakText)}
                data-testid={`btn-start-practice-${employee.id}`}
              >
                Start Practice Session
              </button>
            </div>
          ))}
          
          {(allEmployees || []).length === 0 && (
            <div className="text-center p-xl text-secondary">
              No custom scenarios available. Import one using the NLP parser.
            </div>
          )}
        </div>
      </div>

      {/* Right side area: Quick NLP Scenario Importer */}
      <div className="flex-column gap-xl">
        <div className="glass-card">
          <h3 className="text-lg mb-sm m-0">Create Custom Scenario</h3>
          <p className="text-sm text-secondary mb-xl m-0">
            Paste notes from a previous coaching log or leadership feedback form. The AI parser will automatically generate a roleplay scenario based on your historical notes.
          </p>
          
          <textarea 
            className="form-control min-h-120px mb-md"
            placeholder="Paste coaching notes here... e.g. 'Jane is struggling with membership attach on the floor...'"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            data-testid="input-coaching-notes"
          />
          
          <button 
            className={`btn ${importSuccess ? 'btn-secondary text-success border-success' : 'btn-primary'} w-full flex-center gap-sm cursor-pointer`} 
            onClick={handleImportPastCoaching}
            data-testid="btn-parse-notes"
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
