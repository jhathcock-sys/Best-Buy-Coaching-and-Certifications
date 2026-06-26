import React, { useState } from 'react';
import { Users, Search, AlertTriangle, CheckCircle, Clock, HelpCircle, Sliders } from 'lucide-react';
import AddEmployeeModal from '../components/AddEmployeeModal';
import PerformanceWizardModal from '../components/PerformanceWizardModal';
import RosterImporterModal from '../components/RosterImporterModal';
import AssociateProfileModal from '../components/AssociateProfileModal';
import { useStoreRoster } from '../hooks/useStoreRoster';
import StoreRosterHeader from '../components/StoreRoster/StoreRosterHeader';
import StoreRosterTable from '../components/StoreRoster/StoreRosterTable';
import StoreRosterMobileCard from '../components/StoreRoster/StoreRosterMobileCard';
import StartNewPeriodForm from '../components/StoreRoster/StartNewPeriodForm';
import RosterDisplaySettings from '../components/StoreRoster/RosterDisplaySettings';
import RosterAuditor from '../components/RosterAuditor';
import RentsDueAuditor from '../components/RentsDueAuditor';
import { useMediaQuery } from '../hooks/useMediaQuery';

import { useStore } from '../store/useStore';
import { DeptGoal } from '../types';

const EMPTY_OBJ = {};
const EMPTY_ARR = [];

export default function StoreRoster({ 
  onCoachEmployee, 
  onCreateLog
}: any) {
  const apiKey = useStore((state) => state.apiKey);

  const rosterHistory = useStore((state) => state.rosterHistory) || EMPTY_OBJ;
  const activePeriod = useStore((state) => state.activePeriod);
  const coachingLogs = useStore((state) => state.coachingLogs) || EMPTY_ARR;
  const followUpTasks = useStore((state) => state.followUpTasks) || EMPTY_ARR;
  
  const [showGoals, setShowGoals] = useState(false);
  const [editingDept, setEditingDept] = useState<string | null>(null);
  const deptGoals = useStore((state) => state.deptGoals);
  
  const _rawroster = rosterHistory[activePeriod] || EMPTY_OBJ;
  const roster = React.useMemo(() => Object.values(_rawroster).sort((a: any, b: any) => a.name.localeCompare(b.name)), [_rawroster]);

  const addEmployee = useStore((state) => state.addEmployee);
  const editEmployee = useStore((state) => state.editEmployee);
  const deleteEmployee = useStore((state) => state.deleteEmployee);
  const changePeriod = useStore((state) => state.changePeriod);
  const createPeriodArchive = useStore((state) => state.createPeriodArchive);
  const bulkImportEmployees = useStore((state) => state.bulkImportEmployees);
  
  // Create aliases for the functions that were previously props

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

  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <div className="flex-column gap-xl">
      
      {/* Header */}
      <div className="flex-between flex-wrap gap-lg w-full">
        <div>
          <h1 className="flex-row align-center justify-start text-3xl mb-xs gap-sm m-0">
            Store Performance Roster
          </h1>
          <p className="text-secondary">
            Review performance logs and hours for the selected period. Audited dynamically against department-specific goals.
          </p>
        </div>

        {/* Period Selector */}
        {rosterHistory && Object.keys(rosterHistory).length > 0 && (
          <div className="flex-center gap-sm period-selector-card">
            <Clock size={16} color="var(--bby-yellow)" />
            <span className="text-sm text-secondary font-semibold">Active Period:</span>
            <select 
              value={activePeriod} 
              onChange={(e) => onChangePeriod && onChangePeriod(e.target.value)}
              className="select-minimal"
            >
              {Object.keys(rosterHistory || {}).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Subview Tabs bar */}
      <div className="flex-row gap-sm border-bottom pb-xs">
        <button
          className={`subview-tab-btn ${activeSubView === 'list' ? 'active' : ''}`}
          onClick={() => setActiveSubView('list')}
        >
          Performance Ledger
        </button>
        <button
          className={`subview-tab-btn ${activeSubView === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveSubView('audit')}
        >
          AI Metrics Auditor
        </button>
        <button
          className={`subview-tab-btn ${activeSubView === 'rentsDue' ? 'active' : ''}`}
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
            toggles={{
              showNewPeriodForm,
              showAddForm,
              showViewSettings
            }}
            actions={{
              onToggleNewPeriod: () => {
                setShowNewPeriodForm(!showNewPeriodForm);
                setShowAddForm(false);
              },
              onToggleAdd: () => {
                setShowAddForm(!showAddForm);
                setShowNewPeriodForm(false);
              },
              onToggleImport: () => {
                setShowImporter(true);
                setShowAddForm(false);
                setShowNewPeriodForm(false);
                setShowViewSettings(false);
              },
              onToggleSettings: () => {
                setShowViewSettings(!showViewSettings);
                setShowAddForm(false);
                setShowNewPeriodForm(false);
              }
            }}
          />

          <RosterDisplaySettings 
            showViewSettings={showViewSettings}
            isDense={isDense}
            setIsDense={setIsDense}
            visibleCols={visibleCols}
            setVisibleCols={setVisibleCols}
          />

          {showNewPeriodForm && (
            <StartNewPeriodForm 
              onClose={() => setShowNewPeriodForm(false)}
              onCreatePeriod={onCreatePeriod}
            />
          )}

          {/* Add Associate Modal */}
          <AddEmployeeModal
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
            onAddEmployee={onAddEmployee}
          />

          {/* Roster Table Card */}
          <div className="glass-card p-0 overflow-hidden">
            {isDesktop ? (
                <StoreRosterTable
                  filteredRoster={filteredRoster}
                  visibleCols={visibleCols}
                  isDense={isDense}
                  setSelectedProfileEmployee={setSelectedProfileEmployee}
                  handleStartEdit={handleStartEdit}
                />
            ) : (
                <StoreRosterMobileCard 
                  filteredRoster={filteredRoster}
                  DEPARTMENTS={DEPARTMENTS}
                  handleStartEdit={handleStartEdit}
                  onCoachEmployee={onCoachEmployee}
                  onCreateLog={onCreateLog}
                />
            )}
          </div>

          {/* Department Targets Legend */}
          <div className="glass-card p-lg mt-md">
            <h3 className="text-base text-white mb-md flex-row align-center gap-sm font-bold">
              <AlertTriangle size={16} color="var(--bby-blue)" /> Department Standards
            </h3>
            <div className="target-grid">
              {Object.entries(deptGoals as Record<string, DeptGoal>).map(([dept, targets]) => (
                <div 
                  key={dept} 
                  className="target-card"
                >
                  <h4 className="font-bold text-white mb-sm text-sm border-bottom pb-xs">
                    {dept}
                  </h4>
                  <div className="flex-column gap-xs text-secondary">
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
        <RosterAuditor />
      )}

      {activeSubView === 'rentsDue' && (
        <RentsDueAuditor />
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
