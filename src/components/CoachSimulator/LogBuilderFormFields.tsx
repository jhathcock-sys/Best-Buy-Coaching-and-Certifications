import React from 'react';
import { Target, CheckCircle, User, Zap, Activity, MessageSquare } from 'lucide-react';

export default function LogBuilderFormFields({ 
  builderForm, 
  setBuilderForm, 
  roster, 
  handleSpeech, 
  handleStopSpeech, 
  isPlayingSpeech, 
  isPausedSpeech 
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Basic Info */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem' }}>Employee Name</label>
          <input 
            type="text" 
            className="modern-input"
            value={builderForm.employeeName || ''}
            onChange={e => setBuilderForm({ ...builderForm, employeeName: e.target.value })}
            placeholder="e.g., John Doe"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem' }}>Metric Focus</label>
          <select 
            className="modern-input"
            value={builderForm.metricGap || 'Memberships'}
            onChange={e => setBuilderForm({ ...builderForm, metricGap: e.target.value })}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.5)', color: '#fff' }}
          >
            <option value="Memberships">Memberships</option>
            <option value="Credit Cards">Credit Cards</option>
            <option value="GSP / Warranty">GSP / Warranty</option>
            <option value="5-Star Surveys">5-Star Surveys</option>
            <option value="Revenue Per Hour">Revenue Per Hour</option>
            <option value="Basket Size">Basket Size</option>
          </select>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem' }}>DISC Focus Strategy</label>
        <select 
          className="modern-input"
          value={Array.isArray(builderForm.discFocus) ? builderForm.discFocus[0] : (builderForm.discFocus || 'Solve')}
          onChange={e => setBuilderForm({ ...builderForm, discFocus: [e.target.value] })}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.5)', color: '#fff' }}
        >
          <option value="Discover">Discover (Asking Questions)</option>
          <option value="Inspire">Inspire (Demoing & Value)</option>
          <option value="Solve">Solve (Closing & Objections)</option>
          <option value="Commit">Commit (Follow up)</option>
        </select>
      </div>

      {/* Text Areas */}
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem' }}>Observed Strengths</label>
        <textarea 
          className="modern-input"
          value={builderForm.strengths || ''}
          onChange={e => setBuilderForm({ ...builderForm, strengths: e.target.value })}
          placeholder="What did they do well during your observation?"
          rows={3}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.05)', color: '#fff', resize: 'vertical' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem' }}>Gap / Opportunity Details</label>
        <textarea 
          className="modern-input"
          value={builderForm.gapDetails || ''}
          onChange={e => setBuilderForm({ ...builderForm, gapDetails: e.target.value })}
          placeholder="What specific behavior or metric are you addressing?"
          rows={3}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.05)', color: '#fff', resize: 'vertical' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem' }}>Raw Observation Notes (Optional)</label>
        <textarea 
          className="modern-input"
          value={builderForm.rawObservation || ''}
          onChange={e => setBuilderForm({ ...builderForm, rawObservation: e.target.value })}
          placeholder="Paste unformatted or rough notes here, and the AI will parse them..."
          rows={3}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.05)', color: '#fff', resize: 'vertical' }}
        />
      </div>

    </div>
  );
}
