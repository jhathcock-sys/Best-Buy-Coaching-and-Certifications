import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLiveFloorShadow } from './useLiveFloorShadow';
import { useStore } from '../store/useStore';
import * as aiServices from '../services/ai';

vi.mock('../store/useStore');
vi.mock('../services/ai', () => ({
  generateCoachingLogGemini: vi.fn()
}));

describe('useLiveFloorShadow Hook', () => {
  const mockRoster = {
    '1': { id: '1', name: 'Alice Smith', dept: 'Computing', gap: 'Attachments' },
    '2': { id: '2', name: 'Bob Jones', dept: 'Home Theatre' }
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (useStore as unknown as any).mockImplementation((selector: any) => {
      const state = {
        activePeriod: '2023-01',
        rosterHistory: {
          '2023-01': mockRoster
        },
        apiKey: 'test-api-key',
        playbookSettings: { useGemini: true },
        logCoachingSession: vi.fn(),
        addFollowUpTask: vi.fn()
      };
      return selector(state);
    });
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useLiveFloorShadow({}));
    
    expect(result.current.currentStep).toBe(1);
    expect(result.current.selectedEmpId).toBe('');
    expect(result.current.department).toBe('General Sales');
    expect(result.current.checklist.greeting).toBe(false);
  });

  it('updates selected employee and prepopulates department and gap', () => {
    const { result } = renderHook(() => useLiveFloorShadow({}));

    act(() => {
      result.current.handleSelectEmployee('1');
    });

    expect(result.current.selectedEmpId).toBe('1');
    expect(result.current.department).toBe('Computing');
    expect(result.current.gapDetails).toContain('Attachments');
  });

  it('toggles checklist items', () => {
    const { result } = renderHook(() => useLiveFloorShadow({}));

    act(() => {
      result.current.toggleChecklistItem('greeting');
    });

    expect(result.current.checklist.greeting).toBe(true);

    act(() => {
      result.current.toggleChecklistItem('greeting');
    });

    expect(result.current.checklist.greeting).toBe(false);
  });
});
