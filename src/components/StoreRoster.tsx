import React from 'react';
import { Users, Search, AlertTriangle, CheckCircle, Clock, HelpCircle, Sliders } from 'lucide-react';
import AddEmployeeModal from './AddEmployeeModal';
import PerformanceWizardModal from './PerformanceWizardModal';
import RosterImporterModal from './RosterImporterModal';
import AssociateProfileModal from './AssociateProfileModal';
import { useStoreRoster } from '../hooks/useStoreRoster';
import StoreRosterHeader from './StoreRoster/StoreRosterHeader';
import StoreRosterTable from './StoreRoster/StoreRosterTable';
import StoreRosterMobileCard from './StoreRoster/StoreRosterMobileCard';
import RosterAuditor from './RosterAuditor';
import RentsDueAuditor from './RentsDueAuditor';

import { useApp } from '../context/AppContext';
import { useStore } from '../store/useStore';
import { DeptGoal } from '../types';

export default function StoreRoster({ 
  onCoachEmployee, 
  onCreateLog
}: any) {
  const apiKey = useStore((state) => state.apiKey);

  const rosterHistory = useStore((state) => state.rosterHistory) || {};
  const activePeriod = useStore((state) => state.activePeriod);
  const coachingLogs = useStore((state) => state.coachingLogs) || [];
  const followUpTasks = useStore((state) => state.followUpTasks) || [];
  
  const defaultDeptGoals: Record<string, DeptGoal> = {
    'Front End': { memberships: 8.0, membershipsType: 'Hours', creditCards: 12.5, creditCardsType: 'Hours', warranty: 11.0, surveys: 1.0, rph: 640 },
    'General Sales': { memberships: 5000, membershipsType: 'Dollars', creditCards: 8000, creditCardsType: 'Dollars', warranty: 11.0, surveys: 1.0, rph: 640 },
    'Appliances': { memberships: 15000, membershipsType: 'Dollars', creditCards: 10000, creditCardsType: 'Dollars', warranty: 12.0, surveys: 1.0, rph: 1200 },
    'Computing': { memberships: 8000, membershipsType: 'Dollars', creditCards: 10000, creditCardsType: 'Dollars', warranty: 11.0, surveys: 1.0, rph: 900, basket: 150, m365: 60.0 },
    'Mobile': { memberships: 6000, membershipsType: 'Dollars', creditCards: 8000, creditCardsType: 'Dollars', warranty: 8.0, surveys: 1.0, rph: 700 },
    'Home Theatre': { memberships: 10000, membershipsType: 'Dollars', creditCards: 12000, creditCardsType: 'Dollars', warranty: 11.0, surveys: 1.0, rph: 800, basket: 250, audio: 35.0 },
    'Geek Squad': { memberships: 5000, membershipsType: 'Dollars', creditCards: 15000, creditCardsType: 'Dollars', warranty: 12.0, surveys: 1.0, rph: 500 }
  };
  
  const storeDeptGoals = useStore((state) => state.deptGoals);
  const deptGoals = (storeDeptGoals && Object.keys(storeDeptGoals).length > 0) ? storeDeptGoals : defaultDeptGoals;
  
  const roster = rosterHistory[activePeriod] || [];

  const updateEmployeeDept = useStore((state) => state.updateEmployeeDept);
  const addEmployee = useStore((state) => state.addEmployee);
  const editEmployee = useStore((state) => state.editEmployee);
  const deleteEmployee = useStore((state) => state.deleteEmployee);
  const changePeriod = useStore((state) => state.changePeriod);
  const createPeriodArchive = useStore((state) => state.createPeriodArchive);
  const bulkImportEmployees = useStore((state) => state.bulkImportEmployees);
  
  // Create aliases for the functions that were previously props
  const onUpdateEmployeeDept = updateEmployeeDept;
  const onAddEmployee = addEmployee;
  const onEditEmployee = editEmployee;
  const onDeleteEmployee = deleteEmployee;
  const onChangePeriod = changePeriod;
  const onCreatePeriod = createPeriodArchive;
  const onBulkImportEmployees = bulkImportEmployees;
  const {
    selectedProfileEmployee, setSelectedProfileEmployee,
    searchTerm, setSearchTerm,
    tempSearch, setTempSearch,
    activeDept, setActiveDept,
    showAddForm, setShowAddForm,
    showNewPeriodForm, setShowNewPeriodForm,
    newPeriodName, setNewPeriodName,
    copyOption, setCopyOption,
    editingEmployee, setEditingEmployee,
    showImporter, setShowImporter,
    activeSubView, setActiveSubView,
    showViewSettings, setShowViewSettings,
    isDense, setIsDense,
    visibleCols, setVisibleCols,
    handleStartEdit,
    DEPARTMENTS,
    filteredRoster
  } = useStoreRoster(roster);

  const handleSaveEdit = (updatedMetrics) => {
    if (onEditEmployee && editingEmployee) {
      onEditEmployee(editingEmployee.id, updatedMetrics);
    }
    setEditingEmployee(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', width: '100%' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Store Performance Roster
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Review performance logs and hours for the selected period. Audited dynamically against department-specific goals.
          </p>
        </div>

        {/* Period Selector */}
        {rosterHistory && Object.keys(rosterHistory).length > 0 && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            background: 'rgba(16, 24, 48, 0.4)', 
            border: '1px solid var(--border-glass)', 
            padding: '0.5rem 1.25rem', 
            borderRadius: '16px',
            boxShadow: 'var(--shadow-inset)'
          }}>
            <Clock size={16} color="var(--bby-yellow)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Period:</span>
            <select 
              value={activePeriod} 
              onChange={(e) => onChangePeriod && onChangePeriod(e.target.value)}
              className="form-control"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                outline: 'none',
                padding: '0 1.5rem 0 0',
                width: 'auto',
                height: 'auto',
                margin: 0,
                boxShadow: 'none'
              }}
            >
              {Object.keys(rosterHistory || {}).map(p => (
                <option key={p} value={p} style={{ background: '#0b0f19', color: '#fff' }}>{p}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Subview Tabs bar */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.25rem' }}>
        <button
          className="btn"
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubView === 'list' ? '2.5px solid var(--bby-blue)' : 'none',
            color: activeSubView === 'list' ? '#fff' : 'var(--text-muted)',
            borderRadius: 0,
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
          onClick={() => setActiveSubView('list')}
        >
          Performance Ledger
        </button>
        <button
          className="btn"
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubView === 'audit' ? '2.5px solid var(--bby-blue)' : 'none',
            color: activeSubView === 'audit' ? '#fff' : 'var(--text-muted)',
            borderRadius: 0,
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
          onClick={() => setActiveSubView('audit')}
        >
          AI Metrics Auditor
        </button>
        <button
          className="btn"
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubView === 'rentsDue' ? '2.5px solid var(--bby-blue)' : 'none',
            color: activeSubView === 'rentsDue' ? '#fff' : 'var(--text-muted)',
            borderRadius: 0,
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
          onClick={() => setActiveSubView('rentsDue')}
        >
          Rents Due Auditor
        </button>
      </div>

      {activeSubView === 'list' && (
        <>
          <StoreRosterHeader 
            DEPARTMENTS={DEPARTMENTS}
            activeDept={activeDept}
            setActiveDept={setActiveDept}
            tempSearch={tempSearch}
            setTempSearch={setTempSearch}
            showNewPeriodForm={showNewPeriodForm}
            setShowNewPeriodForm={setShowNewPeriodForm}
            showAddForm={showAddForm}
            setShowAddForm={setShowAddForm}
            showImporter={showImporter}
            setShowImporter={setShowImporter}
            showViewSettings={showViewSettings}
            setShowViewSettings={setShowViewSettings}
          />

          {/* View Settings Drawer */}
          {showViewSettings && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem 2rem', border: '1px solid rgba(255, 255, 255, 0.08)', animation: 'fadeIn 0.25s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                  <Sliders size={16} color="var(--bby-blue)" /> Roster Display Settings
                </h4>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <input 
                    type="checkbox" 
                    checked={isDense} 
                    onChange={(e) => setIsDense(e.target.checked)} 
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Enable Dense Grid Layout</span>
                </label>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.25rem', padding: '0.75rem', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                {Object.keys(visibleCols).map(col => {
                  const label = 
                    col === 'hours' ? 'Hours' :
                    col === 'dept' ? 'Department' :
                    col === 'memberships' ? 'Memberships' :
                    col === 'creditCards' ? 'BBY Cards' :
                    col === 'warranty' ? 'GSP/Warranty' :
                    col === 'surveys' ? '5 Star Surveys' :
                    col === 'rph' ? 'RPH Index' :
                    col === 'basket' ? 'Basket' :
                    col === 'attach' ? 'Dept Attach' :
                    col === 'status' ? 'Status' : col;

                  return (
                    <label key={col} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem', color: '#fff' }}>
                      <input 
                        type="checkbox" 
                        checked={visibleCols[col]} 
                        onChange={(e) => setVisibleCols({ ...visibleCols, [col]: e.target.checked })} 
                        style={{ cursor: 'pointer' }}
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Collapsible Start New Period Card */}
          {showNewPeriodForm && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1.5px solid var(--bby-yellow)', padding: '1.5rem 2rem', animation: 'fadeIn 0.3s ease' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em' }}>
                Start New Performance Period / Month Archive
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-0.5rem' }}>
                Create a fresh performance tracker for a new month or week. The existing month's data will be safely archived and accessible anytime using the period switcher.
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1, minWidth: '250px' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>New Period Name:</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. June 2026, Week 23"
                    style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                    value={newPeriodName}
                    onChange={(e) => setNewPeriodName(e.target.value)}
                  />
                </div>
                
                <div className="form-group" style={{ flex: 1, minWidth: '250px' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Data Cloning Option:</label>
                  <select 
                    className="form-control"
                    style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                    value={copyOption}
                    onChange={(e) => setCopyOption(e.target.value)}
                  >
                    <option value="roster-only">Carry over associates only (Metrics set to 0 - Recommended for new months)</option>
                    <option value="roster-and-metrics">Carry over associates AND all current performance metrics</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button className="btn btn-secondary" style={{ padding: '0.55rem 1.25rem' }} onClick={() => setShowNewPeriodForm(false)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '0.55rem 1.25rem', background: 'var(--bby-yellow)', color: '#000' }} 
                  onClick={() => {
                    if (!newPeriodName.trim()) {
                      alert("Please enter a valid period name!");
                      return;
                    }
                    if (rosterHistory && rosterHistory[newPeriodName.trim()]) {
                      if (!confirm(`A period named "${newPeriodName.trim()}" already exists. Do you want to overwrite it?`)) {
                        return;
                      }
                    }
                    if (onCreatePeriod) {
                      onCreatePeriod(newPeriodName.trim(), copyOption);
                    }
                    setNewPeriodName('');
                    setShowNewPeriodForm(false);
                  }}
                >
                  Start New Period & Switch
                </button>
              </div>
            </div>
          )}

          {/* Add Associate Modal */}
          <AddEmployeeModal
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
            onAddEmployee={onAddEmployee}
          />

          {/* Roster Table Card */}
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <StoreRosterTable 
              filteredRoster={filteredRoster}
              visibleCols={visibleCols}
              isDense={isDense}
              deptGoals={deptGoals}
              rosterHistory={rosterHistory}
              activePeriod={activePeriod}
              setSelectedProfileEmployee={setSelectedProfileEmployee}
              handleStartEdit={handleStartEdit}
            />

            <StoreRosterMobileCard 
              filteredRoster={filteredRoster}
              deptGoals={deptGoals}
              rosterHistory={rosterHistory}
              activePeriod={activePeriod}
              DEPARTMENTS={DEPARTMENTS}
              onUpdateEmployeeDept={onUpdateEmployeeDept}
              handleStartEdit={handleStartEdit}
              onCoachEmployee={onCoachEmployee}
              onCreateLog={onCreateLog}
              onDeleteEmployee={onDeleteEmployee}
            />
          </div>

          {/* Department Targets Legend */}
          <div className="glass-card" style={{ padding: '1.25rem', marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              <AlertTriangle size={16} color="var(--bby-blue)" /> Department Standards
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {Object.entries(deptGoals).map(([dept, targets]) => (
                <div 
                  key={dept} 
                  style={{ 
                    padding: '1rem', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid var(--border-glass)', 
                    borderRadius: '12px',
                    fontSize: '0.775rem'
                  }}
                >
                  <h4 style={{ fontWeight: 700, color: '#fff', marginBottom: '0.5rem', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                    {dept}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'var(--text-secondary)' }}>
                    <div>
                      <strong>Memberships:</strong> {targets.membershipsType === 'Hours' ? `1 in ${targets.memberships} hrs` : targets.membershipsType === 'Dollars' ? `1 in $${(targets.memberships / 1000).toFixed(0)}k sales` : `${targets.memberships} goal`}
                    </div>
                    <div>
                      <strong>BBY Cards:</strong> {targets.creditCardsType === 'Hours' ? `1 in ${targets.creditCards} hrs` : targets.creditCardsType === 'Dollars' ? `1 in $${(targets.creditCards / 1000).toFixed(0)}k sales` : `${targets.creditCards} goal`}
                    </div>
                    <div><strong>GSP Attach:</strong> {targets.warranty}% attach</div>
                    <div><strong>5 Star Surveys:</strong> {targets.surveys} mentions</div>
                    <div><strong>RPH index:</strong> ${targets.rph}/hr target</div>
                    {targets.basket !== undefined && <div><strong>Basket target:</strong> ${targets.basket}</div>}
                    {targets.m365 !== undefined && <div><strong>M365 Attach:</strong> {targets.m365}%</div>}
                    {targets.audio !== undefined && <div><strong>Audio Attach:</strong> {targets.audio}%</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeSubView === 'audit' && (
        <RosterAuditor roster={roster} />
      )}

      {activeSubView === 'rentsDue' && (
        <RentsDueAuditor 
          roster={roster} 
          activePeriod={activePeriod}
          rosterHistory={rosterHistory}
          onBulkImportEmployees={onBulkImportEmployees}
          apiKey={apiKey}
        />
      )}

      {/* Performance Wizard Modal */}
      <PerformanceWizardModal
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        employee={editingEmployee}
        onSave={handleSaveEdit}
        activePeriod={activePeriod}
        deptGoals={deptGoals}
      />

      {/* Roster CSV Importer Modal */}
      <RosterImporterModal
        isOpen={showImporter}
        onClose={() => setShowImporter(false)}
        onImport={(importedList) => {
          if (onBulkImportEmployees) {
            onBulkImportEmployees(importedList);
          }
          setShowImporter(false);
        }}
      />

      {/* Associate Profile Modal */}
      <AssociateProfileModal
        isOpen={!!selectedProfileEmployee}
        onClose={() => setSelectedProfileEmployee(null)}
        employee={selectedProfileEmployee}
      />

    </div>
  );
}
