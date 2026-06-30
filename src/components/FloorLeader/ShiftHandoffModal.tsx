import React, { useState } from 'react';
import { X, FileText, Wand2, Loader2, Copy, CheckCircle2 } from 'lucide-react';
import { generateHandoffBriefing, FloorLeaderShift } from '../../services/ai/geminiHandoff';
import type { FollowUpTask, PlaybookSettings, Employee } from '../../types';
import type { ParsedEmployee } from '../../components/RentsDueAuditor/RentsDueLedger';

interface ShiftHandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeShift: FloorLeaderShift;
  roster: Employee[];
  followUpTasks: FollowUpTask[];
  playbookSettings: PlaybookSettings;
  apiKey: string | undefined;
}

export default function ShiftHandoffModal({
  isOpen,
  onClose,
  activeShift,
  roster,
  followUpTasks,
  playbookSettings,
  apiKey
}: ShiftHandoffModalProps) {
  const [briefing, setBriefing] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const isMounted = React.useRef(true);
  const copyTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError('');
      setBriefing('');
      
      const parsedRoster = roster as unknown as ParsedEmployee[];
      const result = await generateHandoffBriefing(
        activeShift,
        parsedRoster,
        followUpTasks,
        playbookSettings,
        apiKey
      );
      
      if (isMounted.current) {
        setBriefing(result);
      }
    } catch (error: unknown) {
      if (isMounted.current) {
        const err = error as Error;
        console.error('Failed to generate handoff briefing:', err);
        setError(err?.message || 'Failed to generate briefing. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setIsGenerating(false);
      }
    }
  };

  const handleCopy = async () => {
    if (!briefing) return;
    try {
      await navigator.clipboard.writeText(briefing);
      if (!isMounted.current) return;
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => {
        if (isMounted.current) setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div data-testid="handoff-modal" className="fixed inset-0 z-50 flex-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] flex flex-col relative overflow-hidden bg-[--bg-obsidian]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 border-b border-[--border-glass] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[--bby-blue]/10 flex-center text-[--bby-blue]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-outfit text-white">Smart Shift Handoff</h2>
            <p className="text-sm text-gray-400">AI-generated summary for the incoming Floor Leader</p>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-4">
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex-1 min-h-[300px] flex flex-col relative">
            {isGenerating ? (
              <div className="absolute inset-0 flex-center flex-col gap-4 text-gray-400 z-10 bg-[--bg-space]/50 rounded-lg">
                <Loader2 className="w-8 h-8 animate-spin text-[--bby-blue]" />
                <p className="text-sm">Analyzing shift data & writing briefing...</p>
              </div>
            ) : null}
            
            <textarea
              className="w-full flex-1 min-h-[300px] p-4 rounded-lg bg-[--bg-space] border border-[--border-glass] text-white text-sm focus:outline-none focus:border-[--bby-blue] transition-colors resize-none placeholder:text-gray-500"
              value={briefing}
              onChange={(e) => setBriefing(e.target.value)}
              placeholder="Your generated shift handoff briefing will appear here..."
              disabled={isGenerating}
            />
          </div>
        </div>

        <div className="p-6 border-t border-[--border-glass] bg-[--bg-space]/30 flex items-center justify-between gap-4">
          <button
            onClick={handleCopy}
            disabled={!briefing || isGenerating}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 text-white bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed border border-[--border-glass]"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy to Clipboard
              </>
            )}
          </button>
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            data-testid="generate-handoff-btn"
            className="btn-primary"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            Generate AI Handoff
          </button>
        </div>
      </div>
    </div>
  );
}
