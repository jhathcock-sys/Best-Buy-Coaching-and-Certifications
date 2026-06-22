import { useState } from 'react';
import { Trash2, Sparkles, Compass, Wand2, Loader2 } from 'lucide-react';
import { generateCustomScenario } from '../../services/ai';
import { useApp } from '../../context/AppContext';
import { useStore } from '../../store/useStore';

export default function CustomScenariosTab({ customScenarios = [], onAddCustomScenario, onDeleteCustomScenario }) {
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
  const apiKey = useStore((state) => state.apiKey);
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
  };
  const [scenCloseKw, setScenCloseKw] = useState('finance, card, rewards');

  const AVATAR_OPTIONS = [
    { label: 'Sarah (Computing)', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { label: 'David (Home Theater)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { label: 'Elena (Geek Squad)', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
    { label: 'Victor (General)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    { label: 'Jordan (Mobile)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }
  ];

  const handleCreateScenario = (e) => {
    e.preventDefault();
    if (!scenTitle.trim() || !scenName.trim() || !scenGreeting.trim()) {
      alert("Scenario Title, Customer Name, and Initial Greeting are required!");
      return;
    }

    const cleanKeywords = (str) => {
      return str.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
    };

    const newScenario = {
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

    if (onAddCustomScenario) {
      onAddCustomScenario(newScenario);
      alert(`Custom Scenario "${scenTitle}" created successfully! It is now selectable in the Consult Arena.`);
      
      // Reset fields
      setScenTitle('');
      setScenName('');
      setScenDesc('');
      setScenGreeting('');
      setScenNeeds('');
      setScenMembObj('');
      setScenProtObj('');
      setScenCardObj('');
    }
  };


  return (
    <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          <form onSubmit={handleCreateScenario} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--bby-yellow)', margin: 0 }}>
              <Sparkles size={20} color="var(--bby-yellow)" /> Create Custom Scenario
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Scenario Title:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Computing: Mac Upgrade"
                  value={scenTitle} 
                  onChange={(e) => setScenTitle(e.target.value)}
                  required
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
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Product Category:</label>
                <select 
                  className="form-control"
                  value={scenCategory}
                  onChange={(e) => setScenCategory(e.target.value)}
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
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Choose Customer Avatar:</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                {AVATAR_OPTIONS.map((opt, idx) => (
                  <img 
                    key={idx}
                    src={opt.url}
                    alt={opt.label}
                    title={opt.label}
                    onClick={() => setScenAvatar(opt.url)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      border: scenAvatar === opt.url ? '2.5px solid var(--bby-yellow)' : '1px solid var(--border-glass)',
                      boxShadow: scenAvatar === opt.url ? '0 0 10px rgba(253,216,53,0.3)' : 'none',
                      transition: 'all 0.2s'
                    }}
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
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Customer Greeting (Dialogue):</label>
              <textarea 
                className="form-control" 
                rows={3}
                style={{ resize: 'none' }}
                placeholder="e.g. Hi, I need to get a new Apple laptop for video editing at film school, but they look so expensive..."
                value={scenGreeting}
                onChange={(e) => setScenGreeting(e.target.value)}
                required
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
              />
            </div>

            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--bby-yellow)', marginBottom: '1rem' }}>Dialogue Objections (Text prompts)</h4>
              
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Membership Objection:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. I don't buy enough here to justify a yearly fee."
                  value={scenMembObj}
                  onChange={(e) => setScenMembObj(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Protection Objection:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Apple laptops are solid, why would I need Geek Squad?"
                  value={scenProtObj}
                  onChange={(e) => setScenProtObj(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Credit Card Objection:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. I already have too many store cards, no thanks."
                  value={scenCardObj}
                  onChange={(e) => setScenCardObj(e.target.value)}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--success)', marginBottom: '0.75rem' }}>Success Keywords (Separated by commas)</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Connect Step:</label>
                  <input type="text" className="form-control" value={scenConnectKw} onChange={(e) => setScenConnectKw(e.target.value)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Discover Step:</label>
                  <input type="text" className="form-control" value={scenDiscoverKw} onChange={(e) => setScenDiscoverKw(e.target.value)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Recommend Step:</label>
                  <input type="text" className="form-control" value={scenRecommendKw} onChange={(e) => setScenRecommendKw(e.target.value)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Protect Step:</label>
                  <input type="text" className="form-control" value={scenProtectKw} onChange={(e) => setScenProtectKw(e.target.value)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Close Step:</label>
                  <input type="text" className="form-control" value={scenCloseKw} onChange={(e) => setScenCloseKw(e.target.value)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '1rem' }}>
              Create & Install Roleplay Scenario
            </button>
          </form>

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
                customScenarios.map((scen) => (
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