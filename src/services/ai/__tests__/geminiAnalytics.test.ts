import { describe, it, expect, vi, beforeEach } from 'vitest';
import { askConversationalAnalytics } from '../geminiAnalytics';

const mockHttpsCallable = vi.fn();

vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(),
  httpsCallable: () => mockHttpsCallable
}));

vi.mock('../../firebase', () => ({
  app: {}
}));

describe('geminiAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('askConversationalAnalytics', () => {
    it('trims data to last 60 days and calls generateAIContentFn with correct schemaType', async () => {
      const mockConfig = { chartType: 'bar', labels: ['a'], datasets: [] };
      mockHttpsCallable.mockResolvedValue({ data: { text: JSON.stringify(mockConfig) } });

      const snapshots: any = {
        '2026-06-01': [{ name: 'John Doe', rph: 1000 }]
      };

      const result = await askConversationalAnalytics('What is John\'s RPH?', snapshots);

      expect(mockHttpsCallable).toHaveBeenCalledWith(expect.objectContaining({
        prompt: expect.stringContaining('John Doe'),
        schemaType: 'conversational_analytics',
        isJSON: true
      }));

      expect(result).toEqual(mockConfig);
    });

    it('returns null if parsing fails', async () => {
      mockHttpsCallable.mockResolvedValue({ data: { text: 'invalid json' } });

      const result = await askConversationalAnalytics('question', {});

      expect(result).toBeNull();
    });

    it('throws error if the callable fails', async () => {
      mockHttpsCallable.mockRejectedValue(new Error('Network Error'));

      await expect(askConversationalAnalytics('question', {})).rejects.toThrow('Network Error');
    });
  });
});
