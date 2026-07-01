import { describe, it, expect, vi } from 'vitest';

vi.mock('react-dom/client', () => {
  return {
    createRoot: vi.fn(() => ({
      render: vi.fn(),
    })),
  };
});

describe('main.tsx', () => {
  it('executes createRoot without crashing', async () => {
    // Create a mock DOM element for the root
    const rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);

    // Dynamic import to execute main.tsx logic
    await import('../main');
    
    const { createRoot } = await import('react-dom/client');
    expect(createRoot).toHaveBeenCalledWith(rootElement);

    // Clean up
    document.body.removeChild(rootElement);
  });
});
