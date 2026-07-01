import React, { useState, useRef, useEffect } from 'react';
import { FileText } from 'lucide-react';
import RentsDueUploader from './RentsDueAuditor/RentsDueUploader';
import RentsDueLedger, { ParsedEmployee } from './RentsDueAuditor/RentsDueLedger';
import RentsDuePeriodSelector from './RentsDueAuditor/RentsDuePeriodSelector';
import RentsDueArchiveList from './RentsDueAuditor/RentsDueArchiveList';
import { useStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { useRentsDueParser } from '../hooks/useRentsDueParser';
import { Employee, type RentsDueArchive } from '../types';
import { subscribeToRentsDueArchives } from '../services/firebase';

const EMPTY_OBJ: Record<string, any> = {};

export default function RentsDueAuditor() {
  const apiKey = useStore((state) => state.apiKey);
  const activePeriod = useStore((state) => state.activePeriod);
  const storeId = useStore((state) => state.storeId);
  
  // Fix: Zustand over-fetching bug resolved using atomic selectors and useShallow
  const activeRoster = useStore(state => state.rosterHistory?.[activePeriod] ?? EMPTY_OBJ);
  const rosterHistoryKeys = useStore(useShallow(state => Object.keys(state.rosterHistory || {})));
  
  const bulkImportEmployees = useStore((state) => state.bulkImportEmployees);
  const addDailySnapshot = useStore((state) => state.addDailySnapshot);

  const [activeTab, setActiveTab] = useState<'audit' | 'archives'>('audit');
  const [archives, setArchives] = useState<RentsDueArchive[]>([]);
  
  // Fix: Stale state hydration trap resolved using useEffect one-way sync
  const [selectedPeriod, setSelectedPeriod] = useState(activePeriod);
  useEffect(() => {
    if (activePeriod) {
      setSelectedPeriod(activePeriod);
    }
  }, [activePeriod]);
  
  const selectedRoster = useStore(state => state.rosterHistory?.[selectedPeriod] ?? EMPTY_OBJ);

  const roster = React.useMemo<Employee[]>(() => Object.values((activeRoster || {}) as Record<string, Employee>).sort((a: Employee, b: Employee) => a.name.localeCompare(b.name)), [activeRoster]);
  
  const comparisonRoster = React.useMemo<Employee[]>(() => {
    if (selectedPeriod === activePeriod) return roster;
    return Object.values(selectedRoster as Record<string, Employee>).sort((a: Employee, b: Employee) => a.name.localeCompare(b.name));
  }, [selectedPeriod, activePeriod, roster, selectedRoster]);

  const todayStr = new Date().toISOString().split('T')[0];
  const [snapshotDate, setSnapshotDate] = useState(todayStr);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const unsubscribeArchivesRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (storeId) {
      unsubscribeArchivesRef.current = subscribeToRentsDueArchives(storeId, (data) => {
        setArchives(data);
      }) as unknown as (() => void);
    }
    return () => {
      if (unsubscribeArchivesRef.current) unsubscribeArchivesRef.current();
    };
  }, [storeId]);

  const parser = useRentsDueParser({
    storeId,
    apiKey,
    selectedPeriod,
    comparisonRoster,
    bulkImportEmployees,
    addDailySnapshot,
    snapshotDate
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parser.handleProcessFile(file, () => {
        if (fileInputRef.current) fileInputRef.current.value = '';
      });
    }
  };

  return (
    <div className="flex-column gap-xl mt-md" data-testid="rents-due-auditor">
      
      {/* Description Panel */}
      <div className="glass-card p-xl">
        <h2 className="text-xl flex-row align-center gap-sm m-0 font-heading text-bby-yellow">
          <FileText size={20} /> Rents Due Document Auditor
        </h2>
        <p className="text-sm text-secondary mt-sm leading-relaxed">
          "Paying Rent" represents meeting baseline sales metrics. Upload your weirdly laid out **Rents Due** spreadsheet report (as a CSV file, copied spreadsheet text lines, or an image/screenshot of the table). The AI parses salesperson RPH, total revenue, apps, memberships, and protection warranty attachments, showing who has paid rent and mapping the gaps.
        </p>
      </div>

      <RentsDuePeriodSelector 
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        activePeriod={activePeriod}
        rosterHistoryKeys={rosterHistoryKeys}
        comparisonRosterLength={comparisonRoster.length}
        snapshotDate={snapshotDate}
        setSnapshotDate={setSnapshotDate}
      />

      {/* Tabs */}
      <div className="flex-row gap-sm border-b border-[var(--border-glass)] pb-sm">
        <button 
          className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'} cursor-pointer px-lg py-sm`}
          onClick={() => setActiveTab('audit')}
          data-testid="tab-audit"
        >
          Upload & Audit
        </button>
        <button 
          className={`btn ${activeTab === 'archives' ? 'btn-primary' : 'btn-secondary'} cursor-pointer px-lg py-sm`}
          onClick={() => setActiveTab('archives')}
          data-testid="tab-archives"
        >
          Archives ({archives?.length || 0})
        </button>
      </div>


      {activeTab === 'archives' ? (
        <RentsDueArchiveList archives={archives} />
      ) : (
        !parser.parsedEmployees ? (
          <RentsDueUploader 
            fileName={parser.fileName}
            errorMsg={parser.errorMsg}
            isParsing={parser.isParsing}
            textInput={parser.textInput}
            setTextInput={parser.setTextInput}
            handleFileChange={handleFileChange}
            fileInputRef={fileInputRef}
            handleManualTextParse={parser.handleManualTextParse}
            handleProcessFile={(file) => parser.handleProcessFile(file, () => {
              if (fileInputRef.current) fileInputRef.current.value = '';
            })}
            loadDemoData={parser.loadDemoData}
            mappingState={parser.mappingState}
            onCancelMapping={() => parser.setMappingState(prev => ({ ...prev, isMapping: false }))}
            onConfirmMapping={parser.handleConfirmMapping}
          />
        ) : (
          <RentsDueLedger 
            gaps={parser.gaps}
            parsedEmployees={parser.parsedEmployees}
            setParsedEmployees={parser.setParsedEmployees}
            syncSuccess={parser.syncSuccess}
            handleSyncToRoster={parser.handleSyncToRoster}
          />
        )
      )}

    </div>
  );
}
