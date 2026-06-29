import React from 'react';

interface Props {
  scenMembObj: string; setScenMembObj: (v: string) => void;
  scenProtObj: string; setScenProtObj: (v: string) => void;
  scenCardObj: string; setScenCardObj: (v: string) => void;
}

export default function ScenarioObjectionsFields({
  scenMembObj, setScenMembObj,
  scenProtObj, setScenProtObj,
  scenCardObj, setScenCardObj
}: Props) {
  return (
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
  );
}
