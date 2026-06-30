import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomScenariosTab from './CustomScenariosTab';
import { useStore } from '../../store/useStore';

vi.mock('../../store/useStore', () => ({
  useStore: vi.fn()
}));

// Mock CustomScenarioForm to isolate CustomScenariosTab
vi.mock('./CustomScenarioForm', () => ({
  default: () => <div data-testid="mock-custom-scenario-form">Form</div>
}));

describe('CustomScenariosTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no custom scenarios exist', () => {
    vi.mocked(useStore).mockImplementation(() => ({
      customScenarios: [],
      deleteCustomScenario: vi.fn()
    }));

    render(<CustomScenariosTab />);

    expect(screen.getByText(/No custom roleplay scenarios added yet/i)).toBeInTheDocument();
  });

  it('renders custom scenarios when they exist', () => {
    vi.mocked(useStore).mockImplementation(() => ({
      customScenarios: [
        {
          id: 'test-scenario-1',
          title: 'Angry Customer',
          name: 'Karen',
          difficulty: 'Hard',
          avatar: 'avatar.png'
        }
      ],
      deleteCustomScenario: vi.fn()
    }));

    render(<CustomScenariosTab />);

    expect(screen.getByText('Angry Customer')).toBeInTheDocument();
    expect(screen.getByText('Customer: Karen | Hard')).toBeInTheDocument();
  });

  it('calls deleteCustomScenario when trash button is clicked', () => {
    const deleteCustomScenario = vi.fn();
    vi.mocked(useStore).mockImplementation(() => ({
      customScenarios: [
        {
          id: 'test-scenario-1',
          title: 'Angry Customer',
          name: 'Karen',
          difficulty: 'Hard',
          avatar: 'avatar.png'
        }
      ],
      deleteCustomScenario
    }));

    render(<CustomScenariosTab />);

    const deleteBtn = screen.getByTestId('delete-scenario-test-scenario-1');
    fireEvent.click(deleteBtn);

    expect(deleteCustomScenario).toHaveBeenCalledWith('test-scenario-1');
  });
});
