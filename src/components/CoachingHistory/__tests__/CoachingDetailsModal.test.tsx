import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import CoachingDetailsModal from '../CoachingDetailsModal';
import { CoachingLog } from '../../../types';

describe('CoachingDetailsModal', () => {
  it('renders without crashing', () => {
    const mockLog: CoachingLog = { id: '1', date: '2026-06-30', employeeName: 'Test Emp', associateId: '1', topic: 'Sales', comments: 'Good job', actionItems: [], duration: 15, managerName: 'Test Mgr', storeId: '1', status: 'completed' as const, visibility: 'public' as const, metadata: {}, avatar: 'test.jpg' };
    render(<CoachingDetailsModal session={mockLog} onClose={vi.fn()} isPlayingSpeech={false} isPausedSpeech={false} onSpeechPlay={vi.fn()} onSpeechStop={vi.fn()} />);
    expect(screen.getByTestId('coaching-history-modal')).toBeInTheDocument();
  });
});
