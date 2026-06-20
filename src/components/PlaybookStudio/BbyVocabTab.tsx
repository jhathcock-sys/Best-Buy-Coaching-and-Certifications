import React from 'react';
import { BookOpen, ShieldAlert } from 'lucide-react';

export default function BbyVocabTab() {
  return (
    <>
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={20} color="var(--bby-yellow)" /> Vocabulary Rule Dictionaries
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Specify the preferred terminology advisors should use and the forbidden retail jargon they should avoid during customer conversations.
              </p>
            </div>

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
        
      </div>
    </>
  );
}
