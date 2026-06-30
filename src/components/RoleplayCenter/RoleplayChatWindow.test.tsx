import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import RoleplayChatWindow from './RoleplayChatWindow';

describe('RoleplayChatWindow', () => {
  it('renders messages correctly', () => {
    const mockProps = {
      messages: [
        { sender: 'advisor' as const, text: 'Hello there' },
        { sender: 'customer' as const, text: 'Hi' }
      ],
      isLoading: false,
      isListening: false,
      inputText: '',
      setInputText: vi.fn(),
      handleSend: vi.fn(),
      toggleMic: vi.fn(),
      messagesEndRef: { current: null }
    };

    render(<RoleplayChatWindow {...mockProps} />);
    expect(screen.getByText('Hello there')).toBeInTheDocument();
    expect(screen.getByText('Hi')).toBeInTheDocument();
  });

  it('handles input text correctly', () => {
    const setInputText = vi.fn();
    const mockProps = {
      messages: [],
      isLoading: false,
      isListening: false,
      inputText: '',
      setInputText,
      handleSend: vi.fn(),
      toggleMic: vi.fn(),
      messagesEndRef: { current: null }
    };

    render(<RoleplayChatWindow {...mockProps} />);
    const input = screen.getByTestId('chat-input');
    fireEvent.change(input, { target: { value: 'New message' } });
    expect(setInputText).toHaveBeenCalledWith('New message');
  });

  it('calls handleSend on Send button click', () => {
    const handleSend = vi.fn();
    const mockProps = {
      messages: [],
      isLoading: false,
      isListening: false,
      inputText: 'Test text',
      setInputText: vi.fn(),
      handleSend,
      toggleMic: vi.fn(),
      messagesEndRef: { current: null }
    };

    render(<RoleplayChatWindow {...mockProps} />);
    const sendButton = screen.getByTestId('send-msg-btn');
    fireEvent.click(sendButton);
    expect(handleSend).toHaveBeenCalled();
  });
});
