import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';
import { BrowserRouter } from 'react-router-dom';

// Mock Zustand Store
vi.mock('../store/useStore', () => ({
  useStore: vi.fn((selector) => {
    const state = {
      isAuthenticated: true,
      activeManager: { id: 'm1', name: 'Manager' },
      activeAdvisor: null,
      dbConnected: true,
      playbookSettings: {},
      isPlaybookHydrated: true,
      login: vi.fn(),
      loginAdvisor: vi.fn(),
      logout: vi.fn(),
      collapsedCategories: {},
      setCollapsedCategories: vi.fn(),
      toggleCategory: vi.fn(),
      selectedCoachingRosterEmployee: null,
      setSelectedCoachingRosterEmployee: vi.fn(),
      prefillBuilderData: null,
      setPrefillBuilderData: vi.fn(),
      prefillShadowEmployee: null,
      setPrefillShadowEmployee: vi.fn()
    };
    return selector(state);
  })
}));

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });
});
