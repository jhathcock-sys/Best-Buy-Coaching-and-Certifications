import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import OcvObservationForm from './OcvObservationForm';

describe('OcvObservationForm', () => {
  const mockRoster = [
    { id: 'emp-1', name: 'John Doe', dept: 'Sales' },
    { id: 'emp-2', name: 'Jane Smith', dept: 'Geek Squad' }
  ];
  
  const mockGetEmployeesOnShift = vi.fn().mockReturnValue([mockRoster[0]]);
  const mockHandleLogOcvObservation = vi.fn().mockResolvedValue(true);
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders the form correctly', () => {
    render(
      <OcvObservationForm 
        roster={mockRoster as any} 
        getEmployeesOnShift={mockGetEmployeesOnShift} 
        handleLogOcvObservation={mockHandleLogOcvObservation} 
      />
    );
    
    expect(screen.getByTestId('ocv-emp-select')).toBeInTheDocument();
    expect(screen.getByTestId('ocv-checkbox-connect')).toBeInTheDocument();
    expect(screen.getByTestId('ocv-submit-btn')).toBeInTheDocument();
  });

  it('submits form successfully and shows success message', async () => {
    render(
      <OcvObservationForm 
        roster={mockRoster as any} 
        getEmployeesOnShift={mockGetEmployeesOnShift} 
        handleLogOcvObservation={mockHandleLogOcvObservation} 
      />
    );
    
    // Select employee
    fireEvent.change(screen.getByTestId('ocv-emp-select'), { target: { value: 'emp-1' } });
    
    // Check 'Connect'
    fireEvent.click(screen.getByTestId('ocv-checkbox-connect'));
    
    // Add notes
    fireEvent.change(screen.getByTestId('ocv-notes-textarea'), { target: { value: 'Good job' } });
    
    // Submit form
    const submitBtn = screen.getByTestId('ocv-submit-btn');
    fireEvent.click(submitBtn);
    
    expect(submitBtn).toBeDisabled();
    
    await act(async () => {
      // Resolve promise
      await Promise.resolve();
    });
    
    expect(screen.getByTestId('ocv-success-msg')).toBeInTheDocument();
    
    // Fast forward 3 seconds for the message to disappear
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(screen.queryByTestId('ocv-success-msg')).not.toBeInTheDocument();
  });

  it('handles unmount safely during submission to prevent state updates', async () => {
    let resolvePromise: any;
    const slowPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockHandleLogOcvObservation.mockReturnValue(slowPromise);
    
    const { unmount } = render(
      <OcvObservationForm 
        roster={mockRoster as any} 
        getEmployeesOnShift={mockGetEmployeesOnShift} 
        handleLogOcvObservation={mockHandleLogOcvObservation} 
      />
    );
    
    fireEvent.change(screen.getByTestId('ocv-emp-select'), { target: { value: 'emp-1' } });
    
    const submitBtn = screen.getByTestId('ocv-submit-btn');
    fireEvent.click(submitBtn);
    
    // Unmount while submitting
    unmount();
    
    await act(async () => {
      resolvePromise(true);
    });
  });
});
