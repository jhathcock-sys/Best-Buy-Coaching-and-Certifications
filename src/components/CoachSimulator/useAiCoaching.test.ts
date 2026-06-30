import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAiCoaching } from './useAiCoaching';
import * as aiService from '../../services/ai';

vi.mock('../../services/ai', () => ({
  runOfflineEmployeeCoachingStep: vi.fn(),
  evaluateCoachingSession: vi.fn(),
  isGeminiAvailable: vi.fn(),
  runGeminiEmployeeCoachingStep: vi.fn(),
  evaluateCoachingSessionGemini: vi.fn(),
}));

describe('useAiCoaching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useAiCoaching('key', {}, [], vi.fn()));
    
    expect(result.current.selectedEmployee).toBeNull();
    expect(result.current.sessionActive).toBe(false);
    expect(result.current.messages).toEqual([]);
    expect(result.current.currentCoachStep).toBe('goal');
  });

  it('startCoaching sets initial state and selected employee', () => {
    const { result } = renderHook(() => useAiCoaching('key', {}, [], vi.fn()));
    
    const mockEmployee = { id: 1, name: 'John Doe', initialGreeting: 'Hello!' };
    
    act(() => {
      result.current.startCoaching(mockEmployee, false, vi.fn());
    });
    
    expect(result.current.selectedEmployee).toEqual(mockEmployee);
    expect(result.current.sessionActive).toBe(true);
    expect(result.current.messages).toEqual([{ sender: 'employee', text: 'Hello!' }]);
  });

  it('does not throw when handleSend is called without selectedEmployee', async () => {
    const { result } = renderHook(() => useAiCoaching('key', {}, [], vi.fn()));
    
    await act(async () => {
      await result.current.handleSend('Hello', false, vi.fn());
    });
    
    expect(result.current.messages.length).toBe(0);
  });

  it('prevents state updates on unmounted component during handleSend', async () => {
    // Setup a delayed mock to simulate async work
    let resolvePromise: any;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    vi.mocked(aiService.isGeminiAvailable).mockReturnValue(true);
    vi.mocked(aiService.runGeminiEmployeeCoachingStep).mockReturnValue(promise as any);
    
    const { result, unmount } = renderHook(() => useAiCoaching('key', { useGemini: true }, [], vi.fn()));
    
    act(() => {
      result.current.startCoaching({ id: 1, name: 'Test', initialGreeting: 'Hi' }, false, vi.fn());
    });
    
    let handleSendPromise: any;
    act(() => {
      handleSendPromise = result.current.handleSend('Coach says hello', false, vi.fn());
    });
    
    expect(result.current.isThinking).toBe(true);
    
    unmount();
    
    resolvePromise({
      messages: [{ sender: 'coach', text: 'hi' }],
      completedCoachSteps: {},
      currentCoachStep: 'reality'
    });
    
    await act(async () => {
      await handleSendPromise;
    });
    
    // We cannot check result.current after unmount easily in standard RTL without errors, 
    // but the lack of "act" warnings and checking our test completion is good.
    // The main verification is no state updates on unmounted component error.
  });

  it('prevents state updates on unmounted component during finishCoaching', async () => {
    let resolvePromise: any;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    vi.mocked(aiService.isGeminiAvailable).mockReturnValue(true);
    vi.mocked(aiService.evaluateCoachingSessionGemini).mockReturnValue(promise as any);
    
    const { result, unmount } = renderHook(() => useAiCoaching('key', { useGemini: true }, [], vi.fn()));
    
    act(() => {
      result.current.startCoaching({ id: 1, name: 'Test', initialGreeting: 'Hi' }, false, vi.fn());
    });
    
    let finishPromise: any;
    act(() => {
      finishPromise = result.current.finishCoaching();
    });
    
    expect(result.current.isEvaluating).toBe(true);
    
    unmount();
    
    resolvePromise({ score: 90, feedback: 'Good' });
    
    await act(async () => {
      await finishPromise;
    });
  });
});
