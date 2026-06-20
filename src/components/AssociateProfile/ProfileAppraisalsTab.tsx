import React from 'react';
import { TrendingUp, ClipboardList, Calendar, Volume2, Square, Clock, AlertCircle, CheckCircle, FileText, Loader2 } from 'lucide-react';
import MetricSparkline from '../MetricSparkline';

export default function ProfileAppraisalsTab({ 
  employee,
  rosterHistory,
  activePeriod,
  activeHistoryPoints,
  associateLogs,
  associateTasks,
  associateShifts,
  associateSimulations,
  getRankAndPercentile,
  calculateCVI,
  renderMarkdown,
  playingLogId,
  setPlayingLogId,
  handlePlayAudio
 }) {
  return (
    <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.25s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1.1rem', color: '#fff', margin: 0 }}>Monthly Performance Appraisal</h4>
                <button
                  onClick={handleGenerateReview}
                  disabled={isGeneratingReview}
                  style={{
                    background: 'var(--bby-blue)',
                    color: '#fff',
                    border: 'none',
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: isGeneratingReview ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: isGeneratingReview ? 0.7 : 1,
                    transition: 'all 0.2s ease'
                  }}
                  className="hover-scale"
                >
                  {isGeneratingReview ? <Loader2 size={16} className="spin" /> : <FileText size={16} />}
                  {isGeneratingReview ? 'Drafting...' : 'Draft Monthly Review'}
                </button>
              </div>

              <div style={{ 
                padding: '1.5rem', 
                borderRadius: '12px', 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid var(--border-glass)',
                minHeight: '200px',
                color: 'var(--text-secondary)'
              }}>
                {!generatedReview && !isGeneratingReview && (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.4 }} />
                    <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>AI-Powered 1-on-1 Generator</h3>
                    <p style={{ maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>
                      Click "Draft Monthly Review" to let the AI aggregate {employee.name.split(' ')[0]}'s active metrics and 
                      all coaching logs from the past 30 days into a formal GROW performance appraisal.
                    </p>
                  </div>
                )}
                {isGeneratingReview && (
                  <div style={{ textAlign: 'center', padding: '4rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                    <Loader2 size={40} color="var(--bby-blue)" className="spin" />
                    <p style={{ color: '#fff', fontWeight: 500 }}>Synthesizing metrics and coaching logs...</p>
                  </div>
                )}
                {generatedReview && !isGeneratingReview && (
                  <div style={{ background: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333' }}>
                    {renderMarkdown(generatedReview)}
                  </div>
                )}
              </div>
            </div>
    </>
  );
}
