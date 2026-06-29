import React from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
import { Message } from './RoleplayActiveSession';

interface RoleplayChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  isListening: boolean;
  inputText: string;
  setInputText: (text: string) => void;
  handleSend: () => void;
  toggleMic: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export default function RoleplayChatWindow({
  messages,
  isLoading,
  isListening,
  inputText,
  setInputText,
  handleSend,
  toggleMic,
  messagesEndRef
}: RoleplayChatWindowProps) {
  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages?.map((m, idx) => (
          <div 
            key={idx} 
            className={`chat-bubble ${m.sender === 'advisor' ? 'bubble-advisor' : 'bubble-customer'}`}
          >
            {m.text}
          </div>
        ))}
        {isLoading && (
          <div className="chat-bubble bubble-customer flex-center-y w-[80px] p-[0.75rem_1rem]">
            <div className="typing-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-bar">
        <input 
          type="text" 
          className={`chat-input ${isListening ? 'border-error bg-[rgba(239,68,68,0.05)]' : 'border-transparent bg-white-alpha-05'}`}
          placeholder={isListening ? "Listening... Speak your response" : "Type your response to the customer..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
          data-testid="chat-input"
        />
        <button 
          className={`btn btn-icon ${isListening ? 'bg-[rgba(239,68,68,0.2)] text-error animate-pulse' : 'bg-white-alpha-10 text-white'}`}
          onClick={toggleMic} 
          disabled={isLoading}
          title="Speak response"
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <button className="btn btn-primary btn-icon" onClick={handleSend} disabled={isLoading || isListening} data-testid="send-msg-btn">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
