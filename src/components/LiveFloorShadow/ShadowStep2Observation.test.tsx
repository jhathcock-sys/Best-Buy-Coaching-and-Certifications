import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ShadowStep2Observation from './ShadowStep2Observation';

class MockSpeechRecognition {
  start = vi.fn();
  stop = vi.fn();
  continuous = false;
  interimResults = false;
  lang = '';
}

describe('ShadowStep2Observation', () => {
  const mockToggleChecklistItem = vi.fn();
  const mockSetNotes = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Stub SpeechRecognition for the dictation button
    vi.stubGlobal('SpeechRecognition', MockSpeechRecognition);
    // Explicitly delete webkitSpeechRecognition so we don't accidentally fallback
    delete (window as any).webkitSpeechRecognition;

    // Stub alert to avoid jsdom warnings
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  const defaultProps = {
    checklist: {},
    toggleChecklistItem: mockToggleChecklistItem,
    notes: '',
    setNotes: mockSetNotes,
  };

  it('renders correctly and displays sections', () => {
    render(<ShadowStep2Observation {...defaultProps} />);
    
    // Check for sections
    expect(screen.getByText('Inspire')).toBeDefined();
    expect(screen.getByText('Solve')).toBeDefined();
    expect(screen.getByText('Close')).toBeDefined();
  });

  it('toggles checklist items when clicked', () => {
    render(<ShadowStep2Observation {...defaultProps} />);
    
    const greetingCheck = screen.getByTestId('shadow-check-greeting');
    fireEvent.click(greetingCheck);
    
    expect(mockToggleChecklistItem).toHaveBeenCalledWith('greeting');
    expect(mockToggleChecklistItem).toHaveBeenCalledTimes(1);
  });

  it('updates notes text area', () => {
    render(<ShadowStep2Observation {...defaultProps} />);
    
    const notesTextarea = screen.getByTestId('shadow-notes-textarea');
    fireEvent.change(notesTextarea, { target: { value: 'Customer seemed interested.' } });
    
    expect(mockSetNotes).toHaveBeenCalled();
  });

  it('handles dictation button click', () => {
    render(<ShadowStep2Observation {...defaultProps} />);
    
    const dictationBtn = screen.getByTestId('shadow-dictation-btn');
    expect(dictationBtn.textContent).toContain('Start Dictation');
    
    fireEvent.click(dictationBtn);
    
    expect(dictationBtn.textContent).toContain('Stop Recording');
    
    fireEvent.click(dictationBtn);
    expect(dictationBtn.textContent).toContain('Start Dictation');
  });

  it('shows error if speech recognition is not supported', () => {
    // Override the mock for this specific test
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;
    
    render(<ShadowStep2Observation {...defaultProps} />);
    
    const dictationBtn = screen.getByTestId('shadow-dictation-btn');
    fireEvent.click(dictationBtn);
    
    expect(window.alert).toHaveBeenCalledWith('Speech Recognition API not supported in this browser.');
    expect(dictationBtn.textContent).toContain('Start Dictation');
  });

  it('respects the initial checklist prop values', () => {
    const props = {
      ...defaultProps,
      checklist: { greeting: true, nameExchange: false },
    };
    render(<ShadowStep2Observation {...props} />);
    
    const greetingCheck = screen.getByTestId('shadow-check-greeting') as HTMLInputElement;
    const nameExchangeCheck = screen.getByTestId('shadow-check-nameExchange') as HTMLInputElement;
    
    expect(greetingCheck.checked).toBe(true);
    expect(nameExchangeCheck.checked).toBe(false);
  });
});
