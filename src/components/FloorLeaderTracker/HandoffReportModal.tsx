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
      <div className="modal-content max-w-700 w-95">
        <div className="modal-header">
          <h2 className="flex-center gap-sm justify-start m-0">
            <FileText size={24} color="var(--bby-blue)" />
            Shift Handoff Report
          </h2>
          <button className="btn-close" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="modal-body min-h-400">
          {isGenerating ? (
            <div className="flex-column align-center justify-center h-300px gap-md">
              <div className="loading-spinner w-10 h-10 border-bby-blue-t-3 rounded-full border-solid border-3 animate-spin border-transparent-rbl"></div>
              <p className="text-secondary">Synthesizing shift data with Gemini AI...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger m-2xl">{error}</div>
          ) : (
            <div className="p-md bg-surface rounded-xl border-glass">
              <div className="markdown-body text-white text-0-95rem leading-relaxed">
                <ReactMarkdown>{report}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer flex-between p-lg border-t-glass">
          <button className="btn bg-transparent text-secondary border-glass" onClick={onClose}>
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
