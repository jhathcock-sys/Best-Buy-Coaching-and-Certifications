import { useState } from 'react';
import { Shield, Delete } from 'lucide-react';
import { Manager } from '../types';
import { useStore } from '../store/useStore';

interface LoginProps {
  correctPin?: string;
  onLoginSuccess: (pin: string, storeId: string) => void;
  dbConnected: boolean;
}

export default function Login({ correctPin = '1234', onLoginSuccess, dbConnected }: LoginProps) {
  const managers = useStore((state) => state.managers) || [];
  const [pin, setPin] = useState('');
  const [storeId, setStoreId] = useState(() => localStorage.getItem('bby_last_store') || '');
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleKeyPress = async (num: string) => {
    if (pin.length < 4 && !isSuccess) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === 4) {
        setIsLoading(true);
        const success = await useStore.getState().login(newPin, storeId || '1480');
        setIsLoading(false);
        
        if (success) {
          setIsSuccess(true);
          localStorage.setItem('bby_last_store', storeId || '1480');
          setTimeout(() => {
            onLoginSuccess(newPin, storeId || '1480');
          }, 800);
        } else {
          setIsShaking(true);
          setTimeout(() => {
            setIsShaking(false);
            setPin('');
          }, 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0 && !isSuccess) {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (!isSuccess) setPin('');
  };

  return (
    <div className="login-container">
      {/* Dynamic ambient background glows */}
      <div className="login-glow-blue" />
      <div className="login-glow-yellow" />

      <div className={`login-card ${isSuccess ? 'success' : ''}`}>
        {/* Logo and Icon Header */}
        <div style={{ textAlign: 'center' }}>
          <div className={`login-logo ${isSuccess ? 'success' : ''}`}>
            <Shield size={32} color={isSuccess ? 'var(--success)' : 'var(--bby-yellow)'} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>
            {isSuccess ? 'Access Granted' : 'FloorVision Login'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
            {isSuccess ? 'Initializing leadership hub...' : 'Enter your store number and passcode PIN'}
          </p>

          {!isSuccess && (
            <input
              type="text"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              placeholder="Store Number"
              className="login-input"
              disabled={isLoading}
              onBlur={() => useStore.getState().setStoreId(storeId)}
            />
          )}
        </div>

        {/* Passcode dots display */}
        <div className={`pin-dots-container ${isShaking ? 'shake-animation' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const filled = pin.length > index;
            return (
              <div 
                key={index}
                className={`pin-dot ${isSuccess ? 'success' : filled ? 'filled' : ''}`}
              />
            );
          })}
        </div>

        {/* Touch Keypad Grid */}
        <div className="keypad-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              className="keypad-btn"
              disabled={isLoading}
              onClick={() => handleKeyPress(num.toString())}
            >
              {num}
            </button>
          ))}

          {/* Bottom row: Clear, 0, Backspace */}
          <button
            type="button"
            className="keypad-action-btn"
            onClick={handleClear}
            disabled={isLoading}
          >
            CLEAR
          </button>

          <button
            type="button"
            className="keypad-btn"
            onClick={() => handleKeyPress('0')}
            disabled={isLoading}
          >
            0
          </button>

          <button
            type="button"
            className="keypad-action-btn"
            onClick={handleBackspace}
            disabled={isLoading}
          >
            <Delete size={22} />
          </button>
        </div>

        {/* Database indicator details */}
        <div className="db-indicator">
          {dbConnected ? (
            <>
              <span className="indicator-dot active" style={{ width: '6px', height: '6px', background: 'var(--success)' }} />
              <span>Cloud Database Sync Active</span>
            </>
          ) : (
            <>
              <span className="indicator-dot active" style={{ width: '6px', height: '6px', background: 'var(--bby-yellow)' }} />
              <span>Offline Local Sandbox Mode</span>
            </>
          )}
        </div>
      </div>
      
      {/* Keypad custom shake CSS */}
      <style>{`
        .shake-animation {
          animation: shake 0.5s ease;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
