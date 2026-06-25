import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

interface AuthGateProps {
  requireManager?: boolean;
  children: React.ReactNode;
}

export default function AuthGate({ requireManager, children }: AuthGateProps) {
  const activeManager = useStore((state) => state.activeManager);

  if (requireManager && !activeManager) {
    return <Navigate replace to="/dashboard" />;
  }

  return <>{children}</>;
}
