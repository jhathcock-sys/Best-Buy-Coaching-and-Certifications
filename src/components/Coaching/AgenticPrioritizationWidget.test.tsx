import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AgenticPrioritizationWidget from './AgenticPrioritizationWidget';
import { useStore } from '../../store/useStore';

// Mock dependencies
vi.mock('../../store/useStore', () => ({
  useStore: Object.assign(
    vi.fn(),
    {
      getState: () => ({
        apiKey: 'fake-key',
        playbookSettings: {}
      })
    }
  )
}));

vi.mock('../../services/ai/geminiCoachingTarget', () => ({
  generateCoachingTargets: vi.fn().mockResolvedValue([
    { name: 'John Doe', reason: 'Low attach', recommendedAction: 'Roleplay' }
  ])
}));

describe('AgenticPrioritizationWidget', () => {
  beforeEach(() => {
    // Setup useStore mock to return a fake roster and API key
    vi.mocked(useStore).mockImplementation((selector: any) => {
      const state = {
        activePeriod: 'P1',
        rosterHistory: {
          P1: {
            'e1': { id: 'e1', name: 'John Doe', role: 'Advisor' }
          }
        },
        apiKey: 'fake-key',
        playbookSettings: {}
      };
      return selector(state);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<AgenticPrioritizationWidget />);
    expect(screen.getByTestId('agentic-prioritization-widget')).toBeInTheDocument();
  });

  it('handles target generation', async () => {
    render(<AgenticPrioritizationWidget />);
    const btn = screen.getByTestId('find-targets-btn');
    fireEvent.click(btn);
    
    // Loading state
    expect(screen.getByTestId('target-loading')).toBeInTheDocument();
    
    // Wait for resolution
    await waitFor(() => {
      expect(screen.queryByTestId('target-loading')).not.toBeInTheDocument();
    });
    
    // Results
    expect(screen.getByTestId('coaching-target-card-0')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
