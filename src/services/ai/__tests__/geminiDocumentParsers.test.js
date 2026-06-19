import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseScheduleImage } from '../geminiDocumentParsers';

// Mock the entire GoogleGenerativeAI module
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

// Import the mocked implementation reference
import { mockGenerateContent } from '@google/generative-ai';

describe('geminiDocumentParsers - parseScheduleImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('correctly parses valid JSON response from Gemini', async () => {
    const mockApiResponse = {
      response: {
        text: () => JSON.stringify([
          { name: 'Julianna', shift: '9:00 AM - 5:30 PM', zone: 'Computing' },
          { name: 'Joey Z', shift: '12:00 PM - 8:30 PM', zone: 'Mobile' }
        ])
      }
    };
    
    mockGenerateContent.mockResolvedValueOnce(mockApiResponse);

    const result = await parseScheduleImage('fake-base64-data', 'image/png', 'fake-api-key');

    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Julianna');
    expect(result[1].zone).toBe('Mobile');
    
    // Verify it called with correct config
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.generationConfig.responseMimeType).toBe('application/json');
    expect(callArgs.contents[0].parts[1].inlineData.mimeType).toBe('image/png');
  });

  it('throws an error if Gemini returns invalid JSON', async () => {
    const mockApiResponse = {
      response: {
        text: () => 'This is not JSON'
      }
    };
    
    mockGenerateContent.mockResolvedValueOnce(mockApiResponse);

    await expect(parseScheduleImage('data', 'image/png', 'key')).rejects.toThrow(SyntaxError);
  });

  it('throws an error if API call fails entirely', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('API Rate Limit Exceeded'));

    await expect(parseScheduleImage('data', 'image/png', 'key')).rejects.toThrow('API Rate Limit Exceeded');
  });
});
