import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ShiftScorecard from './ShiftScorecard';
import { SimulationResult } from './types';

describe('ShiftScorecard Component', () => {
  const mockScorecard: SimulationResult['scorecard'] = {
    revenue: 50000,
    revenueGoal: 45000,
    memberships: 15,
    creditCards: 8,
    csat: 4.9,
    placementScore: 85,
    placementReview: 'Great job!',
  };

  it('renders correctly with given scorecard data', () => {
    render(<ShiftScorecard scorecard={mockScorecard} />);
    expect(screen.getByTestId('shift-scorecard')).toBeInTheDocument();
    expect(screen.getByTestId('placement-score-tag')).toHaveTextContent('Placement Score: 85%');
    expect(screen.getByTestId('scorecard-revenue')).toHaveTextContent('$50,000');
    expect(screen.getByTestId('scorecard-csat')).toHaveTextContent('4.9');
    expect(screen.getByTestId('scorecard-memberships')).toHaveTextContent('15');
    expect(screen.getByTestId('scorecard-cards')).toHaveTextContent('8');
    expect(screen.getByTestId('scorecard-review')).toHaveTextContent('GM Placement Audit: Great job!');
  });
});
