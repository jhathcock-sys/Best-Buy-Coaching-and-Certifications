import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import CoachingHistoryPage from '../CoachingHistoryPage';

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

describe('CoachingHistoryPage', () => {
  it('renders without crashing', () => {
    render(<CoachingHistoryPage />);
    expect(screen.getByText(/No coaching logs match your active filters/i)).toBeInTheDocument();
  });
});
