import React, { createContext, useContext } from 'react';
import { Employee, DeptGoal } from '../types';

interface StoreRosterContextType {
  filteredRoster: any[];
  visibleCols: Record<string, boolean>;
  isDense: boolean;
  deptGoals: Record<string, DeptGoal>;
  rosterHistory: any;
  activePeriod: string;
  setSelectedProfileEmployee: (emp: any) => void;
  handleStartEdit: (emp: any, dept: string) => void;
  onDeleteEmployee: (id: string) => void;
  DEPARTMENTS: string[];
  onUpdateEmployeeDept: (id: string, dept: string) => void;
  onCoachEmployee?: (emp: any) => void;
  onCreateLog?: (emp: any) => void;
}

const StoreRosterContext = createContext<StoreRosterContextType | undefined>(undefined);

export const StoreRosterProvider: React.FC<{
  value: StoreRosterContextType;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return (
    <StoreRosterContext.Provider value={value}>
      {children}
    </StoreRosterContext.Provider>
  );
};

export const useStoreRosterContext = () => {
  const context = useContext(StoreRosterContext);
  if (context === undefined) {
    throw new Error('useStoreRosterContext must be used within a StoreRosterProvider');
  }
  return context;
};
