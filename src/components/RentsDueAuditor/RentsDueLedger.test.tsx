import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import RentsDueLedger from './RentsDueLedger';

describe('RentsDueLedger', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <RentsDueLedger 
        gaps={{ rev: 0, apps: 0, pms: 0 }}
        parsedEmployees={[]}
        setParsedEmployees={vi.fn()}
        syncSuccess={false}
        handleSyncToRoster={vi.fn()}
      />
    );
    expect(container).toBeInTheDocument();
  });
});
