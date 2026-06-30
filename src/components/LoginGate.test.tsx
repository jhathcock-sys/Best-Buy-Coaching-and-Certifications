import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import LoginGate from './LoginGate';

vi.mock('../store/useStore', () => ({
  useStore: Object.assign(
    vi.fn((selector) => {
      return selector({ dbConnected: true });
    }),
    {
      getState: () => ({
        storeId: '1480'
      })
    }
  )
}));

describe('LoginGate Component', () => {
  it('renders persona choices correctly', () => {
    render(<LoginGate onLoginSuccess={vi.fn()} dbConnected={true} />);
    expect(screen.getByTestId('persona-supervisor-btn')).toBeInTheDocument();
    expect(screen.getByTestId('persona-advisor-btn')).toBeInTheDocument();
  });
});
