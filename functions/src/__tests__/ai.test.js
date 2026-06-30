import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as aiFunctions from '../ai.js';
import test from 'firebase-functions-test';

const testEnv = test();

// Mock global fetch for Gemini SDK
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({
    candidates: [{ content: { parts: [{ text: 'Mocked AI Response' }] } }]
  })
});

// Create wrapped functions
const wrappedGenerateAIContent = testEnv.wrap(aiFunctions.generateAIContent);
const wrappedGenerateCoaching = testEnv.wrap(aiFunctions.generateCoaching);

describe('ai functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateAIContent', () => {
    it('requires authentication', async () => {
      await expect(wrappedGenerateAIContent({ prompt: 'test' }, {}))
        .rejects.toThrow('Endpoint requires authentication.');
    });

    it('requires a prompt', async () => {
      await expect(wrappedGenerateAIContent({ prompt: '' }, { auth: { uid: 'user' } }))
        .rejects.toThrow('Prompt is empty.');
    });

    it('generates content successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'Mocked AI Response' }] } }]
        })
      });

      const result = await wrappedGenerateAIContent(
        { prompt: 'Hello', apiKey: 'fake-api-key' },
        { auth: { uid: 'user' } }
      );

      expect(result.text).toBe('Mocked AI Response');
    });

    it('handles isJSON schema logic', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: '{"responseText":"ok","currentActiveStep":"connect","completedSteps":{}}' }] } }]
        })
      });

      const result = await wrappedGenerateAIContent(
        { prompt: 'Hello', apiKey: 'fake-api-key', isJSON: true, schemaType: 'customer_simulation_step' },
        { auth: { uid: 'user' } }
      );

      expect(result.text).toContain('responseText');
    });
  });

  describe('generateCoaching', () => {
    it('requires authentication', async () => {
      await expect(wrappedGenerateCoaching({}, {}))
        .rejects.toThrow('Endpoint requires authentication.');
    });

    it('parses valid json response', async () => {
      const mockLog = {
        what: "What",
        how: "How",
        why: "Why",
        strengths: "Good",
        metricGap: "None",
        expectation: "Expect",
        validation: "Valid",
        discStep: "Solve"
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: JSON.stringify(mockLog) }] } }]
        })
      });

      const result = await wrappedGenerateCoaching(
        { name: 'John', apiKey: 'fake-key' },
        { auth: { uid: 'user' } }
      );

      expect(result).toEqual(mockLog);
    });

    it('throws on invalid json', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'Invalid JSON' }] } }]
        })
      });

      await expect(wrappedGenerateCoaching({ name: 'John', apiKey: 'fake-key' }, { auth: { uid: 'user' } }))
        .rejects.toThrow(/AI returned invalid JSON|Invalid JSON/);
    });
  });
});
