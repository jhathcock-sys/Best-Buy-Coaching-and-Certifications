import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateCoachingLogGemini } from '../geminiCoaching';

vi.mock('@google/generative-ai', () => {
  const mockGenerateContent = vi.fn();
  return {
    GoogleGenerativeAI: class {
      constructor() {}
      getGenerativeModel() {
        return {
          generateContent: mockGenerateContent
        };
      }
    },
    mockGenerateContent
  };
});

import { mockGenerateContent } from '@google/generative-ai';

describe('geminiCoaching - generateCoachingLogGemini', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('correctly generates a coaching log based on inputs', async () => {
    const mockApiResponse = {
      response: {
        text: () => JSON.stringify({ what: 'Mocked What', how: 'Mocked How', why: 'Mocked Why' })
      }
    };
    
    mockGenerateContent.mockResolvedValueOnce(mockApiResponse);

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

    expect(result).toEqual({ what: 'Mocked What', how: 'Mocked How', why: 'Mocked Why' });
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    
    const callArgs = mockGenerateContent.mock.calls[0][0];
    const promptText = callArgs.contents[0].parts[0].text;
    
    expect(promptText).toContain('John Doe');
    expect(promptText).toContain('Memberships');
    expect(promptText).toContain('Solve, Close');
    expect(promptText).toContain('Be extremely encouraging');
  });

  it('handles empty playbookSettings gracefully', async () => {
    const mockApiResponse = {
      response: {
        text: () => JSON.stringify({ what: 'Default What' })
      }
    };
    
    mockGenerateContent.mockResolvedValueOnce(mockApiResponse);

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

    expect(result).toEqual({ what: 'Default What' });
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });
});
