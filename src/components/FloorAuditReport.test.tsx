import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import FloorAuditReport from './FloorAuditReport';

describe('FloorAuditReport', () => {
  it('renders report when auditResult is provided', () => {
    const mockResult = {
      status: 'Yellow' as const,
      statusDetails: 'Test Details',
      observations: ['obs1'],
      actionPlan: ['act1']
    };

    render(
      <FloorAuditReport 
        isAuditing={false} 
        auditResult={mockResult} 
        errorMsg={null} 
      />
    );
    expect(screen.getByTestId('audit-report')).toBeInTheDocument();
    expect(screen.getByText('YELLOW STATUS')).toBeInTheDocument();
  });

  it('generates huddle script', async () => {
    const mockResult = {
      status: 'Yellow' as const,
      statusDetails: 'Test Details',
      observations: ['obs1'],
      actionPlan: ['act1']
    };

    render(
      <FloorAuditReport 
        isAuditing={false} 
        auditResult={mockResult} 
        errorMsg={null} 
      />
    );

    const generateBtn = screen.getByTestId('generate-huddle-btn');
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByTestId('huddle-script-output')).toBeInTheDocument();
    });
  });
});
