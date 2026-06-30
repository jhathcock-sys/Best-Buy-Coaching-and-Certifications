import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfileCoachingTab from './ProfileCoachingTab';

describe('ProfileCoachingTab', () => {
  let mockSpeak: any;
  let mockCancel: any;

  let mockUtteranceSpy: any;

  beforeEach(() => {
    mockSpeak = vi.fn();
    mockCancel = vi.fn();
    mockUtteranceSpy = vi.fn();

    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: mockSpeak,
        cancel: mockCancel,
      },
      writable: true
    });

    class MockUtterance {
      text: string;
      onend: any;
      onerror: any;
      constructor(text: string) {
        this.text = text;
        this.onend = null;
        this.onerror = null;
        mockUtteranceSpy(text);
      }
    }

    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: MockUtterance,
      writable: true
    });
  });

  it('renders empty state if no logs', () => {
    render(<ProfileCoachingTab associateLogs={[]} />);
    expect(screen.getByText(/No coaching or shadowing logs recorded/i)).toBeInTheDocument();
  });

  it('renders logs and handles expanding/collapsing', () => {
    const logs = [
      { id: 'log-1', category: 'Live Shadowing', score: 90, date: '2026-06-01', notes: 'Great job', timestamp: 12345 }
    ];

    render(<ProfileCoachingTab associateLogs={logs as any} />);
    
    expect(screen.getByTestId('coaching-log-item')).toBeInTheDocument();
    
    // Expand
    fireEvent.click(screen.getByTestId('view-notes-btn'));
    expect(screen.getByTestId('play-tts-btn')).toBeInTheDocument();
  });

  it('handles TTS play safely even when notes are null or undefined', () => {
    const logs = [
      // log without notes (to trigger the null method trap fix)
      { id: 'log-2', category: 'Live Shadowing', score: 85, date: '2026-06-02', timestamp: 12346 }
    ];

    render(<ProfileCoachingTab associateLogs={logs as any} />);
    
    // Expand
    fireEvent.click(screen.getByTestId('view-notes-btn'));
    
    // Play TTS
    const playBtn = screen.getByTestId('play-tts-btn');
    fireEvent.click(playBtn);
    
    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalled();
    
    // The utterance should have safely fallen back to "No notes available."
    expect(mockUtteranceSpy).toHaveBeenCalledWith('No notes available.');
  });
});
