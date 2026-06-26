import React, { useState } from 'react';
import { Sparkles, Wand2, Loader2 } from 'lucide-react';
import { generateCustomScenario } from '../../services/ai';
import { useStore } from '../../store/useStore';
import { StoreState } from '../../types/store';
import { CustomScenario } from '../../types/index';
import { useShallow } from 'zustand/react/shallow';

export default function CustomScenarioForm() {
  const [scenTitle, setScenTitle] = useState('');
  const [scenName, setScenName] = useState('');
  const [scenAvatar, setScenAvatar] = useState('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150');
  const [scenDesc, setScenDesc] = useState('');
  const [scenCategory, setScenCategory] = useState('Computing');
  const [scenDifficulty, setScenDifficulty] = useState('Medium');
  const [scenGreeting, setScenGreeting] = useState('');
  const [scenNeeds, setScenNeeds] = useState('');
  const [scenMembObj, setScenMembObj] = useState('');
  const [scenProtObj, setScenProtObj] = useState('');
  const [scenCardObj, setScenCardObj] = useState('');
  const [scenConnectKw, setScenConnectKw] = useState('hello, hi, congrats');
  const [scenDiscoverKw, setScenDiscoverKw] = useState('major, engineering, budget');
  const [scenRecommendKw, setScenRecommendKw] = useState('laptop, total, membership');
  const [scenProtectKw, setScenProtectKw] = useState('geek squad, gsp, drop');
  const [scenCloseKw, setScenCloseKw] = useState('finance, card, rewards');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const { apiKey, importCustomScenario } = useStore(useShallow((state: StoreState) => ({
    apiKey: state.apiKey,
    importCustomScenario: state.importCustomScenario
  })));

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setAiError('');
    try {
      const generated = await generateCustomScenario(aiPrompt, apiKey);
      setScenTitle(generated?.title || '');
      setScenName(generated?.name || '');
      setScenCategory(generated?.category || 'Computing');
      setScenDifficulty(generated?.difficulty || 'Medium');
      setScenGreeting(generated?.greeting || '');
      setScenNeeds(generated?.customerNeeds || '');
      setScenMembObj(generated?.objections?.memberships || '');
      setScenProtObj(generated?.objections?.protection || '');
      setScenCardObj(generated?.objections?.creditCard || '');
      setScenConnectKw(generated?.keywords?.connect || '');
      setScenDiscoverKw(generated?.keywords?.discover || '');
      setScenRecommendKw(generated?.keywords?.recommend || '');
      setScenProtectKw(generated?.keywords?.protect || '');
      setAiPrompt('');
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const AVATAR_OPTIONS = [
    { label: 'Sarah (Computing)', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { label: 'David (Home Theater)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { label: 'Elena (Geek Squad)', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
    { label: 'Victor (General)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    { label: 'Jordan (Mobile)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }
  ];

  const handleCreateScenario = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!scenTitle.trim() || !scenName.trim() || !scenGreeting.trim()) {
      setFormError("Scenario Title, Customer Name, and Initial Greeting are required!");
      return;
    }

    const cleanKeywords = (str: string) => {
      return str.split(',').map((k: string) => k.trim().toLowerCase()).filter((k: string) => k.length > 0);
    };

    const newScenario: CustomScenario = {
      id: 'cust_' + Date.now(),
      title: scenTitle.trim(),
      role: 'Customer',
      name: scenName.trim(),
      avatar: scenAvatar,
      description: scenDesc.trim() || `${scenName} shopping in ${scenCategory}.`,
      category: scenCategory,
      difficulty: scenDifficulty,
      initialGreeting: scenGreeting.trim(),
      needs: scenNeeds.trim() || 'General consultative assistance.',
      objections: {
        membership: scenMembObj.trim() || "Why does a membership cost so much?",
        warranty: scenProtObj.trim() || "Doesn't it already come with a warranty?",
        card: scenCardObj.trim() || "I don't think I need another credit card."
      },
      successKeywords: {
        connect: cleanKeywords(scenConnectKw),
        discover: cleanKeywords(scenDiscoverKw),
        recommend: cleanKeywords(scenRecommendKw),
        protect: cleanKeywords(scenProtectKw),
        close: cleanKeywords(scenCloseKw)
      }
    };

    if (importCustomScenario) {
      importCustomScenario(newScenario);
      setFormSuccess(`Custom Scenario "${scenTitle}" created successfully!`);
      
      setScenTitle('');
      setScenName('');
      setScenDesc('');
      setScenGreeting('');
      setScenNeeds('');
      setScenMembObj('');
      setScenProtObj('');
      setScenCardObj('');
    } else {
      setFormError("Store missing importCustomScenario action.");
    }
  };

  return (
    <form onSubmit={handleCreateScenario} className="glass-card flex-column gap-xl p-xl" data-testid="custom-scenario-form">
      <h3 className="text-xl flex-center justify-start gap-sm text-[var(--bby-yellow)] m-0">
        <Sparkles size={20} color="var(--bby-yellow)" /> Create Custom Scenario
      </h3>
      
      {formError && <div className="bg-red-500/10 border border-red-500/20 text-error p-sm rounded-md text-sm">{formError}</div>}
      {formSuccess && <div className="bg-green-500/10 border border-green-500/20 text-success p-sm rounded-md text-sm">{formSuccess}</div>}

      {/* AI Generator Box */}
      <div className="bg-yellow-500/5 border border-yellow-500/20 p-md rounded-xl flex-column gap-sm">
        <h4 className="m-0 text-sm text-[var(--bby-yellow)] flex-center justify-start gap-xs">
          <Wand2 size={16} /> Auto-Generate with AI
        </h4>
        <p className="m-0 text-xs text-secondary">Describe a scenario and let Gemini build out the customer profile and objections.</p>
        <div className="flex gap-sm">
          <input 
            type="text" 
            className="form-control flex-1" 
            placeholder="e.g. An angry customer trying to return a laptop past policy..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            data-testid="scenario-ai-prompt-input"
          />
          <button 
            type="button" 
            className="btn btn-secondary flex-center gap-xs whitespace-nowrap" 
            onClick={handleAiGenerate}
            disabled={isGenerating || !aiPrompt.trim()}
            data-testid="scenario-ai-generate-btn"
          >
            {isGenerating ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
            Generate
          </button>
        </div>
        {aiError && <span className="text-error text-xs">{aiError}</span>}
      </div>

      <div className="grid grid-cols-2 gap-md">
        <div className="form-group">
          <label className="form-label">Scenario Title:</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="e.g. Computing: Mac Upgrade"
            value={scenTitle} 
            onChange={(e) => setScenTitle(e.target.value)}
            required
            data-testid="scenario-title-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Customer Name:</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="e.g. Marcus Vance"
            value={scenName} 
            onChange={(e) => setScenName(e.target.value)}
            required
            data-testid="scenario-name-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-md">
        <div className="form-group">
          <label className="form-label">Product Category:</label>
          <select 
            className="form-control"
            value={scenCategory}
            onChange={(e) => setScenCategory(e.target.value)}
            data-testid="scenario-category-select"
          >
            <option value="Computing">Computing</option>
            <option value="Home Theater">Home Theater</option>
            <option value="Geek Squad Services">Geek Squad Services</option>
            <option value="Mobile">Mobile</option>
            <option value="Appliances">Appliances</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Difficulty:</label>
          <select 
            className="form-control"
            value={scenDifficulty}
            onChange={(e) => setScenDifficulty(e.target.value)}
            data-testid="scenario-difficulty-select"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Choose Customer Avatar:</label>
        <div className="flex gap-sm flex-wrap mt-1">
          {AVATAR_OPTIONS.map((opt, idx) => (
            <img 
              key={idx}
              src={opt.url}
              alt={opt.label}
              title={opt.label}
              onClick={() => setScenAvatar(opt.url)}
              className={`w-10 h-10 rounded-full cursor-pointer transition-all ${scenAvatar === opt.url ? 'border-[2.5px] border-[var(--bby-yellow)] shadow-[0_0_10px_rgba(253,216,53,0.3)]' : 'border border-[var(--border-glass)]'}`}
              data-testid={`scenario-avatar-opt-${idx}`}
            />
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Scenario Context Description:</label>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Marcus wants to buy a Mac for video editing but has budget limits..."
          value={scenDesc}
          onChange={(e) => setScenDesc(e.target.value)}
          data-testid="scenario-desc-input"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Initial Customer Greeting (Dialogue):</label>
        <textarea 
          className="form-control resize-none" 
          rows={3}
          placeholder="e.g. Hi, I need to get a new Apple laptop for video editing at film school, but they look so expensive..."
          value={scenGreeting}
          onChange={(e) => setScenGreeting(e.target.value)}
          required
          data-testid="scenario-greeting-input"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Customer Specific Needs / Focus:</label>
        <input 
          type="text" 
          className="form-control" 
          placeholder="High RAM, graphic speed, M3 chip preference..."
          value={scenNeeds}
          onChange={(e) => setScenNeeds(e.target.value)}
          data-testid="scenario-needs-input"
        />
      </div>

      <div className="border-t border-[var(--border-glass)] pt-xl">
        <h4 className="text-md text-[var(--bby-yellow)] mb-md">Dialogue Objections (Text prompts)</h4>
        
        <div className="form-group mb-md">
          <label className="form-label text-xs">Membership Objection:</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="e.g. I don't buy enough here to justify a yearly fee."
            value={scenMembObj}
            onChange={(e) => setScenMembObj(e.target.value)}
            data-testid="scenario-memb-obj-input"
          />
        </div>
        <div className="form-group mb-md">
          <label className="form-label text-xs">Protection Objection:</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="e.g. Apple laptops are solid, why would I need Geek Squad?"
            value={scenProtObj}
            onChange={(e) => setScenProtObj(e.target.value)}
            data-testid="scenario-prot-obj-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label text-xs">Credit Card Objection:</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="e.g. I already have too many store cards, no thanks."
            value={scenCardObj}
            onChange={(e) => setScenCardObj(e.target.value)}
            data-testid="scenario-card-obj-input"
          />
        </div>
      </div>

      <div className="border-t border-[var(--border-glass)] pt-xl">
        <h4 className="text-md text-success mb-sm">Success Keywords (Separated by commas)</h4>
        
        <div className="flex-column gap-sm">
          <div className="form-group m-0">
            <label className="form-label text-xs">Connect Step:</label>
            <input type="text" className="form-control px-md py-sm text-sm" value={scenConnectKw} onChange={(e) => setScenConnectKw(e.target.value)} data-testid="scenario-connect-kw-input" />
          </div>
          <div className="form-group m-0">
            <label className="form-label text-xs">Discover Step:</label>
            <input type="text" className="form-control px-md py-sm text-sm" value={scenDiscoverKw} onChange={(e) => setScenDiscoverKw(e.target.value)} data-testid="scenario-discover-kw-input" />
          </div>
          <div className="form-group m-0">
            <label className="form-label text-xs">Recommend Step:</label>
            <input type="text" className="form-control px-md py-sm text-sm" value={scenRecommendKw} onChange={(e) => setScenRecommendKw(e.target.value)} data-testid="scenario-recommend-kw-input" />
          </div>
          <div className="form-group m-0">
            <label className="form-label text-xs">Protect Step:</label>
            <input type="text" className="form-control px-md py-sm text-sm" value={scenProtectKw} onChange={(e) => setScenProtectKw(e.target.value)} data-testid="scenario-protect-kw-input" />
          </div>
          <div className="form-group m-0">
            <label className="form-label text-xs">Close Step:</label>
            <input type="text" className="form-control px-md py-sm text-sm" value={scenCloseKw} onChange={(e) => setScenCloseKw(e.target.value)} data-testid="scenario-close-kw-input" />
          </div>
        </div>
      </div>

      <button type="submit" className="btn btn-primary w-full p-md mt-md" disabled={isGenerating} data-testid="scenario-submit-btn">
        Create & Install Roleplay Scenario
      </button>
    </form>
  );
}
