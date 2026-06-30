import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import AiEngineTab from './AiEngineTab';

describe('AiEngineTab', () => {
  it('renders without crashing', () => {
    const { container } = render(<AiEngineTab />);
    expect(container).toBeInTheDocument();
  });
});
