import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { MemberDealsPage } from '../MemberDealsPage';

vi.mock('../../services/api/bestBuyApi', () => ({
  scrapeDeals: vi.fn(() => Promise.resolve([])),
}));

describe('MemberDealsPage', () => {
  it('renders without crashing', () => {
    render(<MemberDealsPage />);
    expect(screen.getAllByText(/Deals/i).length).toBeGreaterThan(0);
  });
});
