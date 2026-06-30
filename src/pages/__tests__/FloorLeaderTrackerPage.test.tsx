import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import FloorLeaderTrackerPage from '../FloorLeaderTrackerPage';

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

describe('FloorLeaderTrackerPage', () => {
  it('renders without crashing', () => {
    render(<FloorLeaderTrackerPage />);
    expect(screen.getByTestId('floor-leader-tracker-page')).toBeInTheDocument();
  });
});
