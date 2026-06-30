import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import CoachingSessionCard from '../CoachingSessionCard';
import { CoachingLog } from '../../../types';

describe('CoachingSessionCard', () => {
  it('renders without crashing', () => {
    const mockLog: CoachingLog = { id: '1', date: '2026-06-30', employeeName: 'Test Emp', employeeId: '1', category: 'Sales', notes: 'Good job', score: 90, timestamp: 123456789, coachName: 'Test Mgr', avatar: 'test.jpg' };
    render(<CoachingSessionCard session={mockLog} index={0} impact="High" onSelect={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByTestId('session-card-0')).toBeInTheDocument();
  });
});
