import React from 'react';
import { useState } from 'react';
import { Users, Search } from 'lucide-react';
import { useStore } from '../store/useStore';

import { z } from 'zod';
import { EmployeeSchema } from '../schemas';
import './AdvisorLogin.css';

interface AdvisorLoginProps {
  onLoginSuccess: (id: string, employeeData: z.infer<typeof EmployeeSchema>) => void;
  dbConnected: boolean;
}

export default function AdvisorLogin({ onLoginSuccess, dbConnected }: AdvisorLoginProps) {
  const activePeriod = useStore(state => state.activePeriod);
  const rosterHistory = useStore(state => state.rosterHistory);
  const _rawroster = rosterHistory?.[activePeriod] || {};
  const roster = React.useMemo(() => (Object.values(_rawroster) as z.infer<typeof EmployeeSchema>[]).sort((a, b) => a.name.localeCompare(b.name)), [_rawroster]);
  const [employeeId, setEmployeeId] = useState('');
  const [storeId, setStoreId] = useState(() => localStorage.getItem('bby_last_store') || '');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || employeeId.length < 4) {
      setError('Please enter a valid Employee ID');
      return;
    }

    const matchedEmployee = roster.find((emp) => 
      emp.id === employeeId || emp.employeeNumber === employeeId
    );

    if (matchedEmployee) {
      setError('');
      onLoginSuccess(employeeId, matchedEmployee);
    } else {
      setError('Employee ID not found in current active roster.');
    }
  };

  return (
    <div className="advisor-login-container">
      <div className="text-center">
        <div className="advisor-login-icon-wrapper">
          <Users size={32} color="#10b981" />
        </div>
        <h2 className="text-2xl font-bold m-0 mb-xs tracking-tight">
          Advisor Portal
        </h2>
        <p className="text-sm text-secondary m-0 mb-md">
          Enter your Employee ID to view your metrics
        </p>
      </div>

      <form onSubmit={handleLogin} className="w-full flex-column gap-md">
        <div>
          <input
            type="text"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            placeholder="Store Number"
            className="advisor-login-input store-input"
            onBlur={(e) => {
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
            className="advisor-login-input"
          />
          {error && <div className="text-error text-sm text-center mt-sm">{error}</div>}
        </div>

        <button
          type="submit"
          data-testid="advisor-login-submit"
          className="advisor-login-submit"
        >
          Access Portal
        </button>
      </form>
    </div>
  );
}
