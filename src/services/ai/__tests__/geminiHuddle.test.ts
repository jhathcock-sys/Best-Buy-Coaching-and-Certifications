import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateHuddleScript } from '../geminiHuddle';
import { callFirebaseAI } from '../core';

vi.mock('../core', () => ({
  callFirebaseAI: vi.fn()
}));

describe('geminiHuddle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates a huddle script successfully', async () => {
    const mockRoster = [
      { id: '1', name: 'Alice', dept: 'PC', rph: 1500, memberships: 5, role: 'advisor' }
    ];
    const mockSettings = { aiMode: 'pro' };
    
    vi.mocked(callFirebaseAI).mockResolvedValue({ text: 'Good morning team!' });

    const result = await generateHuddleScript(mockRoster as any, 'fake-api-key', mockSettings as any);

    expect(result).toBe('Good morning team!');
    expect(callFirebaseAI).toHaveBeenCalledWith(expect.objectContaining({
      isProMode: true,
      apiKey: 'fake-api-key',
      schemaType: 'huddle',
      prompt: expect.stringContaining('Alice (PC)')
    }));
  });

  it('handles empty roster gracefully', async () => {
    vi.mocked(callFirebaseAI).mockResolvedValue({ text: 'Morning everyone!' });

    const result = await generateHuddleScript(undefined as any, undefined, { aiMode: 'standard' } as any);

    expect(result).toBe('Morning everyone!');
    expect(callFirebaseAI).toHaveBeenCalledWith(expect.objectContaining({
      isProMode: false
    }));
  });
});
