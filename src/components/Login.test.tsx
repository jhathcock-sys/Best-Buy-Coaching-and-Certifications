import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import Login from './Login';

vi.mock('../store/useStore', () => ({
  useStore: Object.assign(
    vi.fn((selector) => {
      return selector({ dbConnected: true });
    }),
    {
      getState: () => ({
        dbConnected: true,
        login: vi.fn().mockResolvedValue(true),
        setStoreId: vi.fn(),
      })
    }
  )
}));

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

describe('Login Component', () => {
  it('renders without crashing', () => {
    render(<Login onLoginSuccess={vi.fn()} />);
    expect(screen.getByTestId('store-input')).toBeInTheDocument();
  });
});
