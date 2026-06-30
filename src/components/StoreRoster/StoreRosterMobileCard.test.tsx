import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StoreRosterMobileCard from './StoreRosterMobileCard';

describe('StoreRosterMobileCard Component', () => {
  const mockEmployee = {
    id: 'emp1',
    name: 'Charlie',
    dept: 'Computing',
    hours: 35,
    memberships: 5,
    creditCards: 2,
    warranty: 10,
    surveys: 5,
    rph: 1500,
  };

  it('renders employee data correctly', () => {
    render(
      <StoreRosterMobileCard 
        filteredRoster={[mockEmployee as any]} 
        DEPARTMENTS={['Computing']}
        handleStartEdit={() => {}}
      />
    );

    expect(screen.getByTestId('mobile-card-emp-emp1')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });
});
