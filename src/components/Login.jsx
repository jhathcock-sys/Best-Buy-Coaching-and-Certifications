import React, { useState, useEffect } from 'react';
import { Shield, Key, ChevronRight, AlertCircle, RefreshCw, X, Delete } from 'lucide-react';
import { MANAGERS } from '../store/useStore';

export default function Login({ correctPin = '1234', onLoginSuccess, dbConnected }) {
  const [pin, setPin] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate the PIN code when it reaches 4 digits
  useEffect(() => {
    if (pin.length === 4) {
      const isManagerPin = MANAGERS.some(m => m.pin === pin);
      const isStorePin = pin === correctPin;
      
      if (isManagerPin || isStorePin) {
        setIsSuccess(true);
        setTimeout(() => {
          onLoginSuccess(pin);
        }, 800);
      } else {
        // Shake and reset on failure
        setIsShaking(true);
        setTimeout(() => {
          setIsShaking(false);
          setPin('');
        }, 600);
      }
    }
  }, [pin, correctPin, onLoginSuccess]);

  const handleKeyPress = (num) => {
    if (pin.length < 4 && !isSuccess) {
      setPin(prev => prev + num);
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
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(circle at center, #0a0e17 0%, #03050a 100%)',
      color: '#fff',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-sans)',
      overflow: 'hidden'
    }}>
      {/* Dynamic ambient background glows */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(0, 70, 190, 0.08) 0%, transparent 60%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(253, 216, 53, 0.03) 0%, transparent 60%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div style={{
        width: '420px',
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: isSuccess ? '1.5px solid var(--success)' : '1px solid var(--border-glass)',
        boxShadow: isSuccess ? '0 8px 32px rgba(16, 185, 129, 0.05)' : '0 12px 40px rgba(0,0,0,0.4)',
        borderRadius: '30px',
        padding: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        transition: 'all 0.4s ease',
        transform: isSuccess ? 'scale(1.02)' : 'none'
      }}>
        {/* Logo and Icon Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: isSuccess ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0, 70, 190, 0.1)',
            border: isSuccess ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(0,70,190,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            boxShadow: isSuccess ? '0 0 20px rgba(16, 185, 129, 0.2)' : '0 0 15px rgba(0, 70, 190, 0.1)',
            transition: 'all 0.4s ease'
          }}>
            <Shield size={32} color={isSuccess ? 'var(--success)' : 'var(--bby-yellow)'} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>
            {isSuccess ? 'Access Granted' : 'BlueCoach AI Login'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            {isSuccess ? 'Initializing leadership hub...' : 'Enter your store or manager 4-digit passcode PIN'}
          </p>
        </div>

        {/* Passcode dots display */}
        <div 
          className={isShaking ? 'shake-animation' : ''}
          style={{
            display: 'flex',
            gap: '1.25rem',
            justifyContent: 'center',
            margin: '0.5rem 0'
          }}
        >
          {[0, 1, 2, 3].map((index) => {
            const filled = pin.length > index;
            return (
              <div 
                key={index}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: isSuccess 
                    ? 'var(--success)' 
                    : filled 
                      ? 'var(--bby-yellow)' 
                      : 'rgba(255,255,255,0.06)',
                  border: isSuccess
                    ? 'none'
                    : filled 
                      ? 'none' 
                      : '1px solid rgba(255,255,255,0.15)',
                  boxShadow: isSuccess
                    ? '0 0 10px var(--success)'
                    : filled 
                      ? '0 0 8px var(--bby-yellow)' 
                      : 'none',
                  transform: filled ? 'scale(1.1)' : 'scale(1.0)',
                  transition: 'all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              />
            );
          })}
        </div>

        {/* Touch Keypad Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          width: '100%',
          maxWidth: '280px'
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              className="keypad-btn"
              onClick={() => handleKeyPress(num.toString())}
              style={{
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-glass)',
                color: '#fff',
                fontSize: '1.4rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                e.currentTarget.style.transform = 'scale(1.0)';
              }}
            >
              {num}
            </button>
          ))}

          {/* Bottom row: Clear, 0, Backspace */}
          <button
            type="button"
            onClick={handleClear}
            style={{
              height: '64px',
              borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            CLEAR
          </button>

          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            style={{
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-glass)',
              color: '#fff',
              fontSize: '1.4rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
              e.currentTarget.style.transform = 'scale(1.0)';
            }}
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            style={{
              height: '64px',
              borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <Delete size={22} />
          </button>
        </div>

        {/* Database indicator details */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border-glass)',
          padding: '0.4rem 1rem',
          borderRadius: '20px'
        }}>
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
