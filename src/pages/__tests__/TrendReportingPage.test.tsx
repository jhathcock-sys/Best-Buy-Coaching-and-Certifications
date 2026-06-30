import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import TrendReportingPage from '../TrendReportingPage';

describe('TrendReportingPage', () => {
  it('renders without crashing', () => {
    render(<TrendReportingPage />);
    expect(screen.getByTestId('trend-reporting-page')).toBeInTheDocument();
  });
});
