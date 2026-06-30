import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import SyncDiagnosticsTab from './SyncDiagnosticsTab';

describe('SyncDiagnosticsTab', () => {
  it('renders without crashing', () => {
    const { container } = render(<SyncDiagnosticsTab />);
    expect(container).toBeInTheDocument();
  });
});
