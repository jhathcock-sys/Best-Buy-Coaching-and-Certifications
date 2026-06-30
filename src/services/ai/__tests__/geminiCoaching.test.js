import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateCoachingLogGemini } from '../geminiCoaching';

vi.mock('firebase/functions', () => {
  const mockHttpsCallableFn = vi.fn();
  return {
    getFunctions: vi.fn(),
    httpsCallable: vi.fn(() => mockHttpsCallableFn),
    mockHttpsCallableFn
  };
});

import { mockHttpsCallableFn } from 'firebase/functions';

describe('geminiCoaching - generateCoachingLogGemini', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    
    const callArgs = mockHttpsCallableFn.mock.calls[0][0];
    expect(callArgs.name).toBe('John Doe');
    expect(callArgs.gapType).toBe('Memberships');
    expect(callArgs.selectedDiscSteps).toEqual(['Solve', 'Close']);
    expect(callArgs.playbookSettings.customSystemPrompt).toBe('Be extremely encouraging');
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
    expect(mockHttpsCallableFn).toHaveBeenCalledTimes(1);
  });
});
