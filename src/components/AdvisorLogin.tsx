import { useState } from 'react';
import { Users, Search } from 'lucide-react';
import { useStore } from '../store/useStore';

interface AdvisorLoginProps {
  onLoginSuccess: (id: string, employeeData: any) => void;
  dbConnected: boolean;
}

export default function AdvisorLogin({ onLoginSuccess, dbConnected }: AdvisorLoginProps) {
  const activePeriod = useStore(state => state.activePeriod);
  const roster = useStore(state => state.rosterHistory[activePeriod] || []);
  const [employeeId, setEmployeeId] = useState('');
  const [storeId, setStoreId] = useState(() => localStorage.getItem('bby_last_store') || '');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || employeeId.length < 4) {
      setError('Please enter a valid Employee ID');
      return;
    }

    const matchedEmployee = roster.find((emp: any) => 
      emp.id === employeeId || emp.employeeId === employeeId
    );

    if (matchedEmployee) {
      setError('');
      onLoginSuccess(employeeId, matchedEmployee);
    } else {
      setError('Employee ID not found in current active roster.');
    }
  };

  return (
    <div style={{
      width: '420px',
      background: 'rgba(255, 255, 255, 0.01)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--border-glass)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
      borderRadius: '30px',
      padding: '2.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2rem'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16,185,129,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem auto',
          boxShadow: '0 0 15px rgba(16, 185, 129, 0.1)'
        }}>
          <Users size={32} color="#10b981" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.35rem 0' }}>
          Advisor Portal
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
          Enter your Employee ID to view your metrics
        </p>
      </div>

      <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <input
            type="text"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            placeholder="Store Number"
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-glass)',
              color: '#fff',
              fontSize: '1.1rem',
              textAlign: 'center',
              outline: 'none',
              marginBottom: '1rem',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--bby-yellow)'}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-glass)';
              useStore.getState().setStoreId(storeId);
            }}
          />
        </div>
        <div>
          <input
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="Employee ID"
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-glass)',
              color: '#fff',
              fontSize: '1.1rem',
              textAlign: 'center',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#10b981'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-glass)'}
          />
          {error && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>{error}</div>}
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '1rem',
            background: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Access Portal
        </button>
      </form>
    </div>
  );
}
