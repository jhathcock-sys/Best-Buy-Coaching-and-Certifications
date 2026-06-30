import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import StoreRosterPage from '../StoreRosterPage';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock('../../store/useStore', () => ({
  useStore: vi.fn(() => ({
    employees: [],
    managers: [],
    departments: []
  })),
}));

describe('StoreRosterPage', () => {
  it('renders without crashing', () => {
    render(<StoreRosterPage onCoachEmployee={vi.fn()} onCreateLog={vi.fn()} />);
    // StoreRosterHeader usually renders 'Store Roster' or 'Associates'
    expect(document.body).toBeTruthy();
  });
});
