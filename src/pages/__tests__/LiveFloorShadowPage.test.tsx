import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import LiveFloorShadowPage from '../LiveFloorShadowPage';

vi.mock('../../store/useStore', () => ({
  useStore: vi.fn(() => ({})),
}));

describe('LiveFloorShadowPage', () => {
  it('renders without crashing', () => {
    render(<LiveFloorShadowPage onNavigate={vi.fn()} preselectedEmployee={null} clearPreselectedEmployee={vi.fn()} />);
    // Just verifying it renders or has some content
    expect(screen.getByText(/Live Floor Shadow/i) || screen.getByRole('heading')).toBeInTheDocument();
  });
});
