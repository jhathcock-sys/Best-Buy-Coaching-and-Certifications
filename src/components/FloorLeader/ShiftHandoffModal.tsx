import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

  const dialogRef = useRef<HTMLDialogElement>(null);
  const backdropPointerDownRef = useRef(false);
  const suppressCloseEventRef = useRef(false);
  const isOpenRef = useRef(isOpen);
  const isMounted = useRef(true);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleId = useId();
  const subtitleId = useId();

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    isOpenRef.current = isOpen;
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      suppressCloseEventRef.current = false;
      if (typeof dialog.showModal === 'function') {
        if (!dialog.open) {
          dialog.showModal();
        }
      } else {
        dialog.setAttribute('open', '');
      }
    } else {
      suppressCloseEventRef.current = true;
      if (typeof dialog.close === 'function') {
        if (dialog.open) {
          dialog.close();
        }
      } else {
        dialog.removeAttribute('open');
      }
      dialog.returnValue = '';
    }

    return () => {
      isOpenRef.current = false;
      suppressCloseEventRef.current = true;
      if (typeof dialog.close === 'function') {
        if (dialog.open) {
          dialog.close();
        }
      } else {
        dialog.removeAttribute('open');
      }
      dialog.returnValue = '';
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const requestClose = () => {
    if (dialogRef.current) {
      dialogRef.current.returnValue = '';
    }
    onClose();
  };

  const isBackdropCoordinate = (e: React.PointerEvent<HTMLDialogElement>): boolean => {
    const dialog = dialogRef.current;
    if (!dialog || e.target !== dialog) return false;
    const rect = dialog.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;
    return e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDialogElement>) => {
    e.stopPropagation();
    backdropPointerDownRef.current = isBackdropCoordinate(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDialogElement>) => {
    e.stopPropagation();
    if (backdropPointerDownRef.current && isBackdropCoordinate(e)) {
      requestClose();
    }
    backdropPointerDownRef.current = false;
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDialogElement>) => {
    e.stopPropagation();
    backdropPointerDownRef.current = false;
  };

  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    e.stopPropagation();
    requestClose();
  };

  const handleNativeClose = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.stopPropagation();
    const dialog = e.currentTarget;
    if (e.target !== dialog) return;
    dialog.returnValue = '';
    if (!suppressCloseEventRef.current && !dialog.open && isOpenRef.current) {
      onClose();
    }
  };

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
    } catch (err: unknown) {
      if (isMounted.current) {
        const errorObj = err as Error;
        console.error('Failed to generate handoff briefing:', errorObj);
        setError(errorObj?.message || 'Failed to generate briefing. Please try again.');
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

  return createPortal(
    <dialog
      ref={dialogRef}
      data-testid="handoff-modal"
      aria-labelledby={titleId}
      aria-describedby={subtitleId}
      onCancel={handleCancel}
      onClose={handleNativeClose}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className="native-dialog-modal max-h-[90dvh] overscroll-contain"
    >
      <div className="native-dialog-header">
        <div className="flex-row align-center gap-md">
          <div className="handoff-icon-badge" aria-hidden="true">
            <FileText size={20} />
          </div>
          <div>
            <h2 id={titleId} className="text-xl font-bold text-white m-0">Smart Shift Handoff</h2>
            <p id={subtitleId} className="text-sm text-secondary m-0 mt-xs">
              AI-generated summary for the incoming Floor Leader
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={requestClose}
          aria-label="Close modal"
          className="native-dialog-close-btn"
        >
          <X size={20} />
        </button>
      </div>

      <div className="native-dialog-body overscroll-contain">
        {error && (
          <div className="p-md rounded-sm bg-error-alpha border-error-alpha-20 text-error text-sm">
            {error}
          </div>
        )}

        <div className="handoff-textarea-shell">
          {isGenerating ? (
            <div className="handoff-loading-overlay">
              <Loader2 className="animate-spin text-bby-blue" size={32} />
              <p className="text-sm m-0">Analyzing shift data &amp; writing briefing...</p>
            </div>
          ) : null}

          <textarea
            className="handoff-textarea"
            aria-label="Shift handoff briefing"
            value={briefing}
            onChange={(e) => setBriefing(e.target.value)}
            placeholder="Your generated shift handoff briefing will appear here..."
            disabled={isGenerating}
          />
        </div>
      </div>

      <div className="native-dialog-footer">
        <button
          type="button"
          onClick={handleCopy}
          disabled={!briefing || isGenerating}
          className="btn btn-secondary btn-sm"
        >
          {copied ? (
            <>
              <CheckCircle2 size={16} className="text-success" />
              Copied!
            </>
          ) : (
            <>
              <Copy size={16} />
              Copy to Clipboard
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          data-testid="generate-handoff-btn"
          className="btn btn-primary"
        >
          {isGenerating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Wand2 size={16} />
          )}
          Generate AI Handoff
        </button>
      </div>
    </dialog>,
    document.body
  );
}
