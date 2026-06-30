import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import RoleplayProgressBar from './RoleplayProgressBar';

describe('RoleplayProgressBar', () => {
  it('renders correctly', () => {
    const mockProps = {
      completedSteps: { connect: true, discover: false, recommend: false, protect: false, close: false },
      currentActiveStep: 'discover'
    };

    render(<RoleplayProgressBar {...mockProps} />);
    
    expect(screen.getByText('Connect')).toBeInTheDocument();
    expect(screen.getByText('Discover')).toBeInTheDocument();
    expect(screen.getByText('Recommend')).toBeInTheDocument();
    expect(screen.getByText('Protect')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });
});
