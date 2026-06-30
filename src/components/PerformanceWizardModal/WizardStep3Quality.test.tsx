import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WizardStep3Quality from './WizardStep3Quality';
import { useStore } from '../../store/useStore';
import { generatePerformanceGap } from '../../services/ai';

vi.mock('../../store/useStore', () => ({
  useStore: vi.fn()
}));

vi.mock('../../services/ai', () => ({
  generatePerformanceGap: vi.fn()
}));

describe('WizardStep3Quality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and increments surveys', () => {
    vi.mocked(useStore).mockImplementation((selector) => {
      // simulate returning apiKey
      return 'mock-api-key';
    });
    
    const setEditForm = vi.fn();
    const mockEditForm = {
      surveys: '0',
      rph: 0,
      transactions: 0,
      gap: ''
    } as any;

    render(
      <WizardStep3Quality 
        editForm={mockEditForm} 
        setEditForm={setEditForm} 
        departmentGoals={{}}
        employee={{ name: 'John Doe', id: '1', dept: 'PC' } as any} 
      />
    );

    expect(screen.getByText('5 Star Surveys:')).toBeInTheDocument();
    
    const plusBtn = screen.getByTestId('wizard-step3-surveys-plus');
    fireEvent.click(plusBtn);
    expect(setEditForm).toHaveBeenCalled();
  });

  it('triggers AI Analyze and updates gap', async () => {
    vi.mocked(useStore).mockImplementation(() => 'mock-api-key');
    vi.mocked(generatePerformanceGap).mockResolvedValue('Mocked AI Gap Description');

    const setEditForm = vi.fn();
    const mockEditForm = {
      surveys: '0',
      rph: 0,
      transactions: 0,
      gap: ''
    } as any;

    render(
      <WizardStep3Quality 
        editForm={mockEditForm} 
        setEditForm={setEditForm} 
        departmentGoals={{}} 
        employee={null} 
      />
    );

    const aiBtn = screen.getByTestId('ai-analyze-btn');
    fireEvent.click(aiBtn);

    await waitFor(() => {
      expect(generatePerformanceGap).toHaveBeenCalledWith(
        'mock-api-key',
        'Associate',
        mockEditForm,
        [],
        {}
      );
    });

    expect(setEditForm).toHaveBeenCalled();
    const setEditFormCall = setEditForm.mock.calls[0][0];
    const newState = typeof setEditFormCall === 'function' ? setEditFormCall(mockEditForm) : setEditFormCall;
    expect(newState.gap).toBe('Mocked AI Gap Description');
  });
});
