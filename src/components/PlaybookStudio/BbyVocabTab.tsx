import React, { useState } from 'react';
import { BookOpen, ShieldAlert, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { StoreState } from '../../types/store';


export default function BbyVocabTab() {
  const playbookSettings = useStore((state: StoreState) => state.playbookSettings);
  const setPlaybookSettings = useStore((state: StoreState) => state.setPlaybookSettings);

  const [newAllowed, setNewAllowed] = useState('');
  const [newForbidden, setNewForbidden] = useState('');

  const allowedPhrases = playbookSettings?.allowedPhrases || [];
  const forbiddenPhrases = playbookSettings?.forbiddenPhrases || [];

  const handleAddAllowed = () => {
    if (!playbookSettings || !newAllowed.trim() || allowedPhrases.includes(newAllowed.trim())) return;
    setPlaybookSettings({
      ...playbookSettings,
      allowedPhrases: [...allowedPhrases, newAllowed.trim()]
    });
    setNewAllowed('');
  };

  const handleRemoveAllowed = (index: number) => {
    if (!playbookSettings) return;
    const arr = [...allowedPhrases];
    arr.splice(index, 1);
    setPlaybookSettings({
      ...playbookSettings,
      allowedPhrases: arr
    });
  };

  const handleAddForbidden = () => {
    if (!playbookSettings || !newForbidden.trim() || forbiddenPhrases.includes(newForbidden.trim())) return;
    setPlaybookSettings({
      ...playbookSettings,
      forbiddenPhrases: [...forbiddenPhrases, newForbidden.trim()]
    });
    setNewForbidden('');
  };

  const handleRemoveForbidden = (index: number) => {
    if (!playbookSettings) return;
    const arr = [...forbiddenPhrases];
    arr.splice(index, 1);
    setPlaybookSettings({
      ...playbookSettings,
      forbiddenPhrases: arr
    });
  };

  if (!playbookSettings) {
    return (
      <div className="flex-center p-3xl text-secondary">
        Loading vocabulary dictionary...
      </div>
    );
  }

  return (
    <>
        <div className="w-full max-w-[800px] mx-auto" data-testid="bby-vocab-tab">
          <div className="glass-card flex-column gap-xl p-xl">
            <div>
              <h3 className="text-xl mb-sm flex-center-y gap-sm">
                <ShieldAlert size={20} color="var(--bby-yellow)" /> Vocabulary Rule Dictionaries
              </h3>
              <p className="text-sm text-secondary">
                Specify the preferred terminology advisors should use and the forbidden retail jargon they should avoid during customer conversations.
              </p>
            </div>

            <div className="flex-column gap-md">
              <h4 className="text-md text-success m-0">Preferred / Allowed Terms</h4>
              
              <div className="flex gap-sm">
                <input 
                  type="text" 
                  className="form-control flex-1" 
                  placeholder="Add preferred word (e.g. My Best Buy Total)"
                  value={newAllowed}
                  onChange={(e) => setNewAllowed(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAllowed()}
                  data-testid="vocab-allowed-input"
                />
                <button 
                  className="btn btn-secondary px-md" 
                  onClick={handleAddAllowed}
                  data-testid="vocab-allowed-add-btn"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="flex flex-wrap gap-sm mt-xs">
                {allowedPhrases.map((phrase: string, idx: number) => (
                  <span key={idx} className="chip bg-green-500/10 text-success border border-green-500/20 px-sm py-xs rounded-full text-xs flex-center-y gap-xs" data-testid={`vocab-allowed-chip-${idx}`}>
                    {phrase}
                    <Trash2 
                      size={12} 
                      className="cursor-pointer ml-xs hover:text-white transition-colors" 
                      onClick={() => handleRemoveAllowed(idx)} 
                      data-testid={`vocab-allowed-delete-${idx}`}
                    />
                  </span>
                ))}
              </div>
            </div>

            <div className="flex-column gap-md border-t border-[var(--border-glass)] pt-xl mt-sm">
              <h4 className="text-md text-error m-0">Forbidden Retail Jargon</h4>
              
              <div className="flex gap-sm">
                <input 
                  type="text" 
                  className="form-control flex-1" 
                  placeholder="Add forbidden word (e.g. warranty)"
                  value={newForbidden}
                  onChange={(e) => setNewForbidden(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddForbidden()}
                  data-testid="vocab-forbidden-input"
                />
                <button 
                  className="btn btn-secondary px-md" 
                  onClick={handleAddForbidden}
                  data-testid="vocab-forbidden-add-btn"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="flex flex-wrap gap-sm mt-xs">
                {forbiddenPhrases.map((phrase: string, idx: number) => (
                  <span key={idx} className="chip bg-red-500/10 text-error border border-red-500/20 px-sm py-xs rounded-full text-xs flex-center-y gap-xs" data-testid={`vocab-forbidden-chip-${idx}`}>
                    {phrase}
                    <Trash2 
                      size={12} 
                      className="cursor-pointer ml-xs hover:text-white transition-colors" 
                      onClick={() => handleRemoveForbidden(idx)} 
                      data-testid={`vocab-forbidden-delete-${idx}`}
                    />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
    </>
  );
}
