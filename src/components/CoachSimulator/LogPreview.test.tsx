import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import LogPreview from './LogPreview';

describe('LogPreview', () => {
  const defaultProps = {
    isGeneratingLog: false,
    outputViewMode: 'grow',
    setOutputViewMode: vi.fn(),
    coachingLogText: 'Test Grow Plan',
    huddleScriptText: 'Test Huddle Script',
    copySuccess: false,
    handleCopyToClipboard: vi.fn(),
    isPlayingSpeech: false,
    isPausedSpeech: false,
    handleSpeech: vi.fn(),
    handleStopSpeech: vi.fn()
  };

  it('renders log preview correctly', () => {
    render(<LogPreview {...defaultProps} />);
    expect(screen.getByTestId('log-preview-container')).toBeInTheDocument();
    expect(screen.getByText('Test Grow Plan')).toBeInTheDocument();
  });

  it('shows skeleton when generating', () => {
    render(<LogPreview {...defaultProps} isGeneratingLog={true} />);
    expect(screen.getByTestId('log-loading-skeleton')).toBeInTheDocument();
  });

  it('toggles output mode', () => {
    render(<LogPreview {...defaultProps} />);
    const huddleBtn = screen.getByTestId('btn-huddle-script');
    fireEvent.click(huddleBtn);
    expect(defaultProps.setOutputViewMode).toHaveBeenCalledWith('huddle');
  });
});
