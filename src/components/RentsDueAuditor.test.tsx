import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import RentsDueAuditor from './RentsDueAuditor';

vi.mock('../store/useStore', () => ({
  useStore: vi.fn((selector) => {
    return selector({
      departments: [],
      managers: [],
      activePeriod: '2024-Q1',
      playbookSettings: {}
    });
  })
}));

describe('RentsDueAuditor Component', () => {
  it('renders correctly', () => {
    render(<RentsDueAuditor />);
    expect(screen.getByTestId('tab-audit')).toBeInTheDocument();
    expect(screen.getByTestId('tab-archives')).toBeInTheDocument();
  });
});
