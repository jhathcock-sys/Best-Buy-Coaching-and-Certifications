import { useState } from 'react';
import { Shield, Users, ArrowLeft } from 'lucide-react';
import Login from './Login';
import AdvisorLogin from './AdvisorLogin';
import { useStore } from '../store/useStore';
import { Employee } from '../types';
import './LoginGate.css';

interface LoginGateProps {
  correctPin?: string;
  onLoginSuccess: (pin: string, storeId: string, type: 'supervisor' | 'advisor', advisorData?: Employee) => void;
  dbConnected: boolean;
  isHydrating?: boolean;
}

export default function LoginGate({ correctPin = '1234', onLoginSuccess, dbConnected, isHydrating = false }: LoginGateProps) {
  const [selectedPersona, setSelectedPersona] = useState<'none' | 'supervisor' | 'advisor'>('none');

  if (isHydrating) {
    return (
      <div className="login-gate-wrapper">
        <div className="login-gate-bg-glow-1" />
        <div className="login-gate-bg-glow-2" />
        <div className="login-gate-card">
          <div className="text-center">
            <h2 className="text-3xl font-bold m-0 mb-sm tracking-tight">FloorVision Portal</h2>
            <p className="text-secondary m-0">Select your access level</p>
          </div>
          <div className="flex-column flex-center gap-md p-xl">
            <div className="login-gate-loader"></div>
            <span className="text-secondary text-sm font-semibold">Syncing Store Configuration...</span>
          </div>
        </div>
      </div>
    );
  }

  if (selectedPersona === 'supervisor') {
    return (
      <div className="relative">
        <button 
          onClick={() => setSelectedPersona('none')}
          className="login-gate-back-btn"
          data-testid="login-gate-back-btn"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <Login 
          correctPin={correctPin}
          onLoginSuccess={(pin, storeId) => onLoginSuccess(pin, storeId, 'supervisor')}
          isHydrating={isHydrating}
        />
      </div>
    );
  }

  if (selectedPersona === 'advisor') {
    return (
      <div className="relative">
        <button 
          onClick={() => setSelectedPersona('none')}
          className="login-gate-back-btn"
          data-testid="login-gate-back-btn"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <AdvisorLogin 
          onLoginSuccess={(id, data) => onLoginSuccess('', useStore.getState().storeId || '1480', 'advisor', data)}
          dbConnected={dbConnected}
        />
      </div>
    );
  }

  return (
    <div className="login-gate-wrapper">
      <div className="login-gate-bg-glow-1" />
      <div className="login-gate-bg-glow-2" />

      <div className="login-gate-card">
        <div className="text-center">
          <h2 className="text-3xl font-bold m-0 mb-sm tracking-tight">FloorVision Portal</h2>
          <p className="text-secondary m-0">Select your access level</p>
        </div>

        <div className="flex-column gap-xl w-full">
          <button
            onClick={() => setSelectedPersona('supervisor')}
            data-testid="persona-supervisor-btn"
            className="login-gate-persona-btn supervisor cursor-pointer"
          >
            <div className="login-gate-persona-icon">
              <Shield size={32} color="var(--bby-yellow)" />
            </div>
            <div>
              <div className="login-gate-persona-title">Store Leader Access</div>
              <div className="login-gate-persona-desc">Manage roster, configure playbooks, and run metrics</div>
            </div>
          </button>

          <button
            onClick={() => setSelectedPersona('advisor')}
            data-testid="persona-advisor-btn"
            className="login-gate-persona-btn advisor cursor-pointer"
          >
            <div className="login-gate-persona-icon">
              <Users size={32} color="var(--success-glow)" />
            </div>
            <div>
              <div className="login-gate-persona-title">Sales Advisor Portal</div>
              <div className="login-gate-persona-desc">View your metrics, coaching feedback, and practice</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
