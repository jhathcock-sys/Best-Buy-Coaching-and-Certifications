import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ShiftSetupForm from './ShiftSetupForm';
import * as useStoreModule from '../../store/useStore';

vi.mock('../../store/useStore', () => ({
  useStore: vi.fn(),
}));

describe('ShiftSetupForm', () => {
  const setActiveShiftMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useStoreModule.useStore as any).mockImplementation((selector: any) => {
      if (selector.toString().includes('activeManager')) return { name: 'Test Manager' };
      if (selector.toString().includes('setActiveShift')) return setActiveShiftMock;
      return null;
    });
  });

  it('renders correctly', () => {
    render(<ShiftSetupForm />);
    expect(screen.getByTestId('shift-setup-form')).toBeInTheDocument();
    expect(screen.getByTestId('input-leader-name')).toHaveValue('Test Manager');
  });

  it('toggles weekday/weekend', () => {
    render(<ShiftSetupForm />);
    const weekdayBtn = screen.getByTestId('btn-weekday-toggle');
    const weekendBtn = screen.getByTestId('btn-weekend-toggle');
    
    fireEvent.click(weekdayBtn);
    // Because styles are inline, we check if color changes to #fff for active
    expect(weekdayBtn.style.color).toBe('rgb(255, 255, 255)');
    
    fireEvent.click(weekendBtn);
    expect(weekendBtn.style.color).toBe('rgb(255, 255, 255)');
  });

  it('starts a shift on submit', () => {
    render(<ShiftSetupForm />);
    
    // Modify a goal
    fireEvent.change(screen.getByTestId('input-revenue-goal'), { target: { value: '20000' } });
    
    fireEvent.click(screen.getByTestId('start-shift-btn'));
    
    expect(setActiveShiftMock).toHaveBeenCalledWith(
      expect.objectContaining({
        leaderName: 'Test Manager',
        dailyRevenueGoal: 20000,
      })
    );
  });
});
