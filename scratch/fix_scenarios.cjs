const fs = require('fs');
const path = require('path');

const tabPath = path.join(__dirname, '../src/components/Playbook/CustomScenariosTab.tsx');
let tabContent = fs.readFileSync(tabPath, 'utf8');

const imports = `import { useState } from 'react';
import { Trash2, Sparkles, Compass, Wand2, Loader2 } from 'lucide-react';
import { generateCustomScenario } from '../../services/ai';
import { useApp } from '../../context/AppContext';`;

tabContent = tabContent.replace(/import \{ useState \} from 'react';\nimport \{ Trash2, Sparkles, Compass \} from 'lucide-react';/, imports);

const hookAdditions = `  const { apiKey } = useApp();
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setAiError('');
    try {
      const generated = await generateCustomScenario(aiPrompt, apiKey?.gemini);
      setScenTitle(generated.title || '');
      setScenName(generated.name || '');
      setScenCategory(generated.category || 'Computing');
      setScenDifficulty(generated.difficulty || 'Medium');
      setScenGreeting(generated.greeting || '');
      setScenNeeds(generated.customerNeeds || '');
      setScenMembObj(generated.objections?.memberships || '');
      setScenProtObj(generated.objections?.protection || '');
      setScenCardObj(generated.objections?.creditCard || '');
      setScenConnectKw(generated.keywords?.connect || '');
      setScenDiscoverKw(generated.keywords?.discover || '');
      setScenRecommendKw(generated.keywords?.recommend || '');
      setScenProtectKw(generated.keywords?.protect || '');
      setAiPrompt('');
    } catch (err: any) {
      setAiError(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };`;

tabContent = tabContent.replace(/  const \[scenProtectKw, setScenProtectKw\] = useState\('geek squad, gsp, drop'\);/, `  const [scenProtectKw, setScenProtectKw] = useState('geek squad, gsp, drop');\n${hookAdditions}`);

const aiUi = `        </div>

        {/* AI Generator Section */}
        <div style={{ padding: '1.5rem', background: 'rgba(139, 92, 246, 0.05)', borderBottom: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Wand2 size={18} color="#8b5cf6" />
            <h4 style={{ margin: 0, fontWeight: 700, color: '#a78bfa' }}>AI Scenario Generator</h4>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe a scenario (e.g., 'An angry customer trying to return a laptop outside the policy without a receipt...')"
              style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#fff', padding: '1rem', borderRadius: '12px', minHeight: '80px', resize: 'none' }}
            />
            <button
              onClick={handleAiGenerate}
              disabled={isGenerating || !aiPrompt.trim()}
              style={{
                background: '#8b5cf6',
                color: '#fff',
                border: 'none',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                fontWeight: 700,
                cursor: (isGenerating || !aiPrompt.trim()) ? 'not-allowed' : 'pointer',
                opacity: (isGenerating || !aiPrompt.trim()) ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                whiteSpace: 'nowrap'
              }}
            >
              {isGenerating ? <Loader2 size={18} className="spin" /> : <Wand2 size={18} />}
              {isGenerating ? 'Generating...' : 'Auto-Fill'}
            </button>
          </div>
          {aiError && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{aiError}</div>}
        </div>

        <div style={{ padding: '2rem' }}>`;

tabContent = tabContent.replace(/        <\/div>\s*<div style=\{\{ padding: '2rem' \}\}>/, aiUi);

fs.writeFileSync(tabPath, tabContent);
console.log('Fixed CustomScenariosTab');
