import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useScheduleParser } from '../useScheduleParser';

vi.mock('../../store/useStore', () => ({
  useStore: vi.fn().mockImplementation((selector) => {
    const state = {
      rosterHistory: {},
      activePeriod: null,
      apiKey: null,
      addEmployee: vi.fn(),
      roster: [],
    };
    return selector ? selector(state) : state;
  }),
}));

describe('useScheduleParser', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useScheduleParser({
      onImportConfirm: vi.fn(),
      onClose: vi.fn(),
      isOpen: true
    }));
    expect(result.current.activeTab).toBe('image');
    expect(result.current.isParsing).toBe(false);
  });
});
