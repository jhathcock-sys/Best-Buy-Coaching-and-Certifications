import { useState } from 'react';
import { Shield, Users, ArrowLeft } from 'lucide-react';
import Login from './Login';
import AdvisorLogin from './AdvisorLogin';
import { useStore } from '../store/useStore';

interface LoginGateProps {
  correctPin?: string;
  onLoginSuccess: (pin: string, storeId: string, type: 'supervisor' | 'advisor', advisorData?: any) => void;
  dbConnected: boolean;
  isHydrating?: boolean;
}

export default function LoginGate({ correctPin = '1234', onLoginSuccess, dbConnected, isHydrating = false }: LoginGateProps) {
  const [selectedPersona, setSelectedPersona] = useState<'none' | 'supervisor' | 'advisor'>('none');

  if (selectedPersona === 'supervisor') {
    return (
      <div style={{ position: 'relative' }}>
        <button 
          onClick={() => setSelectedPersona('none')}
          style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 100000, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '20px', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
        >
          <ArrowLeft size={18} />
          <span style={{ fontWeight: 600 }}>Back</span>
        </button>
        <Login 
          correctPin={correctPin}
          onLoginSuccess={(pin, storeId) => onLoginSuccess(pin, storeId, 'supervisor')}
          dbConnected={dbConnected}
        />
      </div>
    );
  }

  if (selectedPersona === 'advisor') {
    return (
      <div style={{ position: 'relative' }}>
        <button 
          onClick={() => setSelectedPersona('none')}
          style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 100000, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '20px', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
        >
          <ArrowLeft size={18} />
          <span style={{ fontWeight: 600 }}>Back</span>
        </button>
        <AdvisorLogin 
          onLoginSuccess={(id, data) => onLoginSuccess('', useStore.getState().storeId || '1480', 'advisor', data)}
          dbConnected={dbConnected}
        />
      </div>
    );
  }

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
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(0, 70, 190, 0.08) 0%, transparent 60%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(253, 216, 53, 0.03) 0%, transparent 60%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div style={{
        width: '500px',
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-glass)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        borderRadius: '30px',
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2.5rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>FloorVision Portal</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Select your access level</p>
        </div>

        {isHydrating ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--white-alpha-10)', borderTopColor: 'var(--bby-yellow)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Syncing Store Configuration...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            <button
              onClick={() => setSelectedPersona('supervisor')}
            style={{
              width: '100%',
              background: 'rgba(0, 70, 190, 0.1)',
              border: '1px solid rgba(0, 70, 190, 0.3)',
              borderRadius: '20px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              color: '#fff',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 70, 190, 0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 70, 190, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '15px' }}>
              <Shield size={32} color="var(--bby-yellow)" />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>Store Leader Access</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Manage roster, configure playbooks, and run metrics</div>
            </div>
          </button>

          <button
            onClick={() => setSelectedPersona('advisor')}
            style={{
              width: '100%',
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '20px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              color: '#fff',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '15px' }}>
              <Users size={32} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>Sales Advisor Portal</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>View your metrics, coaching feedback, and practice</div>
            </div>
          </button>
        </div>
        )}
      </div>
    </div>
  );
}
