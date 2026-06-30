import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import AssociateProfileModal from './AssociateProfileModal';

// Mock dependencies to avoid complex renders in a basic test
vi.mock('../store/useStore', () => ({
  useStore: vi.fn(() => ({ activePeriod: '2024-Q1', updateEmployee: vi.fn(), addNotification: vi.fn() }))
}));

vi.mock('../hooks/useAssociateProfile', () => ({
  useAssociateProfile: vi.fn(() => ({
    localEmployee: { name: 'Test User' },
    isEditing: false,
    setIsEditing: vi.fn(),
    editedEmployee: {},
    setEditedEmployee: vi.fn(),
    handleSave: vi.fn()
  }))
}));

vi.mock('./MetricSparkline', () => ({ default: () => <div data-testid="mock-sparkline" /> }));
vi.mock('./AssociateProfile/ProfileTrendsTab', () => ({ default: () => <div data-testid="mock-trends" /> }));
vi.mock('./AssociateProfile/ProfileCoachingTab', () => ({ default: () => <div data-testid="mock-coaching" /> }));
vi.mock('./AssociateProfile/ProfileCommitmentsTab', () => ({ default: () => <div data-testid="mock-commitments" /> }));
vi.mock('./AssociateProfile/ProfileAppraisalsTab', () => ({ default: () => <div data-testid="mock-appraisals" /> }));
vi.mock('./AssociateProfile/ProfileTrophiesTab', () => ({ default: () => <div data-testid="mock-trophies" /> }));
vi.mock('./AssociateProfile/AssociateProfileHeader', () => ({ default: () => <div data-testid="mock-header" /> }));

describe('AssociateProfileModal', () => {
  const mockEmployee = {
    id: '1',
    name: 'John Doe',
    employeeNumber: '1234567',
    dept: 'Sales',
    hours: 40,
    memberships: 5,
    creditCards: 2,
    warranty: 1000,
    surveys: 2,
    rph: 250,
    transactions: 50,
    basket: 25,
    m365: 1,
    audio: 500,
    gap: 'None',
    focus5: false,
    history: {}
  };

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <AssociateProfileModal isOpen={false} onClose={vi.fn()} employee={mockEmployee as any} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the modal when isOpen is true', () => {
    render(
      <AssociateProfileModal isOpen={true} onClose={vi.fn()} employee={mockEmployee as any} />
    );
    expect(screen.getByTestId('associate-profile-modal-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('associate-profile-modal')).toBeInTheDocument();
  });
});
