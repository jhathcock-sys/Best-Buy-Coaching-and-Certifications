import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import BreakRunSheet from './BreakRunSheet';

describe('BreakRunSheet', () => {
  const mockRoster = [
    { id: '1', name: 'John Doe', dept: 'Computers', role: 'Advisor' },
    { id: '2', name: 'Jane Smith', dept: 'Mobile', role: 'Advisor' }
  ];

  const mockSchedule = [
    { id: 'b1', empId: '1', name: 'John Doe', time: '12:00 PM', type: '15 min Break', completed: false }
  ];

  it('renders correctly', () => {
    render(
      <BreakRunSheet 
        roster={mockRoster as any} 
        breakSchedule={mockSchedule as any} 
        onAddBreak={vi.fn()} 
        onToggleBreak={vi.fn()} 
        onDeleteBreak={vi.fn()} 
      />
    );
    expect(screen.getByText("Breaks & Lunches Run Sheet")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it('calls onAddBreak when form is submitted', () => {
    const mockAdd = vi.fn();
    render(
      <BreakRunSheet 
        roster={mockRoster as any} 
        breakSchedule={[]} 
        onAddBreak={mockAdd} 
        onToggleBreak={vi.fn()} 
        onDeleteBreak={vi.fn()} 
      />
    );

    // Select employee
    const select = screen.getAllByRole('combobox')[0]; // First select is associate
    fireEvent.change(select, { target: { value: '1' } });
    
    // Submit
    const btn = screen.getByTestId('add-break-submit');
    fireEvent.click(btn);

    expect(mockAdd).toHaveBeenCalled();
  });
});
