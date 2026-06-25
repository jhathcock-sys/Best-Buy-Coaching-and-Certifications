import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

interface AuthGateProps {
  requireManager?: boolean;
  children: React.ReactNode;
}

export default function AuthGate({ requireManager = true, children }: AuthGateProps) {
  const activeManager = useStore((state) => state.activeManager);

  if (requireManager) {
    if (!activeManager || !/manager|supervisor|leader|gm/i.test(activeManager.role)) {
      return <Navigate replace to="/dashboard" />;
    }
  }

  return <>{children}</>;
}
