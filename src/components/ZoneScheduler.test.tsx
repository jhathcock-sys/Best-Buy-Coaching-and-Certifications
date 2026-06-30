import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ZoneScheduler from './ZoneScheduler';
import { useStore } from '../store/useStore';

vi.mock('../store/useStore');
vi.mock('react-hot-toast');
vi.mock('../services/ai/geminiSmartZoning', () => ({
  generateSmartZoning: vi.fn().mockResolvedValue({ 'Computing': ['123'] })
}));
// Mock child components to keep tests shallow
vi.mock('./ZoneScheduler/ZoneGrid', () => ({
  default: () => <div data-testid="mock-zone-grid">ZoneGrid</div>
}));
vi.mock('./ZoneScheduler/ZoneTimeline', () => ({
  default: () => <div data-testid="mock-zone-timeline">ZoneTimeline</div>
}));

describe('ZoneScheduler Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (useStore as unknown as any).mockReturnValue({
      activePeriod: '2023-01',
      rosterHistory: {
        '2023-01': {
          '1': { id: '1', name: 'John Doe', dept: 'Computing' }
        }
      },
      apiKey: 'test-api-key',
      playbookSettings: { useGemini: false }
    });
  });

  const defaultProps = {
    zoneAssignments: {},
    onAssignZone: vi.fn(),
    onUnassignZone: vi.fn(),
    activeBreaks: {},
    onToggleBreakState: vi.fn(),
    onImportSchedule: vi.fn(),
  };

  it('renders the ZoneScheduler with grid view by default', () => {
    render(<ZoneScheduler {...defaultProps} />);
    expect(screen.getByTestId('zone-scheduler-container')).toBeInTheDocument();
    expect(screen.getByTestId('mock-zone-grid')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-zone-timeline')).not.toBeInTheDocument();
  });

  it('toggles between grid and timeline views', () => {
    render(<ZoneScheduler {...defaultProps} />);
    
    // Switch to timeline
    fireEvent.click(screen.getByTestId('view-mode-timeline'));
    expect(screen.getByTestId('mock-zone-timeline')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-zone-grid')).not.toBeInTheDocument();

    // Switch back to grid
    fireEvent.click(screen.getByTestId('view-mode-grid'));
    expect(screen.getByTestId('mock-zone-grid')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-zone-timeline')).not.toBeInTheDocument();
  });

  it('handles auto deploy click', async () => {
    render(<ZoneScheduler {...defaultProps} />);
    const deployBtn = screen.getByTestId('auto-deploy-btn');
    fireEvent.click(deployBtn);
    expect(deployBtn).toBeDisabled();
    // In a full environment it resolves and enables back, but for shallow test it's fine
  });
});
