import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import SupervisorProfilesTab from './SupervisorProfilesTab';

describe('SupervisorProfilesTab', () => {
  it('renders without crashing', () => {
    const { container } = render(<SupervisorProfilesTab />);
    expect(container).toBeInTheDocument();
  });
});
