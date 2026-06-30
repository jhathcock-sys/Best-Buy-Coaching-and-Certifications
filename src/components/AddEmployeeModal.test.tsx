import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import AddEmployeeModal from './AddEmployeeModal';

// Mock the child component to isolate modal testing
vi.mock('./AddEmployeeForm', () => ({
  default: ({ onCancel }: { onCancel: () => void }) => (
    <div data-testid="mock-add-employee-form">
      <button data-testid="mock-cancel-btn" onClick={onCancel}>Cancel</button>
    </div>
  )
}));

describe('AddEmployeeModal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(<AddEmployeeModal isOpen={false} onClose={vi.fn()} onAddEmployee={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the modal when isOpen is true', () => {
    render(<AddEmployeeModal isOpen={true} onClose={vi.fn()} onAddEmployee={vi.fn()} />);
    expect(screen.getByTestId('add-employee-modal-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('mock-add-employee-form')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const mockClose = vi.fn();
    render(<AddEmployeeModal isOpen={true} onClose={mockClose} onAddEmployee={vi.fn()} />);
    fireEvent.click(screen.getByTestId('add-employee-close-btn'));
    expect(mockClose).toHaveBeenCalled();
  });
});
