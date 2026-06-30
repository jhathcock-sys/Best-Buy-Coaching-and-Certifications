import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import AddEmployeeForm from './AddEmployeeForm';

describe('AddEmployeeForm', () => {
  it('renders correctly', () => {
    render(<AddEmployeeForm onAddEmployee={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByTestId('add-employee-form')).toBeInTheDocument();
    expect(screen.getByTestId('input-name')).toBeInTheDocument();
    expect(screen.getByTestId('btn-submit')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const mockCancel = vi.fn();
    render(<AddEmployeeForm onAddEmployee={vi.fn()} onCancel={mockCancel} />);
    fireEvent.click(screen.getByTestId('btn-cancel'));
    expect(mockCancel).toHaveBeenCalled();
  });
});
