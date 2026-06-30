import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import BbyVocabTab from './BbyVocabTab';

describe('BbyVocabTab', () => {
  it('renders without crashing', () => {
    const { container } = render(<BbyVocabTab />);
    expect(container).toBeInTheDocument();
  });
});
