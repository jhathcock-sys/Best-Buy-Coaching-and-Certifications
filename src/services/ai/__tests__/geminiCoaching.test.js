import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  generateCoachingLogGemini, 
  generateMonthlyOneOnOne, 
  generateActionPlan, 
  generatePerformanceGap 
} from '../geminiCoaching';

vi.mock('firebase/functions', () => {
  const mockHttpsCallableFn = vi.fn();
  return {
    getFunctions: vi.fn(),
    httpsCallable: vi.fn(() => mockHttpsCallableFn),
    mockHttpsCallableFn
  };
});

import { mockHttpsCallableFn } from 'firebase/functions';

describe('geminiCoaching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateCoachingLogGemini', () => {
    it('correctly generates a coaching log based on inputs', async () => {
      const mockApiResponse = {
        data: { what: 'Mocked What', how: 'Mocked How', why: 'Mocked Why' }
      };
      
      mockHttpsCallableFn.mockResolvedValueOnce(mockApiResponse);

      const result = await generateCoachingLogGemini(
        'fake-api-key',
        'John Doe',
        'Memberships',
        'Struggling to pitch Plus',
        'Friendly',
        'Saw him skip the pitch at checkout',
        { customSystemPrompt: 'Be extremely encouraging' },
        ['Solve', 'Close']
      );

      expect(result).toEqual({ 
        what: 'Mocked What', 
        how: 'Mocked How', 
        why: 'Mocked Why',
        strengths: 'Friendly',
        metricGap: 'Struggling to pitch Plus',
        expectation: 'Improve performance in the focus area.',
        validation: 'Leader will follow up next week.',
        discStep: 'Solve, Close'
      });
      expect(mockHttpsCallableFn).toHaveBeenCalledTimes(1);
    });

    it('handles empty playbookSettings gracefully', async () => {
      const mockApiResponse = {
        data: { what: 'Default What' }
      };
      
      mockHttpsCallableFn.mockResolvedValueOnce(mockApiResponse);

      const result = await generateCoachingLogGemini(
        'fake-api-key',
        'Jane',
        'Apps',
        '',
        '',
        '',
        null, // null playbook settings
        ['Discover']
      );

      expect(result).toEqual({ 
        what: 'Default What',
        how: 'Follow the appropriate framework.',
        why: 'To ensure a quality customer experience.',
        strengths: 'Demonstrates good core competencies.',
        metricGap: 'Apps',
        expectation: 'Improve performance in the focus area.',
        validation: 'Leader will follow up next week.',
        discStep: 'Discover'
      });
    });
  });

  describe('generateMonthlyOneOnOne', () => {
    it('generates monthly 1-on-1 text', async () => {
      mockHttpsCallableFn.mockResolvedValueOnce({ data: { text: '# Monthly Plan' } });
      const result = await generateMonthlyOneOnOne({ name: 'John' }, [], 'api-key');
      expect(result).toBe('# Monthly Plan');
    });

    it('returns fallback on error', async () => {
      mockHttpsCallableFn.mockRejectedValueOnce(new Error('Network error'));
      const result = await generateMonthlyOneOnOne({ name: 'John' }, [], 'api-key');
      expect(result).toContain('fallback template');
    });
  });

  describe('generateActionPlan', () => {
    it('generates structured action plan', async () => {
      mockHttpsCallableFn.mockResolvedValueOnce({ 
        data: { text: JSON.stringify({ planText: 'Do X' }) } 
      });
      const result = await generateActionPlan({ name: 'John' }, [], 'api-key');
      expect(result.planText).toBe('Do X');
    });

    it('returns null on error', async () => {
      mockHttpsCallableFn.mockRejectedValueOnce(new Error('Network error'));
      const result = await generateActionPlan({ name: 'John' }, [], 'api-key');
      expect(result).toBeNull();
    });
  });

  describe('generatePerformanceGap', () => {
    it('generates performance gap text', async () => {
      mockHttpsCallableFn.mockResolvedValueOnce({ data: { text: 'Needs focus on apps' } });
      const result = await generatePerformanceGap('api-key', 'John', {}, [], {});
      expect(result).toBe('Needs focus on apps');
    });

    it('returns error string on failure', async () => {
      mockHttpsCallableFn.mockRejectedValueOnce(new Error('Network error'));
      const result = await generatePerformanceGap('api-key', 'John', {}, [], {});
      expect(result).toBe('Failed to auto-generate gap. Please verify API key.');
    });
  });
});
