import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import GrowSimulatorTab from './GrowSimulatorTab';

describe('GrowSimulatorTab', () => {
  const mockEmployees = [
    {
      id: 'e1',
      name: 'Jane Doe',
      role: 'Advisor',
      department: 'Sales',
      avatar: 'http://example.com/avatar.png',
      hireDate: '2020-01-01',
      metricGap: 'Memberships',
      isMock: true,
      metrics: [],
    }
  ] as any[];

  it('renders employees correctly', () => {
    render(
      <GrowSimulatorTab 
        allEmployees={mockEmployees} 
        startCoaching={vi.fn()} 
        isVoiceMode={false} 
        speakText={vi.fn()} 
        onImportScenario={vi.fn()} 
      />
    );
    expect(screen.getByTestId('grow-simulator-container')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('handles scenario import', () => {
    const importMock = vi.fn();
    render(
      <GrowSimulatorTab 
        allEmployees={mockEmployees} 
        startCoaching={vi.fn()} 
        isVoiceMode={false} 
        speakText={vi.fn()} 
        onImportScenario={importMock} 
      />
    );
    
    const input = screen.getByTestId('input-coaching-notes');
    fireEvent.change(input, { target: { value: 'Name: Bob\nGap: GSP Attach' } });
    
    const btn = screen.getByTestId('btn-parse-notes');
    fireEvent.click(btn);
    
    expect(importMock).toHaveBeenCalled();
    const calledWith = importMock.mock.calls[0][0];
    expect(calledWith.name).toContain('Bob');
    expect(calledWith.metricGap).toBe('GSP Attach');
  });
});
