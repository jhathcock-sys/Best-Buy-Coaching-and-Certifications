import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

describe('ErrorBoundary', () => {
  const ProblemChild = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>All good</div>;
  };

  beforeEach(() => {
    // Suppress console.error for expected errors in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders error UI when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByTestId('error-boundary-container')).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    expect(screen.getByTestId('error-readout')).toHaveTextContent('Test error');
  });

  it('handles reload button click', () => {
    // Mock window.location.reload
    const originalReload = window.location.reload;
    Object.defineProperty(window, 'location', {
      value: { reload: vi.fn() },
      writable: true
    });

    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    const btn = screen.getByTestId('error-boundary-reload-btn');
    fireEvent.click(btn);
    expect(window.location.reload).toHaveBeenCalled();

    // Restore
    Object.defineProperty(window, 'location', {
      value: { reload: originalReload },
      writable: true
    });
  });
});
