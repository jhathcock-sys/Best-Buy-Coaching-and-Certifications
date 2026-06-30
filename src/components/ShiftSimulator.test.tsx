import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import ShiftSimulator from './ShiftSimulator';

vi.mock('../store/useStore', () => ({
  useStore: vi.fn((selector) => {
    return selector({
      employees: [],
      departments: [],
      playbookSettings: {}
    });
  })
}));

vi.mock('./ShiftSimulator/StaffingBoard', () => ({ default: () => <div data-testid="staffing-board-mock">Staffing Board</div> }));
vi.mock('./ShiftSimulator/ShiftScorecard', () => ({ default: () => <div data-testid="shift-scorecard-mock">Shift Scorecard</div> }));

describe('ShiftSimulator Component', () => {
  it('renders correctly', () => {
    render(<ShiftSimulator />);
    expect(screen.getByTestId('staffing-board-mock')).toBeInTheDocument();
  });
});
