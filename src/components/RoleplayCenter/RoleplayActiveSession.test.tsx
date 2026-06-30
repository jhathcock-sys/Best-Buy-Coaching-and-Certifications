import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import RoleplayActiveSession from './RoleplayActiveSession';

// Mock the zustand store to prevent errors in useStore
vi.mock('../../store/useStore', () => ({
  useStore: vi.fn((selector) => {
    const state = {
      apiKey: 'test-api-key',
      playbookSettings: { aiMode: 'standard' }
    };
    return selector ? selector(state) : state;
  })
}));

// Mock AI functions
vi.mock('../../services/ai', () => ({
  runGeminiSimulationStep: vi.fn(),
  runOfflineSimulationStep: vi.fn(),
  evaluateSessionGemini: vi.fn(),
  evaluateSessionOffline: vi.fn()
}));

// Mock child components
vi.mock('./RoleplayEvaluationState', () => ({
  default: () => <div data-testid="evaluation-state">Evaluation State</div>
}));
vi.mock('./RoleplayProgressBar', () => ({
  default: () => <div data-testid="progress-bar">Progress Bar</div>
}));
vi.mock('./RoleplayChatWindow', () => ({
  default: () => <div data-testid="chat-window">Chat Window</div>
}));
vi.mock('./RoleplaySidebarCoach', () => ({
  default: () => <div data-testid="sidebar-coach">Sidebar Coach</div>
}));

describe('RoleplayActiveSession', () => {
  it('renders properly and shows main components', () => {
    const mockScenario = {
      id: 's1',
      name: 'John',
      title: 'Buying a laptop',
      initialGreeting: 'Hi, I need a laptop',
      needs: 'Student laptop',
      difficulty: 'Easy',
      avatar: 'test.jpg'
    };
    
    render(<RoleplayActiveSession selectedScenario={mockScenario} onExit={vi.fn()} onEvaluationComplete={vi.fn()} complexity="Beginner" customerTone="Neutral" />);
    
    expect(screen.getByTestId('back-btn')).toBeInTheDocument();
    expect(screen.getByTestId('restart-session-btn')).toBeInTheDocument();
    expect(screen.getByTestId('complete-session-btn')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    
    // Verify children render
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    expect(screen.getByTestId('chat-window')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-coach')).toBeInTheDocument();
  });
});
