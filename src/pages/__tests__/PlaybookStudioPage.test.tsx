import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import PlaybookStudioPage from '../PlaybookStudioPage';

vi.mock('../../store/useStore', () => ({
  useStore: vi.fn((selector) => {
    // Return a mock playbookSettings object
    return {
      aiEngine: 'gemini',
    };
  }),
}));

describe('PlaybookStudioPage', () => {
  it('renders without crashing', () => {
    render(<PlaybookStudioPage />);
    expect(screen.getByTestId('playbook-studio-content')).toBeInTheDocument();
  });
});
