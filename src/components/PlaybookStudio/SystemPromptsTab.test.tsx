import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import SystemPromptsTab from './SystemPromptsTab';

describe('SystemPromptsTab', () => {
  it('renders without crashing', () => {
    const { container } = render(<SystemPromptsTab />);
    expect(container).toBeInTheDocument();
  });
});
