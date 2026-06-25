import React from 'react';
import { TrendingUp, ClipboardList, Calendar, Volume2, Square, Clock, AlertCircle, CheckCircle, FileText, Loader2 } from 'lucide-react';
import MetricSparkline from '../MetricSparkline';

export default function ProfileAppraisalsTab({ 
  employee,
  isGeneratingReview,
  generatedReview,
  handleGenerateReview,
  renderMarkdown
 }) {
  return (
    <>
            <div className="flex-column gap-md animate-fade-in">
              <div className="flex-between">
                <h4 className="text-lg text-white m-0 font-bold">Monthly Performance Appraisal</h4>
                <button
                  onClick={handleGenerateReview}
                  disabled={isGeneratingReview}
                  className={`btn btn-primary hover-scale ${isGeneratingReview ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                  {isGeneratingReview ? <Loader2 size={16} className="spin" /> : <FileText size={16} />}
                  {isGeneratingReview ? 'Drafting...' : 'Draft Monthly Review'}
                </button>
              </div>

              <div className="glass-card text-secondary min-h-200">
                {!generatedReview && !isGeneratingReview && (
                  <div className="text-center py-xl px-md">
                    <FileText size={48} color="var(--text-muted)" className="mb-lg opacity-60" />
                    <h3 className="text-white mb-sm text-xl font-bold">AI-Powered 1-on-1 Generator</h3>
                    <p className="max-w-md mx-auto leading-relaxed">
                      Click "Draft Monthly Review" to let the AI aggregate {employee.name.split(' ')[0]}'s active metrics and 
                      all coaching logs from the past 30 days into a formal GROW performance appraisal.
                    </p>
                  </div>
                )}
                {isGeneratingReview && (
                  <div className="text-center py-xl px-md flex-column align-center gap-lg">
                    <Loader2 size={40} color="var(--bby-blue)" className="spin" />
                    <p className="text-white font-semibold">Synthesizing metrics and coaching logs...</p>
                  </div>
                )}
                {generatedReview && !isGeneratingReview && (
                  <div className="bg-black-alpha-20 p-lg rounded-xl border-glass">
                    {renderMarkdown(generatedReview)}
                  </div>
                )}
              </div>
            </div>
    </>
  );
}
