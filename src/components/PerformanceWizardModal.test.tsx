import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import PerformanceWizardModal from './PerformanceWizardModal';

vi.mock('../store/useStore', () => ({
  useStore: vi.fn((selector) => {
    return selector({
      employees: [],
      departments: [],
      playbookSettings: {}
    });
  })
}));

describe('PerformanceWizardModal Component', () => {
  it('renders correctly', () => {
    const mockEmployee = {
      id: '1',
      name: 'John Doe',
      dept: 'Front End'
    };
    render(
      <PerformanceWizardModal 
        isOpen={true}
        onClose={vi.fn()}
        employee={mockEmployee as any}
        onSave={vi.fn()}
        activePeriod="2024-Q1"
        deptGoals={{}}
      />
    );
    expect(screen.getByTestId('performance-wizard-modal')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-close-btn')).toBeInTheDocument();
  });
});
