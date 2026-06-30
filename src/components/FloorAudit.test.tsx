import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import FloorAudit from './FloorAudit';

vi.mock('../store/useStore', () => ({
  useStore: vi.fn((selector) => {
    return selector({
      playbookSettings: {}
    });
  })
}));

vi.mock('./FloorAuditUploader', () => ({
  default: ({ onRunAudit }: any) => <button data-testid="run-audit-mock" onClick={onRunAudit}>Run</button>
}));

vi.mock('./FloorAuditReport', () => ({
  default: ({ isAuditing }: any) => <div data-testid="report-mock">{isAuditing ? 'Auditing' : 'Not Auditing'}</div>
}));

vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(),
  httpsCallable: vi.fn(() => vi.fn().mockResolvedValue({ data: {} }))
}));

vi.mock('../services/firebase', () => ({
  app: {}
}));

describe('FloorAudit', () => {
  it('renders correctly', () => {
    render(<FloorAudit />);
    expect(screen.getByTestId('floor-audit-container')).toBeInTheDocument();
  });
});
