import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ShiftHandoffModal from './ShiftHandoffModal';

// Mock AI module
vi.mock('../../services/ai/geminiHandoff', () => ({
  generateHandoffBriefing: vi.fn().mockResolvedValue('Mocked briefing text'),
}));

describe('ShiftHandoffModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    activeShift: {} as any,
    roster: [],
    followUpTasks: [],
    playbookSettings: {} as any,
    apiKey: 'test-key',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<ShiftHandoffModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('handoff-modal')).not.toBeInTheDocument();
  });

  it('renders correctly when isOpen is true', () => {
    render(<ShiftHandoffModal {...defaultProps} />);
    expect(screen.getByTestId('handoff-modal')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('generates handoff briefing', async () => {
    render(<ShiftHandoffModal {...defaultProps} />);
    
    const generateBtn = screen.getByTestId('generate-handoff-btn');
    fireEvent.click(generateBtn);
    
    // Will show loading
    expect(screen.getByText('Analyzing shift data & writing briefing...')).toBeInTheDocument();
    
    // Will finish loading and show mock text
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toHaveValue('Mocked briefing text');
    });
  });
});
