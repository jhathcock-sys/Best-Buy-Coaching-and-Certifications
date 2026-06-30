import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import FiveStarAuditor from './FiveStarAuditor';
import * as aiServices from '../services/ai';

vi.mock('../store/useStore', () => ({
  useStore: vi.fn((selector) => {
    const mockState = {
      apiKey: 'test-key',
      playbookSettings: {},
      logCoachingSession: vi.fn(),
      managers: []
    };
    return selector(mockState);
  })
}));

vi.mock('../services/ai', () => ({
  auditFiveStarSurveyGemini: vi.fn()
}));

describe('FiveStarAuditor', () => {
  it('renders correctly', () => {
    render(<FiveStarAuditor />);
    expect(screen.getByTestId('five-star-auditor')).toBeInTheDocument();
  });

  it('runs audit and shows result', async () => {
    const mockResult = {
      rating: 3,
      comment: 'test comment',
      associateName: 'Bob',
      department: 'Sales',
      rootCause: 'test cause',
      coachingScript: 'test script',
      checkItems: ['item 1']
    };
    
    vi.mocked(aiServices.auditFiveStarSurveyGemini).mockResolvedValueOnce(mockResult);

    render(<FiveStarAuditor />);

    // Load demo data
    const loadDemoBtn = screen.getByTestId('load-demo-btn');
    fireEvent.click(loadDemoBtn);

    // Run audit
    const runBtn = screen.getByTestId('run-audit-btn');
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByTestId('auditor-results')).toBeInTheDocument();
    });

    expect(screen.getByText('Bob')).toBeInTheDocument();
  });
});
