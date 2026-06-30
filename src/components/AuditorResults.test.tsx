import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import AuditorResults from './AuditorResults';

describe('AuditorResults', () => {
  it('renders loading state when isAuditing is true', () => {
    render(
      <AuditorResults 
        isAuditing={true} 
        auditResult={null} 
        isSaved={false} 
        handleSaveToLogs={vi.fn()} 
      />
    );
    expect(screen.getByTestId('auditor-loading')).toBeInTheDocument();
  });

  it('renders empty state when not auditing and no results', () => {
    render(
      <AuditorResults 
        isAuditing={false} 
        auditResult={null} 
        isSaved={false} 
        handleSaveToLogs={vi.fn()} 
      />
    );
    expect(screen.getByTestId('auditor-empty')).toBeInTheDocument();
  });

  it('renders results state when auditResult is provided', () => {
    const mockResult = {
      rating: 4,
      associateName: 'John Doe',
      department: 'Computers',
      rootCause: 'Lack of empathy',
      coachingScript: 'Try asking open ended questions',
      checkItems: ['Observe interactions', 'Check uniform']
    };

    render(
      <AuditorResults 
        isAuditing={false} 
        auditResult={mockResult} 
        isSaved={false} 
        handleSaveToLogs={vi.fn()} 
      />
    );
    
    expect(screen.getByTestId('auditor-results')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Computers')).toBeInTheDocument();
    expect(screen.getByText('Lack of empathy')).toBeInTheDocument();
  });

  it('calls handleSaveToLogs when save button is clicked', () => {
    const mockSave = vi.fn();
    const mockResult = {
      rootCause: 'test',
      coachingScript: 'test'
    };

    render(
      <AuditorResults 
        isAuditing={false} 
        auditResult={mockResult} 
        isSaved={false} 
        handleSaveToLogs={mockSave} 
      />
    );

    const btn = screen.getByTestId('save-logs-btn');
    fireEvent.click(btn);
    expect(mockSave).toHaveBeenCalled();
  });
});
