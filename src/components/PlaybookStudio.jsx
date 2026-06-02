import React, { useState } from 'react';
import { ShieldAlert, Sparkles, Key, Check, Plus, Trash2, BookOpen, Compass } from 'lucide-react';

export default function PlaybookStudio({ apiKey, playbookSettings, onSaveSettings, deptGoals = {}, onSaveDeptGoals }) {
  const [useGemini, setUseGemini] = useState(playbookSettings.useGemini);
  const [localApiKey, setLocalApiKey] = useState(apiKey || '');
  const [customSystemPrompt, setCustomSystemPrompt] = useState(playbookSettings.customSystemPrompt || '');
  
  const [selectedDept, setSelectedDept] = useState('Front End');
  const [editedGoals, setEditedGoals] = useState({ ...deptGoals });

  React.useEffect(() => {
    setEditedGoals({ ...deptGoals });
  }, [deptGoals]);

  const handleGoalChange = (metric, val) => {
    const isTypeField = metric.endsWith('Type');
    const processedVal = isTypeField ? val : (parseFloat(val) || 0);
    setEditedGoals(prev => ({
      ...prev,
      [selectedDept]: {
        ...prev[selectedDept],
        [metric]: processedVal
      }
    }));
  };

  const handleSaveGoals = () => {
    if (onSaveDeptGoals) {
      onSaveDeptGoals(editedGoals);
      alert(`${selectedDept} performance goals updated successfully!`);
    }
  };

  const [allowedPhrases, setAllowedPhrases] = useState(playbookSettings.allowedPhrases || [
    'My Best Buy Plus', 'My Best Buy Total', 'Geek Squad Protection', 'AppleCare+'
  ]);
  const [forbiddenPhrases, setForbiddenPhrases] = useState(playbookSettings.forbiddenPhrases || [
    'warranty', 'pushy', 'contract'
  ]);

  const [newAllowed, setNewAllowed] = useState('');
  const [newForbidden, setNewForbidden] = useState('');
  
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAddAllowed = () => {
    if (!newAllowed.trim()) return;
    setAllowedPhrases([...allowedPhrases, newAllowed.trim()]);
    setNewAllowed('');
  };

  const handleAddForbidden = () => {
    if (!newForbidden.trim()) return;
    setForbiddenPhrases([...forbiddenPhrases, newForbidden.trim()]);
    setNewForbidden('');
  };

  const handleRemoveAllowed = (idx) => {
    setAllowedPhrases(allowedPhrases.filter((_, i) => i !== idx));
  };

  const handleRemoveForbidden = (idx) => {
    setForbiddenPhrases(forbiddenPhrases.filter((_, i) => i !== idx));
  };

  const [trainingLogs, setTrainingLogs] = useState(playbookSettings.trainingLogs || [
    `### BEST BUY COACHING LOG: RICKY
Focus: 5-Star Surveys

--------------------------------------------------
1. THE CORE OBJECTIVE (WHAT / HOW / WHY)
--------------------------------------------------
* WHAT we need them to do:
  Deliver a warmer checkout experience and explicitly ask for 5-star survey feedback at checkout.

* HOW we need them to do it:
  Slow down, write your name on the receipt sleeve, make direct eye contact, and say: "I hope I made your shopping easy today. My name is Ricky; please take 30 seconds to let me know how I did on the 5-star survey!"

* WHY we need them to do it:
  Ensures customer loyalty, measures our store service indices, and highlights excellent human work on the checkout floor.

--------------------------------------------------
2. CURRENT STRENGTHS (DOING WELL)
--------------------------------------------------
* What they are currently doing well:
  Excellent transactional speeds, zero cashier queue backlog, and highly professional checkout processing.

--------------------------------------------------
3. PERFORMANCE METRIC GAP
--------------------------------------------------
* Gap we are trying to fill:
  Ricky has 0 CSAT ratings this month (store standard is maintaining 2+ five-star survey mentions per week).

--------------------------------------------------
4. EXPECTATIONS & VALIDATION METHOD
--------------------------------------------------
* Expectation of results:
  Secure at least 2 five-star survey mentions this week and maintain a 4.8+ survey average.

* How we will validate:
  Leader will perform 3 checkout observations this week and review the Sunday CSAT comment log.`
  ]);
  const [newTrainingLog, setNewTrainingLog] = useState('');
  const [isAddingLog, setIsAddingLog] = useState(false);

  const handleAddTrainingLog = () => {
    if (!newTrainingLog.trim()) return;
    setTrainingLogs([...trainingLogs, newTrainingLog.trim()]);
    setNewTrainingLog('');
    setIsAddingLog(false);
  };

  const handleRemoveTrainingLog = (idx) => {
    setTrainingLogs(trainingLogs.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    onSaveSettings({
      apiKey: localApiKey,
      playbookSettings: {
        useGemini: useGemini && localApiKey.trim().length > 10,
        customSystemPrompt,
        allowedPhrases,
        forbiddenPhrases,
        trainingLogs
      }
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Playbook Studio</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Train the AI. Customize instructions, toggle dual-mode sandbox vs generative engines, and manage coaching vocabulary rules.</p>
        </div>
        <button className="btn btn-accent" onClick={handleSave}>
          Save Configuration
        </button>
      </div>

      {saveSuccess && (
        <div style={{ padding: '1rem 1.5rem', background: 'var(--success-glow)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', fontSize: '0.9rem', color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={18} /> Playbook Configurations Saved Successfully! Changes are now active across all simulators.
        </div>
      )}

      {/* Main Form Fields */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Left Column: API & Engine Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Engine Mode Card */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={20} color="var(--bby-blue)" /> Simulation Engine Strategy
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Radio Engine Mode Selector */}
              <div 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.75rem', 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid var(--border-glass)',
                  padding: '1.25rem', 
                  borderRadius: '16px' 
                }}
              >
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="engine_mode" 
                    checked={!useGemini} 
                    onChange={() => setUseGemini(false)}
                    style={{ marginTop: '0.25rem' }}
                  />
                  <div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Default Local Sandbox Engine (100% Free)</span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.4 }}>
                      Runs entirely client-side inside the browser. Extremely fast, requires no tokens, works anywhere offline, and parses advisor answers through state-based NLP mapping.
                    </p>
                  </div>
                </label>
              </div>

              <div 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.75rem', 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid var(--border-glass)',
                  padding: '1.25rem', 
                  borderRadius: '16px' 
                }}
              >
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="engine_mode" 
                    checked={useGemini} 
                    onChange={() => setUseGemini(true)}
                    style={{ marginTop: '0.25rem' }}
                  />
                  <div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      Generative Gemini Engine <Sparkles size={12} color="var(--bby-yellow)" />
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.4 }}>
                      Enables open-ended fluid conversation roleplays. Requires a Google AI Studio API key. Runs completely on the free-tier limits, resulting in zero overall token spend.
                    </p>
                  </div>
                </label>
              </div>

              {/* API Key Box */}
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label className="form-label">Google AI Studio API Key:</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder={useGemini ? "Enter your Gemini API key (AIzaSy...)" : "API Key optional in Sandbox mode"}
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                />
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Your key is securely saved locally in your own browser's storage and never sent to any external server (except directly to the Google Gemini API endpoint).
                </p>
              </div>

            </div>
          </div>

          {/* System Instructions / Prompt Engineering Card */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="var(--info)" /> AI System Prompts Configurator
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              Provide the custom instructions that train the Gemini generative engine how to coach and evaluate like your store leaders would.
            </p>

            <div className="form-group">
              <label className="form-label">Coaching & Empathy Prompt Instructions:</label>
              <textarea 
                className="form-control" 
                rows={6}
                style={{ resize: 'none', fontSize: '0.85rem' }}
                placeholder="Ensure you lead with humanity. Coach advisors to explore the customer needs by congratulated them first, and offering protection by describing usage scenarios rather than pitch checklist lines..."
                value={customSystemPrompt}
                onChange={(e) => setCustomSystemPrompt(e.target.value)}
              />
            </div>
          </div>

        </div>

        {/* Right Column: Allowed / Forbidden Dictionaries */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} color="var(--bby-yellow)" /> Vocabulary Rule Dictionaries
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              Specify the preferred terminology advisors should use and the forbidden retail jargon they should avoid during customer conversations.
            </p>
          </div>

          {/* Preferred Allowed Phrases */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--success)' }}>Preferred / Allowed Terms</h4>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                className="form-control" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                placeholder="Add preferred word (e.g. My Best Buy Total)"
                value={newAllowed}
                onChange={(e) => setNewAllowed(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddAllowed()}
              />
              <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={handleAddAllowed}>
                <Plus size={16} />
              </button>
            </div>

            <div className="chip-container">
              {allowedPhrases.map((phrase, idx) => (
                <span key={idx} className="chip allowed">
                  {phrase}
                  <Trash2 
                    size={12} 
                    style={{ cursor: 'pointer', marginLeft: '0.25rem' }} 
                    onClick={() => handleRemoveAllowed(idx)} 
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Forbidden Prohibited Phrases */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--error)' }}>Forbidden Retail Jargon</h4>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                className="form-control" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                placeholder="Add forbidden word (e.g. warranty)"
                value={newForbidden}
                onChange={(e) => setNewForbidden(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddForbidden()}
              />
              <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={handleAddForbidden}>
                <Plus size={16} />
              </button>
            </div>

            <div className="chip-container">
              {forbiddenPhrases.map((phrase, idx) => (
                <span key={idx} className="chip forbidden">
                  {phrase}
                  <Trash2 
                    size={12} 
                    style={{ cursor: 'pointer', marginLeft: '0.25rem' }} 
                    onClick={() => handleRemoveForbidden(idx)} 
                  />
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Department Specific Goals Configurator Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--bby-yellow)' }}>
            <Compass size={20} color="var(--bby-yellow)" /> Department Goals Configurator
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4 }}>
            Adapt store benchmarks dynamically by department. These goals are utilized across your roster dynamic audits and simulator scoring!
          </p>

          <div className="form-group">
            <label className="form-label">Select Department to Configure:</label>
            <select 
              className="form-control"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            >
              {Object.keys(deptGoals || {}).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', padding: '1rem', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Editing targets for {selectedDept}
            </span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.25rem' }}>
              
              {/* Memberships Config Section */}
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '10px' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#fff', display: 'block', marginBottom: '0.5rem' }}>
                  Memberships (Plus/Total) Evaluation
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <select 
                      className="form-control"
                      value={editedGoals[selectedDept]?.membershipsType || 'Hours'}
                      onChange={(e) => handleGoalChange('membershipsType', e.target.value)}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    >
                      <option value="Hours">Hours worked (1 per X hrs)</option>
                      <option value="Dollars">Dollar sales (1 per $D sales)</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <input 
                      type="number" 
                      className="form-control"
                      value={editedGoals[selectedDept]?.memberships || 0}
                      onChange={(e) => handleGoalChange('memberships', e.target.value)}
                      placeholder="Target value"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Credit Cards Config Section */}
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '10px' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#fff', display: 'block', marginBottom: '0.5rem' }}>
                  BBY Credit Cards (Apps) Evaluation
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <select 
                      className="form-control"
                      value={editedGoals[selectedDept]?.creditCardsType || 'Hours'}
                      onChange={(e) => handleGoalChange('creditCardsType', e.target.value)}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    >
                      <option value="Hours">Hours worked (1 per X hrs)</option>
                      <option value="Dollars">Dollar sales (1 per $D sales)</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <input 
                      type="number" 
                      className="form-control"
                      value={editedGoals[selectedDept]?.creditCards || 0}
                      onChange={(e) => handleGoalChange('creditCards', e.target.value)}
                      placeholder="Target value"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic GSP & CSAT Section */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.725rem' }}>GSP Attach % Goal:</label>
                  <input 
                    type="number" 
                    step="0.1"
                    className="form-control"
                    value={editedGoals[selectedDept]?.warranty || 0}
                    onChange={(e) => handleGoalChange('warranty', e.target.value)}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.725rem' }}>CSAT surveys Goal:</label>
                  <input 
                    type="number" 
                    step="0.1"
                    className="form-control"
                    value={editedGoals[selectedDept]?.surveys || 0}
                    onChange={(e) => handleGoalChange('surveys', e.target.value)}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.725rem' }}>RPH index Target ($/hr):</label>
              <input 
                type="number" 
                className="form-control"
                value={editedGoals[selectedDept]?.rph || 0}
                onChange={(e) => handleGoalChange('rph', e.target.value)}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              />
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }} onClick={handleSaveGoals}>
              Save {selectedDept} Targets
            </button>
          </div>
        </div>

      </div>

      {/* Dynamic Style Training Corpus Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', marginTop: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="var(--bby-yellow)" /> Style & Training Corpus (Few-Shot Exemplars)
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', lineHeight: 1.4 }}>
            Provide examples of high-quality coaching logs you have written in the past. When using the **Gemini Engine**, these logs are fed directly into the model as few-shot training examples, prompting it to perfectly copy your formatting, coaching style, tone, standards, and metrics vocabulary!
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Training Logs List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {trainingLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed var(--border-glass)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No custom training logs added. Preloading Best Buy default framework.
              </div>
            ) : (
              trainingLogs.map((log, idx) => (
                <div key={idx} style={{ position: 'relative', background: 'rgba(0, 70, 190, 0.03)', border: '1px solid var(--border-glass)', borderRadius: '14px', padding: '1.25rem 2.5rem 1.25rem 1.25rem' }}>
                  <button 
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: 0 }}
                    onClick={() => handleRemoveTrainingLog(idx)}
                    title="Remove Training Exemplar"
                  >
                    <Trash2 size={16} />
                  </button>
                  <span style={{ fontSize: '0.7rem', color: 'var(--bby-yellow)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                    Exemplar #{idx + 1}
                  </span>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {log}
                  </pre>
                </div>
              ))
            )}
          </div>

          {/* Add Exemplar Box */}
          {isAddingLog ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', border: '1px solid var(--bby-blue)', borderRadius: '14px', background: 'rgba(0, 70, 190, 0.02)' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#fff' }}>Paste Exemplar Coaching Log Text:</label>
                <textarea 
                  className="form-control" 
                  rows={8} 
                  style={{ resize: 'none', fontSize: '0.8rem', fontFamily: 'monospace' }}
                  placeholder="Paste a complete 4-section coaching log that represents your personal writing style..."
                  value={newTrainingLog}
                  onChange={(e) => setNewTrainingLog(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => setIsAddingLog(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={handleAddTrainingLog}>
                  Add Exemplar to Corpus
                </button>
              </div>
            </div>
          ) : (
            <button className="btn btn-secondary" style={{ width: '100%', borderStyle: 'dashed' }} onClick={() => setIsAddingLog(true)}>
              + Add Past Coaching Exemplar to Training Corpus
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
