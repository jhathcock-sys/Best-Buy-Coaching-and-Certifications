import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseScheduleImage } from '../geminiDocumentParsers';

// Mock the entire firebase/functions module
vi.mock('firebase/functions', () => {
  const mockHttpsCallableFn = vi.fn();
  return {
    getFunctions: vi.fn(),
    httpsCallable: vi.fn(() => mockHttpsCallableFn),
    mockHttpsCallableFn
  };
});

// Import the mocked implementation reference
import { mockHttpsCallableFn } from 'firebase/functions';

describe('geminiDocumentParsers - parseScheduleImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('correctly parses valid JSON response from Gemini', async () => {
    const mockApiResponse = {
      data: {
        text: JSON.stringify([
          { name: 'Julianna', shift: '9:00 AM - 5:30 PM', zone: 'Computing' },
          { name: 'Joey Z', shift: '12:00 PM - 8:30 PM', zone: 'Mobile' }
        ])
      }
    };
    
    mockHttpsCallableFn.mockResolvedValueOnce(mockApiResponse);

    const result = await parseScheduleImage('fake-base64-data', 'image/png', 'fake-api-key');

    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Julianna');
    expect(result[1].zone).toBe('Mobile');
    
    // Verify it called with correct config
    expect(mockHttpsCallableFn).toHaveBeenCalledTimes(1);
    const callArgs = mockHttpsCallableFn.mock.calls[0][0];
    expect(callArgs.isJSON).toBe(true);
    expect(callArgs.mimeType).toBe('image/png');
  });

  it('throws an error if Gemini returns invalid JSON', async () => {
    const mockApiResponse = {
      data: {
        text: 'This is not JSON'
      }
    };
    
    mockHttpsCallableFn.mockResolvedValueOnce(mockApiResponse);

    await expect(parseScheduleImage('data', 'image/png', 'key')).rejects.toThrow(SyntaxError);
  });

  it('throws an error if API call fails entirely', async () => {
    mockHttpsCallableFn.mockRejectedValueOnce(new Error('API Rate Limit Exceeded'));

    await expect(parseScheduleImage('data', 'image/png', 'key')).rejects.toThrow('API Rate Limit Exceeded');
  });
});
