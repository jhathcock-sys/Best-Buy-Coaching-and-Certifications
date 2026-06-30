import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import AdvisorLogin from './AdvisorLogin';

// Mock store
vi.mock('../store/useStore', () => ({
  useStore: vi.fn((selector) => {
    // Provide safe defaults for the selectors
    const state = {
      activePeriod: '2024-Q1',
      rosterHistory: {},
      storeId: '01234'
    };
    return selector(state);
  })
}));

// Mock firebase
vi.mock('../services/firebase', () => ({
  getStoreGuestPin: vi.fn(),
  signInTenant: vi.fn(),
  signOutTenant: vi.fn()
}));
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn()
}));

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

describe('AdvisorLogin', () => {
  it('renders correctly', () => {
    render(<AdvisorLogin onLoginSuccess={vi.fn()} dbConnected={true} />);
    expect(screen.getByTestId('advisor-login-form')).toBeInTheDocument();
    expect(screen.getByTestId('advisor-login-submit')).toBeInTheDocument();
  });
});
