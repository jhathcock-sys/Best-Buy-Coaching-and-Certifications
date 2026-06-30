import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import SupervisorProfilesCard from './SupervisorProfilesCard';

describe('SupervisorProfilesCard', () => {
  it('renders without crashing', () => {
    const { container } = render(<SupervisorProfilesCard />);
    expect(container).toBeInTheDocument();
  });
});
