import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import StorePinSecurityCard from './StorePinSecurityCard';

describe('StorePinSecurityCard', () => {
  it('renders without crashing', () => {
    const { container } = render(<StorePinSecurityCard />);
    expect(container).toBeInTheDocument();
  });
});
