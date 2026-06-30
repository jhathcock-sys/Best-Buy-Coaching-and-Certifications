import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import DepartmentTargetsTab from './DepartmentTargetsTab';

describe('DepartmentTargetsTab', () => {
  it('renders without crashing', () => {
    const { container } = render(<DepartmentTargetsTab />);
    expect(container).toBeInTheDocument();
  });
});
