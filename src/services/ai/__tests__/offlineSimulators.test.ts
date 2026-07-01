import { describe, it, expect } from 'vitest';
import {
  runOfflineSimulationStep,
  evaluateSessionOffline,
  runOfflineEmployeeCoachingStep,
  evaluateCoachingSession,
  generateCoachingLogLocal
} from '../offlineSimulators';

describe('offlineSimulators', () => {
  describe('runOfflineSimulationStep', () => {
    it('advances from connect to discover step on correct input', () => {
      const history = { completedSteps: {}, currentActiveStep: 'connect', metrics: {} };
      const scenario = {
        id: 'computing-college',
        successKeywords: { connect: ['hello', 'hi'] }
      };

      const result = runOfflineSimulationStep('Hi there!', history, scenario);
      
      expect(result.completedSteps.connect).toBe(true);
      expect(result.currentActiveStep).toBe('discover');
      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].sender).toBe('advisor');
      expect(result.messages[1].sender).toBe('customer');
    });

    it('stays on connect if keywords are not met and message is short', () => {
      const history = { completedSteps: {}, currentActiveStep: 'connect', metrics: {} };
      const scenario = {
        id: 'computing-college',
        successKeywords: { connect: ['hello', 'hi'] }
      };

      const result = runOfflineSimulationStep('yo', history, scenario);
      
      expect(result.completedSteps.connect).toBeUndefined();
      expect(result.currentActiveStep).toBe('connect');
    });
  });

  describe('evaluateSessionOffline', () => {
    it('returns a passing score if all steps completed', () => {
      const history = {
        completedSteps: {
          connect: true,
          discover: true,
          recommend: true,
          protect: true,
          close: true
        }
      };

      const result = evaluateSessionOffline(history);
      expect(result.passed).toBe(true);
      expect(result.overallScore).toBe(100);
    });

    it('returns failing score if only connect is completed', () => {
      const history = {
        completedSteps: {
          connect: true
        }
      };

      const result = evaluateSessionOffline(history);
      expect(result.passed).toBe(false);
      expect(result.overallScore).toBeLessThan(80);
    });
  });

  describe('runOfflineEmployeeCoachingStep', () => {
    it('advances goal to reality step', () => {
      const history = { completedCoachSteps: {}, currentCoachStep: 'goal' };
      const scenario = { id: 'victor' };

      const result = runOfflineEmployeeCoachingStep('what is your goal?', history, scenario);
      
      expect(result.completedCoachSteps.goal).toBe(true);
      expect(result.currentCoachStep).toBe('reality');
    });
  });

  describe('evaluateCoachingSession', () => {
    it('calculates score based on completed steps', () => {
      const history = {
        completedCoachSteps: {
          goal: true,
          reality: true,
          options: true,
          will: true
        }
      };

      const result = evaluateCoachingSession(history);
      expect(result.score).toBe(100);
      expect(result.passed).toBe(true);
    });
  });

  describe('generateCoachingLogLocal', () => {
    it('generates standard coaching log for memberships', () => {
      const result = generateCoachingLogLocal('Alice', 'membership', 'Missed opportunity', 'Good energy', "I saw you didn't ask about total", 'Recommend');
      
      expect(result.what).toContain('membership');
      expect(result.how).toContain('My Best Buy Total');
    });
  });
});
