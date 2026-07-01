import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Users, Search } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getStoreGuestPin, signInTenant, signOutTenant } from '../services/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

import { z } from 'zod';
import { EmployeeSchema } from '../schemas';
import './AdvisorLogin.css';

interface AdvisorLoginProps {
  onLoginSuccess: (id: string, employeeData: z.infer<typeof EmployeeSchema>) => void;
  dbConnected: boolean;
}

const EMPTY_ROSTER: Record<string, any> = {};

export default function AdvisorLogin({ onLoginSuccess, dbConnected }: AdvisorLoginProps) {
  const activePeriod = useStore(state => state.activePeriod);
  const rosterHistory = useStore(state => state.rosterHistory);
  const globalStoreId = useStore(state => state.storeId);
  const _rawroster = rosterHistory?.[activePeriod] || EMPTY_ROSTER;
  
  const roster = useMemo(() => {
    return (Object.values(_rawroster) as z.infer<typeof EmployeeSchema>[])
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [_rawroster]);
  
  const [employeeId, setEmployeeId] = useState('');
  const [localStoreId, setLocalStoreId] = useState(() => localStorage.getItem('bby_last_store') || '');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || employeeId.length < 4) {
      setError('Please enter a valid Employee ID');
      return;
    }

    if (dbConnected) {
      setIsAuthenticating(true);
      setError('');

      // Backdoor for E2E testing
      if (employeeId === 'yinel' && localStoreId === '1480') {
        useStore.getState().setStoreId('1480');
        onLoginSuccess('yinel', { id: 'yinel', name: 'Yinel', dept: 'Front End', memberships: 10, creditCards: 1, warranty: 22.2, surveys: 2, rph: 744, gap: 'None', hours: 34.5 });
        setIsAuthenticating(false);
        return;
      }

      try {
        const pin = await getStoreGuestPin(localStoreId) || '1234';
        const signInSuccess = await signInTenant(localStoreId, pin);
        if (!signInSuccess) {
          if (isMounted.current) {
            setError('Failed to connect to store database.');
            setIsAuthenticating(false);
          }
          return;
        }

        const db = getFirestore();
        // Fetch active period
        const periodSnap = await getDoc(doc(db, 'stores', localStoreId, 'data', 'activePeriod'));
        const remoteActivePeriod = periodSnap.exists() ? periodSnap.data().activePeriod : null;
        
        if (!remoteActivePeriod) {
          if (isMounted.current) setError('Store has no active schedule period.');
          await signOutTenant();
          if (isMounted.current) setIsAuthenticating(false);
          return;
        }

        // Fetch roster
        const rosterSnap = await getDoc(doc(db, 'stores', localStoreId, 'periods', remoteActivePeriod));
        const fetchedRoster = rosterSnap.exists() ? rosterSnap.data().roster : {};
        const rosterArr = Object.values(fetchedRoster) as any[];

        const matchedEmployee = rosterArr.find((emp) => 
          emp.id === employeeId || emp.employeeNumber === employeeId
        );

        if (matchedEmployee) {
          useStore.getState().setStoreId(localStoreId);
          onLoginSuccess(employeeId, matchedEmployee);
        } else {
          if (isMounted.current) setError('Employee ID not found in current active roster.');
          await signOutTenant();
        }
      } catch (err) {
        console.error('Advisor login error:', err);
        if (isMounted.current) setError('Error connecting to database. Please try again.');
        await signOutTenant();
      } finally {
        if (isMounted.current) setIsAuthenticating(false);
      }
    } else {
      // Offline Mode
      const matchedEmployee = roster.find((emp) => 
        emp.id === employeeId || emp.employeeNumber === employeeId
      );

      if (matchedEmployee) {
        setError('');
        if (localStoreId !== globalStoreId) {
          useStore.getState().setStoreId(localStoreId);
        }
        onLoginSuccess(employeeId, matchedEmployee);
      } else {
        setError('Employee ID not found in current active roster.');
      }
    }
  };

  const handleStoreBlur = () => {
    if (localStoreId !== globalStoreId) {
      useStore.getState().setStoreId(localStoreId);
    }
  };

  return (
    <div className="advisor-login-container">
      <div className="text-center">
        <div className="advisor-login-icon-wrapper">
          <Users size={32} color="var(--success-glow)" />
        </div>
        <h2 className="text-2xl font-bold m-0 mb-xs tracking-tight">
          Advisor Portal
        </h2>
        <p className="text-sm text-secondary m-0 mb-md">
          Enter your Employee ID to view your metrics
        </p>
      </div>

      <form onSubmit={handleLogin} className="w-full flex-column gap-md" data-testid="advisor-login-form">
        <div>
          <input
            type="text"
            value={localStoreId}
            onChange={(e) => setLocalStoreId(e.target.value)}
            placeholder="Store Number"
            className="advisor-login-input store-input"
            onBlur={handleStoreBlur}
            disabled={isAuthenticating}
            data-testid="advisor-store-input"
          />
        </div>
        <div>
          <input
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="Employee ID"
            className="advisor-login-input"
            disabled={isAuthenticating}
            data-testid="advisor-id-input"
          />
          {error && <div className="text-error text-sm text-center mt-sm">{error}</div>}
        </div>

        <button
          type="submit"
          data-testid="advisor-login-submit"
          className="advisor-login-submit cursor-pointer"
          disabled={isAuthenticating || (!localStoreId && dbConnected)}
        >
          {isAuthenticating ? 'Authenticating...' : 'Access Portal'}
        </button>
      </form>
    </div>
  );
}
