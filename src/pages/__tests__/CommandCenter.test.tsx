import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import CommandCenter from '../CommandCenter';

vi.mock('../../store/useStore', () => ({
  useStore: vi.fn().mockImplementation((selector) => {
    const state = {
      coachingLogs: [],
      shifts: [],
      managers: [],
      departments: [],
      roster: [],
      activePeriod: null,
      deptGoals: {},
      rosterHistory: {},
      playbookSettings: {}
    };
    return selector ? selector(state) : state;
  }),
}));

describe('CommandCenter', () => {
  it('renders without crashing', () => {
    render(<CommandCenter />);
    // Expect the initialization screen since not all state is hydrated in this mock
    expect(screen.getByText(/Initializing/i)).toBeInTheDocument();
  });
});
