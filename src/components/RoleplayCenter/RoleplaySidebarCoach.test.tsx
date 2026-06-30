import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import RoleplaySidebarCoach from './RoleplaySidebarCoach';

describe('RoleplaySidebarCoach', () => {
  it('renders correctly', () => {
    const mockProps = {
      stepHint: { title: 'Test Step', hint: 'This is a test hint.' },
      selectedScenario: { needs: 'Laptop', difficulty: 'Easy' }
    };

    render(<RoleplaySidebarCoach {...mockProps} />);
    
    expect(screen.getByText('Test Step')).toBeInTheDocument();
    expect(screen.getByText('This is a test hint.')).toBeInTheDocument();
    expect(screen.getByText(/Laptop/)).toBeInTheDocument();
  });
});
