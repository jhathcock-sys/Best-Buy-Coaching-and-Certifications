import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import CoachingDetailsModal from '../CoachingDetailsModal';
import { CoachingLog } from '../../../types';

describe('CoachingDetailsModal', () => {
  it('renders without crashing', () => {
    const mockLog: CoachingLog = { id: '1', date: '2026-06-30', employeeName: 'Test Emp', employeeId: '1', category: 'Sales', notes: 'Good job', score: 90, timestamp: 123456789, coachName: 'Test Mgr', avatar: 'test.jpg' };
    render(<CoachingDetailsModal session={mockLog} onClose={vi.fn()} isPlayingSpeech={false} isPausedSpeech={false} onSpeechPlay={vi.fn()} onSpeechStop={vi.fn()} />);
    expect(screen.getByTestId('coaching-history-modal')).toBeInTheDocument();
  });
});
