import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import CoachSimulatorPage from '../CoachSimulatorPage';

vi.mock('../../store/useStore', () => ({
  useStore: vi.fn(() => ({})),
}));

describe('CoachSimulatorPage', () => {
  it('renders without crashing', () => {
    render(<CoachSimulatorPage />);
    expect(screen.getByTestId('coach-simulator-page')).toBeInTheDocument();
  });
});
