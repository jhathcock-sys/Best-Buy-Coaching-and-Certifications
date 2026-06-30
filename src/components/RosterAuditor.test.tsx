import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import RosterAuditor from './RosterAuditor';

vi.mock('../store/useStore', () => ({
  useStore: vi.fn((selector) => {
    return selector({
      employees: [],
      departments: [],
      playbookSettings: {}
    });
  })
}));

describe('RosterAuditor Component', () => {
  it('renders correctly', () => {
    render(<RosterAuditor />);
    expect(screen.getByTestId('load-demo-data-btn')).toBeInTheDocument();
    expect(screen.getByTestId('run-audit-btn')).toBeInTheDocument();
  });
});
