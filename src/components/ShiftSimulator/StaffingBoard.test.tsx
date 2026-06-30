import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StaffingBoard from './StaffingBoard';

describe('StaffingBoard Component', () => {
  const mockRoster = [
    { id: '1', name: 'Alice', dept: 'Computing', gap: 'None' },
    { id: '2', name: 'Bob', dept: 'Mobile', gap: 'Memberships' }
  ];

  it('renders all zones and handles assignments', () => {
    const handleSelectEmployee = vi.fn();
    const handleRunSimulation = vi.fn();
    
    render(
      <StaffingBoard 
        roster={mockRoster as any} 
        placements={{ 'Computing': '1' }} 
        handleSelectEmployee={handleSelectEmployee} 
        handleRunSimulation={handleRunSimulation} 
        isSimulating={false} 
        isAnyAssigned={true} 
      />
    );

    expect(screen.getByTestId('staffing-board')).toBeInTheDocument();
    expect(screen.getByTestId('staffing-select-Computing')).toHaveValue('1');
    expect(screen.getByTestId('staffing-select-Mobile')).toHaveValue('');

    fireEvent.change(screen.getByTestId('staffing-select-Mobile'), { target: { value: '2' } });
    expect(handleSelectEmployee).toHaveBeenCalledWith('Mobile', '2');

    fireEvent.click(screen.getByTestId('start-simulation-btn'));
    expect(handleRunSimulation).toHaveBeenCalled();
  });
});
