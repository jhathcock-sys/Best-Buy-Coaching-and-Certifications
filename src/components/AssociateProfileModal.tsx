// @ts-nocheck
import { useState, useEffect } from 'react';
import { X, TrendingUp, ClipboardList, Calendar, Volume2, Square, Clock, AlertCircle, CheckCircle, FileText, Loader2, Award } from 'lucide-react';
import MetricSparkline from './MetricSparkline';
import ProfileTrendsTab from './AssociateProfile/ProfileTrendsTab';
import ProfileCoachingTab from './AssociateProfile/ProfileCoachingTab';
import ProfileCommitmentsTab from './AssociateProfile/ProfileCommitmentsTab';
import ProfileAppraisalsTab from './AssociateProfile/ProfileAppraisalsTab';
import ProfileTrophiesTab from './AssociateProfile/ProfileTrophiesTab';
import { calculateCVI } from '../store/cviHelper';

import { useStore } from '../store/useStore';

export interface AssociateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
}


import { useAssociateProfile } from '../hooks/useAssociateProfile';
import { renderMarkdown, formatMarkdownNotes } from '../utils/profileUtils';
export default function AssociateProfileModal({
  isOpen,
  onClose,
  employee
}: AssociateProfileModalProps) {
  const rosterHistory = useStore(state => state.rosterHistory) || {};
  const coachingLogs = useStore(state => state.coachingLogs) || [];
  const followUpTasks = useStore(state => state.followUpTasks) || [];
  const deptGoals = useStore(state => state.deptGoals) || {};
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
        <div style={{ 
          padding: '1.25rem 1.5rem', 
          borderBottom: '1px solid var(--border-glass)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'linear-gradient(90deg, rgba(0, 70, 190, 0.15), transparent)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.35rem', color: '#fff', fontFamily: 'var(--font-heading)', margin: 0 }}>
                {employee.name}
              </h3>
              <span className="tag-pill tag-pill-active" style={{ fontSize: '0.75rem', background: 'var(--bby-blue)' }}>
                {employee.dept}
              </span>
              {employee.focus5 && (
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: '#fff', 
                  background: 'var(--error)', 
                  fontWeight: 800, 
                  padding: '0.15rem 0.4rem', 
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}>
                  🔥 FOCUS 5
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                Associate Profile & Coaching Dashboard
              </p>
              {employee.employeeNumber && (
                <>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>•</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                    ID: {employee.employeeNumber}
                  </span>
                </>
              )}
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>•</span>
              {(() => {
                const cvi = calculateCVI(employee, rosterHistory, activePeriod);
                let badgeBg = 'rgba(255, 255, 255, 0.05)';
                let badgeColor = 'var(--text-secondary)';
                let badgeBorder = 'rgba(255, 255, 255, 0.1)';
                let cviIcon = '▶';
                if (cvi.includes('Accelerating')) {
                  badgeBg = 'rgba(16, 185, 129, 0.15)';
                  badgeColor = 'var(--success)';
                  badgeBorder = 'rgba(16, 185, 129, 0.3)';
                  cviIcon = '▲';
                } else if (cvi.includes('Needs Review')) {
                  badgeBg = 'rgba(239, 68, 68, 0.15)';
                  badgeColor = 'var(--error)';
                  badgeBorder = 'rgba(239, 68, 68, 0.3)';
                  cviIcon = '▼';
                } else if (cvi.includes('Neutral')) {
                  badgeBg = 'rgba(245, 158, 11, 0.15)';
                  badgeColor = 'var(--warning)';
                  badgeBorder = 'rgba(245, 158, 11, 0.3)';
                  cviIcon = '▶';
                }
                return (
                  <span 
                    title="Coaching Velocity Index (Month over Month growth velocity)"
                    style={{ 
                      fontSize: '0.7rem', 
                      background: badgeBg, 
                      border: `1px solid ${badgeBorder}`, 
                      color: badgeColor, 
                      padding: '0.15rem 0.45rem', 
                      borderRadius: '6px', 
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem'
                    }}
                  >
                    {cviIcon} CVI: {cvi}
                  </span>
                );
              })()}
            </div>
          </div>
          <button 
            type="button"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }} 
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>

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
              associateShifts={associateShifts}
              associateSimulations={associateSimulations}
              getRankAndPercentile={getRankAndPercentile}
              calculateCVI={calculateCVI}
              renderMarkdown={renderMarkdown}
              playingLogId={playingLogId}
              setPlayingLogId={setPlayingLogId}
              handlePlayAudio={handlePlayAudio}
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
              associateShifts={associateShifts}
              associateSimulations={associateSimulations}
              getRankAndPercentile={getRankAndPercentile}
              calculateCVI={calculateCVI}
              renderMarkdown={renderMarkdown}
              playingLogId={playingLogId}
              setPlayingLogId={setPlayingLogId}
              handlePlayAudio={handlePlayAudio}
 />
          )}

          {/* TAB 3: Commitments Follow-up Tasks */}
          {activeTab === 'commitments' && (
            <ProfileCommitmentsTab 
              employee={employee}
              rosterHistory={rosterHistory}
              activePeriod={activePeriod}
              activeHistoryPoints={activeHistoryPoints}
              associateLogs={associateLogs}
              associateTasks={associateTasks}
              associateShifts={associateShifts}
              associateSimulations={associateSimulations}
              getRankAndPercentile={getRankAndPercentile}
              calculateCVI={calculateCVI}
              renderMarkdown={renderMarkdown}
              playingLogId={playingLogId}
              setPlayingLogId={setPlayingLogId}
              handlePlayAudio={handlePlayAudio}
 />
          )}

          {/* TAB 4: 1-on-1 Appraisals */}
          {activeTab === 'oneOnOne' && (
            <ProfileAppraisalsTab 
              employee={employee}
              rosterHistory={rosterHistory}
              activePeriod={activePeriod}
              activeHistoryPoints={activeHistoryPoints}
              associateLogs={associateLogs}
              associateTasks={associateTasks}
              associateShifts={associateShifts}
              associateSimulations={associateSimulations}
              getRankAndPercentile={getRankAndPercentile}
              calculateCVI={calculateCVI}
              renderMarkdown={renderMarkdown}
              playingLogId={playingLogId}
              setPlayingLogId={setPlayingLogId}
              handlePlayAudio={handlePlayAudio}
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

