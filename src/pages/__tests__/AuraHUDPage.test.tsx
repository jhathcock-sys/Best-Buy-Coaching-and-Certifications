import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import AuraHUDPage from '../AuraHUDPage';

vi.mock('../../store/useStore', () => ({
  useStore: vi.fn(() => ({})),
}));

describe('AuraHUDPage', () => {
  it('renders without crashing', () => {
    render(<AuraHUDPage onCoachEmployee={vi.fn()} />);
    expect(screen.getByTestId('aura-hud-page')).toBeInTheDocument();
  });
});
