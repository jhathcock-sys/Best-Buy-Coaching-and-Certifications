import React from 'react';

export const AVATAR_OPTIONS = [
  { label: 'Sarah (Computing)', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { label: 'David (Home Theater)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { label: 'Elena (Geek Squad)', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
  { label: 'Victor (General)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  { label: 'Jordan (Mobile)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }
];

interface Props {
  scenTitle: string; setScenTitle: (v: string) => void;
  scenName: string; setScenName: (v: string) => void;
  scenCategory: string; setScenCategory: (v: string) => void;
  scenDifficulty: string; setScenDifficulty: (v: string) => void;
  scenAvatar: string; setScenAvatar: (v: string) => void;
  scenDesc: string; setScenDesc: (v: string) => void;
  scenGreeting: string; setScenGreeting: (v: string) => void;
  scenNeeds: string; setScenNeeds: (v: string) => void;
}

export default function ScenarioBasicFields({
  scenTitle, setScenTitle,
  scenName, setScenName,
  scenCategory, setScenCategory,
  scenDifficulty, setScenDifficulty,
  scenAvatar, setScenAvatar,
  scenDesc, setScenDesc,
  scenGreeting, setScenGreeting,
  scenNeeds, setScenNeeds
}: Props) {
  return (
    <>
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
    </>
  );
}
