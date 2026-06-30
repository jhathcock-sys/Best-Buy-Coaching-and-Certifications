import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import ProfileTrophiesTab from './ProfileTrophiesTab';

// Mock dependencies
vi.mock('../../store/useStore', () => ({
  useStore: {
    getState: () => ({ apiKey: 'fake-api-key' })
  }
}));

vi.mock('../../services/ai/geminiCoaching', () => ({
  generateActionPlan: vi.fn().mockResolvedValue({
    type: 'Test Plan',
    reason: 'Test Reason',
    planText: 'Test text'
  })
}));

const mockEmployee = {
  id: 'e1',
  name: 'Test Employee',
  role: 'Advisor',
  department: 'Sales',
  avatar: 'http://example.com/avatar.png',
  hireDate: '2020-01-01',
  metricGap: 'None',
  isMock: false,
  metrics: [],
  trophies: [
    { type: 'Top Seller', category: 'Sales', date: '2023-01-01', icon: 'Star' }
  ],
  actionPlans: []
} as any;

describe('ProfileTrophiesTab', () => {
  it('renders without crashing when employee is null', () => {
    const { container } = render(<ProfileTrophiesTab employee={null} associateLogs={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders employee trophies', () => {
    render(<ProfileTrophiesTab employee={mockEmployee} associateLogs={[]} />);
    expect(screen.getByTestId('profile-trophies-tab')).toBeInTheDocument();
    expect(screen.getByText('Top Seller')).toBeInTheDocument();
  });

  it('clicking generate PIP button disables button while generating', async () => {
    render(<ProfileTrophiesTab employee={mockEmployee} associateLogs={[]} />);
    const btn = screen.getByTestId('generate-pip-btn');
    fireEvent.click(btn);
    expect(btn).toBeDisabled();
    // Wait for async
    await screen.findByTestId('generated-plan-container');
    expect(screen.getByText('Test Plan')).toBeInTheDocument();
  });
});
