import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAudioEngine } from './useAudioEngine';
import { toast } from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
  }
}));

describe('useAudioEngine', () => {
  let mockSpeechSynthesis: any;
  let originalSpeechSynthesis: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock SpeechSynthesisUtterance
    class MockSpeechSynthesisUtterance {
      text: string;
      onend: Function | null;
      onerror: Function | null;
      constructor(text: string) {
        this.text = text;
        this.onend = null;
        this.onerror = null;
      }
    }
    (global as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
    
    mockSpeechSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn((utterance) => {
        // Trigger onend immediately in tests unless prevented
        if (utterance.onend) utterance.onend();
      }),
      pause: vi.fn(),
      resume: vi.fn(),
    };
    originalSpeechSynthesis = window.speechSynthesis;
    (window as any).speechSynthesis = mockSpeechSynthesis;
  });

  afterEach(() => {
    (window as any).speechSynthesis = originalSpeechSynthesis;
    delete (global as any).SpeechSynthesisUtterance;
  });

  it('initializes correctly', () => {
    const setInputVal = vi.fn();
    const { result } = renderHook(() => useAudioEngine([], setInputVal));
    
    expect(result.current.isPlayingSpeech).toBe(false);
    expect(result.current.isPausedSpeech).toBe(false);
    expect(result.current.isVoiceMode).toBe(false);
    expect(result.current.isListening).toBe(false);
  });

  it('toggles voice mode and plays last message if applicable', () => {
    const setInputVal = vi.fn();
    const messages = [{ sender: 'employee', text: 'Hello coach' }];
    const { result } = renderHook(() => useAudioEngine(messages, setInputVal));
    
    act(() => {
      result.current.toggleVoiceMode();
    });
    
    expect(result.current.isVoiceMode).toBe(true);
    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
  });

  it('handleStopSpeech cancels synthesis and resets state', () => {
    const setInputVal = vi.fn();
    const { result } = renderHook(() => useAudioEngine([], setInputVal));
    
    act(() => {
      result.current.handleStopSpeech();
    });
    
    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    expect(result.current.isPlayingSpeech).toBe(false);
  });

  it('cleans up on unmount', () => {
    const setInputVal = vi.fn();
    const { unmount } = renderHook(() => useAudioEngine([], setInputVal));
    
    unmount();
    
    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
  });
});
