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

export interface AssociateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
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
    <div className="modal-overlay" style={{ zIndex: 1050 }} onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e: any) => e.stopPropagation()} 
        style={{ 
          border: '2px solid var(--bby-blue)', 
          maxWidth: '750px', 
          width: '95%',
          background: '#0c0f18',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <AssociateProfileHeader 
          employee={employee}
          rosterHistory={rosterHistory}
          activePeriod={activePeriod}
          onClose={onClose}
        />

        {/* Tab Selection Row */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(255, 255, 255, 0.02)', 
          borderBottom: '1px solid var(--border-glass)' 
        }}>
          <button 
            className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
            style={{ 
              flex: 1, 
              padding: '0.85rem', 
              background: 'transparent', 
              border: 'none', 
              color: activeTab === 'trends' ? 'var(--bby-blue)' : 'var(--text-muted)',
              borderBottom: activeTab === 'trends' ? '3px solid var(--bby-blue)' : 'none',
              fontWeight: 700, 
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
            onClick={() => setActiveTab('trends')}
          >
            <TrendingUp size={16} /> Performance Trends
          </button>
          <button 
            className={`tab-btn ${activeTab === 'coaching' ? 'active' : ''}`}
            style={{ 
              flex: 1, 
              padding: '0.85rem', 
              background: 'transparent', 
              border: 'none', 
              color: activeTab === 'coaching' ? 'var(--bby-blue)' : 'var(--text-muted)',
              borderBottom: activeTab === 'coaching' ? '3px solid var(--bby-blue)' : 'none',
              fontWeight: 700, 
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
            onClick={() => setActiveTab('coaching')}
          >
            <ClipboardList size={16} /> Coaching History ({associateLogs.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'commitments' ? 'active' : ''}`}
            style={{ 
              flex: 1, 
              padding: '0.85rem', 
              background: 'transparent', 
              border: 'none', 
              color: activeTab === 'commitments' ? 'var(--bby-blue)' : 'var(--text-muted)',
              borderBottom: activeTab === 'commitments' ? '3px solid var(--bby-blue)' : 'none',
              fontWeight: 700, 
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
            onClick={() => setActiveTab('commitments')}
          >
            <Calendar size={16} /> Active Commitments ({associateTasks.filter(t => t.status !== 'completed').length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'oneOnOne' ? 'active' : ''}`}
            style={{ 
              flex: 1, 
              padding: '0.85rem', 
              background: 'transparent', 
              border: 'none', 
              color: activeTab === 'oneOnOne' ? 'var(--bby-blue)' : 'var(--text-muted)',
              borderBottom: activeTab === 'oneOnOne' ? '3px solid var(--bby-blue)' : 'none',
              fontWeight: 700, 
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
            onClick={() => setActiveTab('oneOnOne')}
          >
            <FileText size={16} /> 1-on-1 Appraisals
          </button>
          <button 
            className={`tab-btn ${activeTab === 'trophies' ? 'active' : ''}`}
            style={{ 
              flex: 1, 
              padding: '0.85rem', 
              background: 'transparent', 
              border: 'none', 
              color: activeTab === 'trophies' ? 'var(--bby-blue)' : 'var(--text-muted)',
              borderBottom: activeTab === 'trophies' ? '3px solid var(--bby-blue)' : 'none',
              fontWeight: 700, 
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
            onClick={() => setActiveTab('trophies')}
          >
            <Award size={16} /> Trophies & PIPs
          </button>
        </div>

        {/* Modal Body content scroll area */}
        <div style={{ padding: '1.5rem', maxHeight: '65vh', overflowY: 'auto' }}>
          
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
              employee={employee}
              rosterHistory={rosterHistory}
              activePeriod={activePeriod}
              activeHistoryPoints={activeHistoryPoints}
              associateLogs={associateLogs}
              associateTasks={associateTasks}
              expandedLogId={expandedLogId}
              setExpandedLogId={setExpandedLogId}
              handlePlayTTS={handlePlayTTS}
              formatMarkdownNotes={formatMarkdownNotes}
              calculateCVI={calculateCVI}
              renderMarkdown={renderMarkdown}
              playingLogId={playingLogId}
              setPlayingLogId={setPlayingLogId}
 />
          )}

          {/* TAB 3: Commitments Follow-up Tasks */}
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

