import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfileAppraisalsTab from './ProfileAppraisalsTab';
import { useStore } from '../../store/useStore';
import { generateMonthlyOneOnOne } from '../../services/ai/geminiCoaching';

// Mock dependencies
vi.mock('../../store/useStore', () => ({
  useStore: {
    getState: vi.fn(() => ({ apiKey: 'test-api-key' }))
  }
}));

vi.mock('../../services/ai/geminiCoaching', () => ({
  generateMonthlyOneOnOne: vi.fn()
}));

const mockEmployee = {
  id: 'emp-123',
  name: 'John Doe',
  role: 'Advisor',
  status: 'active'
};

const mockLogs = [
  { id: 'log-1', category: 'Live Shadowing', score: 90, date: '2026-06-01', notes: 'Great job', timestamp: 12345 }
];

describe('ProfileAppraisalsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the empty state initially', () => {
    render(<ProfileAppraisalsTab employee={mockEmployee as any} associateLogs={mockLogs as any} />);
    
    expect(screen.getByTestId('review-empty-state')).toBeInTheDocument();
    expect(screen.getByTestId('generate-review-button')).toBeInTheDocument();
  });

  it('calls generateMonthlyOneOnOne when generate button is clicked and displays result', async () => {
    const mockReviewText = '## Monthly Review\nGreat performance.';
    (generateMonthlyOneOnOne as any).mockResolvedValueOnce(mockReviewText);

    render(<ProfileAppraisalsTab employee={mockEmployee as any} associateLogs={mockLogs as any} />);
    
    const generateBtn = screen.getByTestId('generate-review-button');
    fireEvent.click(generateBtn);

    expect(screen.getByTestId('review-loading-state')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(generateMonthlyOneOnOne).toHaveBeenCalledWith(mockEmployee, mockLogs, 'test-api-key');
    });

    await waitFor(() => {
      expect(screen.getByTestId('generated-review-content')).toBeInTheDocument();
    });
  });

  it('handles race conditions by not updating state if employee changes during fetch', async () => {
    let resolvePromise: (value: string) => void;
    const promise = new Promise<string>((resolve) => {
      resolvePromise = resolve;
    });
    
    (generateMonthlyOneOnOne as any).mockReturnValue(promise);

    const { rerender } = render(<ProfileAppraisalsTab employee={mockEmployee as any} associateLogs={mockLogs as any} />);
    
    // Start fetch
    fireEvent.click(screen.getByTestId('generate-review-button'));
    
    // Rerender with new employee while fetch is pending
    const newEmployee = { ...mockEmployee, id: 'emp-456', name: 'Jane Smith' };
    rerender(<ProfileAppraisalsTab employee={newEmployee as any} associateLogs={mockLogs as any} />);
    
    // Resolve the promise for the old fetch inside act
    await act(async () => {
      resolvePromise!('Stale review');
      await Promise.resolve();
    });

    // Verify that the stale text is NOT rendered (should be null, or reset for the new employee)
    expect(screen.queryByTestId('generated-review-content')).not.toBeInTheDocument();
  });
});
