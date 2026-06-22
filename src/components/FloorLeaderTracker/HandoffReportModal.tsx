import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, FileText } from 'lucide-react';
import { getGeminiModel, isGeminiAvailable } from '../../services/ai/core';
import ReactMarkdown from 'react-markdown';

export default function HandoffReportModal({ activeShift, activeSummary, apiKey, onClose }: any) {
  const [report, setReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    if (!isGeminiAvailable(apiKey)) {
      setError('Gemini API key is required to generate handoff reports.');
      setIsGenerating(false);
      return;
    }

    try {
      const model = getGeminiModel(apiKey, {});
      
      const prompt = `
        You are a Best Buy General Manager AI Assistant. You are writing an end-of-shift handoff report for the incoming manager.
        Use the following shift data to create a concise, professional, bulleted report in Markdown.
        Focus on metrics vs goals, areas of momentum, and areas needing attention.

        SHIFT DATA:
        - Leader: ${activeShift?.leaderName}
        - Total Revenue: $${activeSummary?.totalRevenue}
        - Memberships (PMs): ${activeSummary?.totalPms}
        - Credit Cards (Apps): ${activeSummary?.totalApps}
        - On Track Ratio: ${activeSummary?.onTrackRatio}%
        - Floor Wins Logged: ${activeShift?.wins?.length || 0}
        - Hours Tracked: ${activeShift?.hours?.length || 0}
        
        Recent Activity/Wins: 
        ${JSON.stringify(activeShift?.wins?.slice(0, 5) || [])}
        
        Format the output with sections: 
        ## Shift Summary
        ## Wins & Momentum
        ## Focus Areas for Incoming Manager
        
        Keep it highly readable for a retail manager quickly glancing at it.
      `;

      const result = await model.generateContent(prompt);
      setReport(result.response.text());
    } catch (err: any) {
      setError(err.message || 'Failed to generate report.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '700px', width: '95%' }}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={24} color="var(--bby-blue)" />
            Shift Handoff Report
          </h2>
          <button className="btn-close" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="modal-body" style={{ minHeight: '400px' }}>
          {isGenerating ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '1rem' }}>
              <div className="loading-spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--bby-blue)', borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent', borderRadius: '50%', borderStyle: 'solid', borderWidth: '3px', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ color: 'var(--text-secondary)' }}>Synthesizing shift data with Gemini AI...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger" style={{ margin: '2rem' }}>{error}</div>
          ) : (
            <div style={{ padding: '1rem', background: 'var(--surface-1)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <div className="markdown-body" style={{ color: '#fff', fontSize: '0.95rem', lineHeight: '1.6' }}>
                <ReactMarkdown>{report}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', borderTop: '1px solid var(--border-glass)' }}>
          <button className="btn" onClick={onClose} style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-glass)' }}>
            Close
          </button>
          {!isGenerating && !error && (
            <button className="btn btn-primary" onClick={() => {
              alert("Handoff Report saved to Daily Feed!");
              onClose();
            }}>
              <CheckCircle2 size={18} />
              Publish to Incoming Manager
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
