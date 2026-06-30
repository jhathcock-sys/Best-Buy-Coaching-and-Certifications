import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ShiftTrackerGoals from './ShiftTrackerGoals';
import * as useStoreModule from '../../store/useStore';

vi.mock('../../store/useStore', () => ({
  useStore: vi.fn(),
}));

describe('ShiftTrackerGoals', () => {
  const setActiveShiftMock = vi.fn();
  const mockActiveShift = {
    dailyRevenueGoal: 10000,
    dailyPmsGoal: 15,
    dailyAppsGoal: 10,
  };

  const defaultProps = {
    activeSummary: {
      totalRevenue: 5000,
      totalPms: 5,
      totalApps: 5,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useStoreModule.useStore as any).mockImplementation((selector: any) => {
      if (selector.toString().includes('activeShift')) return mockActiveShift;
      if (selector.toString().includes('setActiveShift')) return setActiveShiftMock;
      return null;
    });
  });

  it('renders goals and progresses', () => {
    render(<ShiftTrackerGoals {...defaultProps} />);
    
    // Displays goals input fields
    expect(screen.getByTestId('goal-input-revenue')).toHaveValue(10000);
    expect(screen.getByTestId('goal-input-pms')).toHaveValue(15);
    expect(screen.getByTestId('goal-input-apps')).toHaveValue(10);
    
    // Check formatted summary values
    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });

  it('allows updating goals', () => {
    render(<ShiftTrackerGoals {...defaultProps} />);
    
    fireEvent.change(screen.getByTestId('goal-input-revenue'), { target: { value: '12000' } });
    
    expect(setActiveShiftMock).toHaveBeenCalledWith({
      ...mockActiveShift,
      dailyRevenueGoal: 12000,
    });
  });

  it('returns null if activeShift is not set', () => {
    (useStoreModule.useStore as any).mockImplementation((selector: any) => {
      if (selector.toString().includes('activeShift')) return null;
      if (selector.toString().includes('setActiveShift')) return setActiveShiftMock;
      return null;
    });
    
    const { container } = render(<ShiftTrackerGoals {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });
});
