import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import QuickLogWinForm from './QuickLogWinForm';
import { Employee } from '../../types';

describe('QuickLogWinForm', () => {
  const mockRoster: Employee[] = [
    { id: '1', name: 'John Doe', dept: 'Computing' } as Employee,
    { id: '2', name: 'Jane Smith', dept: 'Mobile' } as Employee,
  ];
  
  const defaultProps = {
    selectedEmpId: '',
    setSelectedEmpId: vi.fn(),
    getEmployeesOnShift: vi.fn(() => [mockRoster[0]]),
    roster: mockRoster,
    winType: 'pm' as 'pm' | 'app',
    setWinType: vi.fn(),
    handleLogFloorWin: vi.fn(),
  };

  it('renders correctly and matches snapshot', () => {
    render(<QuickLogWinForm {...defaultProps} />);
    expect(screen.getByTestId('win-form-container')).toBeInTheDocument();
    expect(screen.getByTestId('win-form-select')).toBeInTheDocument();
    expect(screen.getByTestId('win-form-pm')).toBeInTheDocument();
    expect(screen.getByTestId('win-form-app')).toBeInTheDocument();
    expect(screen.getByTestId('win-form-submit')).toBeInTheDocument();
  });

  it('handles win type selection', () => {
    render(<QuickLogWinForm {...defaultProps} />);
    fireEvent.click(screen.getByTestId('win-form-app'));
    expect(defaultProps.setWinType).toHaveBeenCalledWith('app');
  });

  it('handles employee selection', () => {
    render(<QuickLogWinForm {...defaultProps} />);
    fireEvent.change(screen.getByTestId('win-form-select'), { target: { value: '1' } });
    expect(defaultProps.setSelectedEmpId).toHaveBeenCalledWith('1');
  });

  it('submits the form and sets loading state', async () => {
    let resolvePromise: any;
    const handleLogMock = vi.fn(() => new Promise<void>((resolve) => {
      resolvePromise = resolve;
    }));
    
    render(<QuickLogWinForm {...defaultProps} selectedEmpId="1" handleLogFloorWin={handleLogMock} />);
    
    const submitBtn = screen.getByTestId('win-form-submit');
    fireEvent.click(submitBtn);
    
    expect(handleLogMock).toHaveBeenCalled();
    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveTextContent('Logging...');
    
    resolvePromise();
    
    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
      expect(submitBtn).toHaveTextContent('Log Floor Win! 🚀');
    });
  });
});
