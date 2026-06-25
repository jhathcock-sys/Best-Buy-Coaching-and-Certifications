import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, FileText } from 'lucide-react';
import { getGeminiModel, isGeminiAvailable } from '../../services/ai/core';
import ReactMarkdown from 'react-markdown';
import { useStore } from '../../store/useStore';

interface HandoffReportModalProps {
  onClose: () => void;
}

export default function HandoffReportModal({ onClose }: HandoffReportModalProps) {
  const apiKey = useStore(state => state.apiKey);
  const activeShift = useStore(state => state.activeShift);
  
  const [report, setReport] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Calculate activeSummary internally to prevent prop-drilling
  const hoursArray = activeShift && Array.isArray(activeShift.hours) ? activeShift.hours : [];
  const activeSummary = activeShift ? {
    totalPms: hoursArray.reduce((sum, h) => sum + (h.pms || 0), 0) + (activeShift.preExistingPms || 0),
    totalApps: hoursArray.reduce((sum, h) => sum + (h.apps || 0), 0) + (activeShift.preExistingApps || 0),
    totalRevenue: hoursArray.reduce((sum, h) => sum + (parseFloat(String(h.revenue)) || 0), 0) + (activeShift.preExistingRevenue || 0),
    onTrackRatio: hoursArray.length > 0 ? Math.round((hoursArray.filter(h => {
        const pmGoal = activeShift.isWeekend ? 3 : 2;
        const appGoal = activeShift.isWeekend ? 3 : 2;
        return (h.pms || 0) >= pmGoal && (h.apps || 0) >= appGoal;
    }).length / hoursArray.length) * 100) : 0
  } : null;

  useEffect(() => {
    let isMounted = true;
    
    const generateReport = async (): Promise<void> => {
      if (!isGeminiAvailable(apiKey)) {
        if (isMounted) {
          setError('Gemini API key is required to generate handoff reports.');
          setIsGenerating(false);
        }
        return;
      }

      if (!activeShift) {
        if (isMounted) {
          setError('No active shift data available.');
          setIsGenerating(false);
        }
        return;
      }

      try {
        const model = getGeminiModel(apiKey, {});
        
        const prompt = `
          You are a Best Buy General Manager AI Assistant. You are writing an end-of-shift handoff report for the incoming manager.
          Use the following shift data to create a concise, professional, bulleted report in Markdown.
          Focus on metrics vs goals, areas of momentum, and areas needing attention.

          SHIFT DATA:
          - Leader: ${activeShift.leaderName || 'Unknown'}
          - Total Revenue: $${activeSummary?.totalRevenue || 0}
          - Memberships (PMs): ${activeSummary?.totalPms || 0}
          - Credit Cards (Apps): ${activeSummary?.totalApps || 0}
          - On Track Ratio: ${activeSummary?.onTrackRatio || 0}%
          - Floor Wins Logged: ${activeShift.wins?.length || 0}
          - Hours Tracked: ${hoursArray.length || 0}
          
          Recent Activity/Wins: 
          ${JSON.stringify(activeShift.wins?.slice(0, 5) || [])}
          
          Format the output with sections: 
          ## Shift Summary
          ## Wins & Momentum
          ## Focus Areas for Incoming Manager
          
          Keep it highly readable for a retail manager quickly glancing at it.
        `;

        const result = await model.generateContent(prompt);
        if (isMounted) {
          setReport(result.response.text());
        }
      } catch (err: unknown) {
        if (isMounted) {
            if (err instanceof Error) {
                setError(err.message || 'Failed to generate report.');
            } else {
                setError('Failed to generate report.');
            }
        }
      } finally {
        if (isMounted) {
          setIsGenerating(false);
        }
      }
    };

    generateReport();
    
    return () => {
        isMounted = false;
    };
  }, [apiKey, activeShift, activeSummary?.totalRevenue, activeSummary?.totalPms, activeSummary?.totalApps, activeSummary?.onTrackRatio, hoursArray.length]);

  return (
    <div className="modal-overlay" data-testid="handoff-report-modal">
      <div className="modal-content max-w-700 w-95">
        <div className="modal-header">
          <h2 className="flex-center gap-sm justify-start m-0">
            <FileText size={24} color="var(--bby-blue)" />
            Shift Handoff Report
          </h2>
          <button className="btn-close cursor-pointer" data-testid="close-handoff-modal-btn" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="modal-body min-h-400">
          {isGenerating ? (
            <div className="flex-column align-center justify-center h-300px gap-md" data-testid="handoff-loading">
              <div className="loading-spinner w-10 h-10 border-bby-blue-t-3 rounded-full border-solid border-3 animate-spin border-transparent-rbl"></div>
              <p className="text-secondary">Synthesizing shift data with Gemini AI...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger m-2xl" data-testid="handoff-error">{error}</div>
          ) : (
            <div className="p-md bg-surface rounded-xl border-glass">
              <div className="markdown-body text-white text-0-95rem leading-relaxed">
                <ReactMarkdown>{report}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer flex-between p-lg border-t-glass">
          <button className="btn bg-transparent text-secondary border-glass cursor-pointer" data-testid="close-handoff-modal-btn-footer" onClick={onClose}>
            Close
          </button>
          {!isGenerating && !error && (
            <button className="btn btn-primary cursor-pointer" data-testid="publish-handoff-btn" onClick={() => {
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
