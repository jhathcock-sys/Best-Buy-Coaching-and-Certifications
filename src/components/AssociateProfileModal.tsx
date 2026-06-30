import React, { useState, useEffect } from 'react';
import { X, TrendingUp, ClipboardList, Calendar, Volume2, Square, Clock, AlertCircle, CheckCircle, FileText, Loader2, Award } from 'lucide-react';
import MetricSparkline from './MetricSparkline';
import ProfileTrendsTab from './AssociateProfile/ProfileTrendsTab';
import ProfileCoachingTab from './AssociateProfile/ProfileCoachingTab';
import ProfileCommitmentsTab from './AssociateProfile/ProfileCommitmentsTab';
import ProfileAppraisalsTab from './AssociateProfile/ProfileAppraisalsTab';
import ProfileTrophiesTab from './AssociateProfile/ProfileTrophiesTab';
import AssociateProfileHeader from './AssociateProfile/AssociateProfileHeader';
import { calculateCVI } from '../store/cviHelper';

import { useStore } from '../store/useStore';

import { Employee } from '../types';

export interface AssociateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}


import { useAssociateProfile } from '../hooks/useAssociateProfile';
const EMPTY_OBJ = {};
const EMPTY_ARR: never[] = [];

export default function AssociateProfileModal({
  isOpen,
  onClose,
  employee
}: AssociateProfileModalProps) {
  const rosterHistory = useStore(state => state.rosterHistory) || EMPTY_OBJ;
  const coachingLogs = useStore(state => state.coachingLogs) || EMPTY_ARR;
  const followUpTasks = useStore(state => state.followUpTasks) || EMPTY_ARR;
  const deptGoals = useStore(state => state.deptGoals) || EMPTY_OBJ;
  const activePeriod = useStore(state => state.activePeriod);
  const {
    activeTab, setActiveTab,
    sortedPeriods,
    historyPoints,
    activeHistoryPoints,
    associateLogs,
    associateTasks,
    activeGoals
  } = useAssociateProfile(isOpen, employee);

  if (!isOpen || !employee) return null;

  return (
    <div className="modal-overlay z-1050 cursor-pointer" onClick={onClose} data-testid="associate-profile-modal-overlay">
      <div 
        className="modal-content cursor-default overflow-hidden p-0" 
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        data-testid="associate-profile-modal"
      >
        {/* Modal Header */}
        <AssociateProfileHeader 
          employee={employee}
          rosterHistory={rosterHistory}
          activePeriod={activePeriod}
          onClose={onClose}
        />

        {/* Tab Selection Row */}
        <div className="flex-row bg-white-alpha-10 border-bottom">
          <button 
            className={`tab-btn cursor-pointer ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
            data-testid="tab-trends"
          >
            <TrendingUp size={16} /> Performance Trends
          </button>
          <button 
            className={`tab-btn cursor-pointer ${activeTab === 'coaching' ? 'active' : ''}`}
            onClick={() => setActiveTab('coaching')}
            data-testid="tab-coaching"
          >
            <ClipboardList size={16} /> Coaching History ({associateLogs?.length || 0})
          </button>
          <button 
            className={`tab-btn cursor-pointer ${activeTab === 'commitments' ? 'active' : ''}`}
            onClick={() => setActiveTab('commitments')}
            data-testid="tab-commitments"
          >
            <Calendar size={16} /> Active Commitments ({associateTasks?.filter(t => !t.completed)?.length || 0})
          </button>
          <button 
            className={`tab-btn cursor-pointer ${activeTab === 'oneOnOne' ? 'active' : ''}`}
            onClick={() => setActiveTab('oneOnOne')}
            data-testid="tab-oneOnOne"
          >
            <FileText size={16} /> 1-on-1 Appraisals
          </button>
          <button 
            className={`tab-btn cursor-pointer ${activeTab === 'trophies' ? 'active' : ''}`}
            onClick={() => setActiveTab('trophies')}
            data-testid="tab-trophies"
          >
            <Award size={16} /> Trophies & PIPs
          </button>
        </div>

        {/* Modal Body content scroll area */}
        <div className="p-xl max-h-65vh overflow-y-auto">
          
          {/* TAB 1: Performance Trends */}
              {activeTab === 'trends' && (
                <ProfileTrendsTab 
                  employee={employee}
                  activeHistoryPoints={activeHistoryPoints}
                  activeGoals={activeGoals}
                />
              )}{/* TAB 2: Coaching logs history list */}
              {activeTab === 'coaching' && (
                <ProfileCoachingTab 
                  associateLogs={associateLogs}
                />
              )}{/* TAB 3: Commitments Follow-up Tasks */}
          {activeTab === 'commitments' && (
            <ProfileCommitmentsTab 
              associateTasks={associateTasks}
            />
          )}

          {/* TAB 4: 1-on-1 Appraisals */}
          {activeTab === 'oneOnOne' && (
            <ProfileAppraisalsTab 
              employee={employee}
              associateLogs={associateLogs}
            />
          )}
          {/* TAB 5: Trophies & PIPs */}
          {activeTab === 'trophies' && (
            <ProfileTrophiesTab 
              employee={employee} 
              associateLogs={associateLogs}
            />
          )}
        </div>
      </div>
    </div>
  );
}

