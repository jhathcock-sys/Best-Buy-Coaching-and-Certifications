import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import CoachingSessionCard from '../CoachingSessionCard';
import { CoachingLog } from '../../../types';

describe('CoachingSessionCard', () => {
  it('renders without crashing', () => {
    const mockLog: CoachingLog = { id: '1', date: '2026-06-30', employeeName: 'Test Emp', associateId: '1', topic: 'Sales', comments: 'Good job', actionItems: [], duration: 15, managerName: 'Test Mgr', storeId: '1', status: 'completed' as const, visibility: 'public' as const, metadata: {}, avatar: 'test.jpg' };
    render(<CoachingSessionCard session={mockLog} index={0} impact="High" onSelect={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByTestId('session-card-0')).toBeInTheDocument();
  });
});
