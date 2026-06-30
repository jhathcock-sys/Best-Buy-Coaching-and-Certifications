import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  runOfflineSimulationStep,
  evaluateSessionOffline,
  runGeminiSimulationStep,
  evaluateSessionGemini
} from '../customerSimulator';
import { callFirebaseAI } from '../core';

vi.mock('../core', () => ({
  callFirebaseAI: vi.fn()
}));

vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(),
  httpsCallable: vi.fn()
}));

vi.mock('../../firebase', () => ({
  app: {}
}));

describe('customerSimulator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('runOfflineSimulationStep', () => {
    it('returns default connect state when history is empty', () => {
      const scenario: any = { id: 'test_scenario', successKeywords: { connect: ['hi'] } };
      const result = runOfflineSimulationStep('hello', null as any, scenario);
      expect(result.currentActiveStep).toBe('connect');
    });

    it('advances step to discover when connect keywords are met', () => {
      const scenario: any = { id: 'test_scenario', successKeywords: { connect: ['hi'] } };
      const history: any = { currentActiveStep: 'connect', completedSteps: {} };
      const result = runOfflineSimulationStep('hi there', history, scenario);
      expect(result.currentActiveStep).toBe('discover');
      expect(result.completedSteps.connect).toBe(true);
    });
  });

  describe('evaluateSessionOffline', () => {
    it('returns score based on completed steps', () => {
      const history: any = { completedSteps: { connect: true, discover: true } };
      const result = evaluateSessionOffline(history);
      expect(result.breakdown.connect).toBe(100);
      expect(result.breakdown.discover).toBe(100);
      expect(result.breakdown.recommend).toBe(30);
    });
  });

  describe('runGeminiSimulationStep', () => {
    it('calls Firebase AI and parses JSON response', async () => {
      const mockResponse = {
        responseText: 'I like this product',
        currentActiveStep: 'recommend',
        completedSteps: { connect: true, discover: true }
      };
      
      (callFirebaseAI as any).mockResolvedValue({ text: JSON.stringify(mockResponse) });

      const scenario: any = { id: 'test_scenario' };
      const history: any = { currentActiveStep: 'discover' };
      const playbookSettings: any = {};

      const result = await runGeminiSimulationStep('api-key', 'Check this out', history, scenario, playbookSettings);

      expect(callFirebaseAI).toHaveBeenCalled();
      expect(result.currentActiveStep).toBe('recommend');
      expect(result.completedSteps.discover).toBe(true);
      expect(result.messages[result.messages.length - 1].text).toBe('I like this product');
    });

    it('falls back to offline simulator on error', async () => {
      (callFirebaseAI as any).mockRejectedValue(new Error('API Error'));

      const scenario: any = { id: 'test_scenario', successKeywords: { discover: ['tell me'] } };
      const history: any = { currentActiveStep: 'discover', completedSteps: { connect: true } };
      const playbookSettings: any = {};

      const result = await runGeminiSimulationStep('api-key', 'tell me', history, scenario, playbookSettings);

      expect(callFirebaseAI).toHaveBeenCalled();
      // It should still advance due to offline fallback logic matching keyword "tell me"
      expect(result.currentActiveStep).toBe('recommend');
    });
  });
});
