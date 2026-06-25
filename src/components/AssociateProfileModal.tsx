import { useState, useEffect } from 'react';
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
import { renderMarkdown, formatMarkdownNotes } from '../utils/profileUtils';
const EMPTY_OBJ = {};
const EMPTY_ARR: any[] = [];

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
    playingLogId, setPlayingLogId,
    expandedLogId, setExpandedLogId,
    isGeneratingReview, setIsGeneratingReview,
    generatedReview, setGeneratedReview,
    isGeneratingActionPlan, setIsGeneratingActionPlan,
    generatedActionPlan, setGeneratedActionPlan,
    handlePlayTTS,
    handleGenerateReview,
    handleGenerateActionPlan,
    sortedPeriods,
    historyPoints,
    activeHistoryPoints,
    associateLogs,
    associateTasks,
    activeGoals
  } = useAssociateProfile(isOpen, employee, rosterHistory, coachingLogs, followUpTasks, deptGoals);

  if (!isOpen || !employee) return null;

  return (
    <div className="modal-overlay z-1050 cursor-pointer" onClick={onClose}>
      <div 
        className="modal-content cursor-default overflow-hidden p-0" 
        onClick={(e: any) => e.stopPropagation()}
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
            className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
          >
            <TrendingUp size={16} /> Performance Trends
          </button>
          <button 
            className={`tab-btn ${activeTab === 'coaching' ? 'active' : ''}`}
            onClick={() => setActiveTab('coaching')}
          >
            <ClipboardList size={16} /> Coaching History ({associateLogs.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'commitments' ? 'active' : ''}`}
            onClick={() => setActiveTab('commitments')}
          >
            <Calendar size={16} /> Active Commitments ({associateTasks.filter(t => t.status !== 'completed').length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'oneOnOne' ? 'active' : ''}`}
            onClick={() => setActiveTab('oneOnOne')}
          >
            <FileText size={16} /> 1-on-1 Appraisals
          </button>
          <button 
            className={`tab-btn ${activeTab === 'trophies' ? 'active' : ''}`}
            onClick={() => setActiveTab('trophies')}
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
              rosterHistory={rosterHistory}
              activePeriod={activePeriod}
              activeHistoryPoints={activeHistoryPoints}
              associateLogs={associateLogs}
              associateTasks={associateTasks}
              activeGoals={activeGoals}
              calculateCVI={calculateCVI}
              renderMarkdown={renderMarkdown}
              playingLogId={playingLogId}
              setPlayingLogId={setPlayingLogId}
 />
          )}

          {/* TAB 2: Coaching logs history list */}
              {activeTab === 'coaching' && (
                <ProfileCoachingTab 
                  associateLogs={associateLogs}
                  expandedLogId={expandedLogId}
                  setExpandedLogId={setExpandedLogId}
                  handlePlayTTS={handlePlayTTS}
                  formatMarkdownNotes={formatMarkdownNotes}
                  playingLogId={playingLogId}
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
              renderMarkdown={renderMarkdown}
              isGeneratingReview={isGeneratingReview}
              generatedReview={generatedReview}
              handleGenerateReview={handleGenerateReview}
 />
          )}
          {/* TAB 5: Trophies & PIPs */}
          {activeTab === 'trophies' && (
            <ProfileTrophiesTab 
              employee={employee} 
              isGenerating={isGeneratingActionPlan}
              generatedPlan={generatedActionPlan}
              onGenerate={handleGenerateActionPlan}
            />
          )}
        </div>
      </div>
    </div>
  );
}

