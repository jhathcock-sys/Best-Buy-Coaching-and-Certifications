import React, { useState, useRef, useEffect } from 'react';
import { FileText } from 'lucide-react';
import RentsDueUploader from './RentsDueAuditor/RentsDueUploader';
import RentsDueLedger, { ParsedEmployee } from './RentsDueAuditor/RentsDueLedger';
import RentsDuePeriodSelector from './RentsDueAuditor/RentsDuePeriodSelector';
import RentsDueArchiveList from './RentsDueAuditor/RentsDueArchiveList';
import { parseRentsDueDocumentGemini } from '../services/ai';
import { useStore } from '../store/useStore';
import { mockRentsDuePayload } from '../data/mockRentsDue';
import { mapParsedRentsToRoster, parseRentsDueCSVCloud } from '../utils/rentsDueUtils';
import { Employee, type RentsDueArchive } from '../types';
import { uploadRentsDueArchive, saveRentsDueArchiveMetadata, subscribeToRentsDueArchives } from '../services/firebase';

const EMPTY_OBJ: Record<string, any> = {};



export default function RentsDueAuditor() {
  const apiKey = useStore((state) => state.apiKey);
  const activePeriod = useStore((state) => state.activePeriod);
  const storeId = useStore((state) => state.storeId);
  const rosterHistory = useStore((state) => state.rosterHistory) || EMPTY_OBJ;
  const bulkImportEmployees = useStore((state) => state.bulkImportEmployees);
  const addDailySnapshot = useStore((state) => state.addDailySnapshot);
  
  const rawRoster = rosterHistory[activePeriod];
  const roster = React.useMemo<Employee[]>(() => rawRoster ? Object.values(rawRoster as Record<string, Employee>).sort((a: Employee, b: Employee) => a.name.localeCompare(b.name)) : [], [rawRoster]);

  const [activeTab, setActiveTab] = useState<'audit' | 'archives'>('audit');
  const [archives, setArchives] = useState<RentsDueArchive[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState(activePeriod);

  const [isParsing, setIsParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState('');
  const [textInput, setTextInput] = useState('');
  const [parsedEmployees, setParsedEmployees] = useState<ParsedEmployee[] | null>(null);
  const [syncSuccess, setSyncSuccess] = useState(false);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [snapshotDate, setSnapshotDate] = useState(todayStr);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const unsubscribeArchivesRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (storeId) {
      unsubscribeArchivesRef.current = subscribeToRentsDueArchives(storeId, (data) => {
        setArchives(data);
      }) as unknown as (() => void);
    }
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
      if (unsubscribeArchivesRef.current) unsubscribeArchivesRef.current();
    };
  }, [storeId]);

  const comparisonRoster = React.useMemo<Employee[]>(() => {
    if (selectedPeriod === activePeriod) return roster;
    const rawRoster = rosterHistory[selectedPeriod] || EMPTY_OBJ;
    return Object.values(rawRoster as Record<string, Employee>).sort((a: Employee, b: Employee) => a.name.localeCompare(b.name));
  }, [selectedPeriod, activePeriod, roster, rosterHistory]);

  // File drop/upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleArchiveUpload = async (fileOrBlob: File | Blob, name: string) => {
    if (!storeId) return;
    const timestamp = Date.now();
    const finalName = `${timestamp}_${name}`;
    const downloadUrl = await uploadRentsDueArchive(storeId, fileOrBlob, finalName);
    if (downloadUrl) {
      await saveRentsDueArchiveMetadata(storeId, {
        fileName: name,
        downloadUrl,
        period: selectedPeriod,
        timestamp
      });
    }
  };

  const handleProcessFile = (file: File) => {
    setFileName(file.name);
    setErrorMsg('');
    setParsedEmployees(null);
    setIsParsing(true);
    handleArchiveUpload(file, file.name);

    const reader = new FileReader();
    if (file.type.startsWith('image/')) {
      reader.onload = async (e) => {
        const base64Url = e.target?.result?.toString() || '';
        const base64Data = base64Url.split(',')[1] || '';
        runOcrParsing(base64Data, file.type, '');
      };
      reader.readAsDataURL(file);
    } else if (file.name.endsWith('.csv') || file.type === 'text/csv' || file.type === 'text/plain') {
      reader.onload = async (e) => {
        const text = e.target?.result?.toString() || '';
        
        try {
          const cloudParsed = await parseRentsDueCSVCloud(text);
          if (cloudParsed && cloudParsed.length > 0) {
            setParsedEmployees(cloudParsed as ParsedEmployee[]);
            setIsParsing(false);
            return;
          }
        } catch (err) {
          console.warn("Cloud parse failed, falling back to Gemini", err);
        }

        runOcrParsing('', '', text);
      };
      reader.readAsText(file);
    } else {
      setErrorMsg('Error: Please upload a valid CSV file, text sheet copy-paste, or image screenshot.');
      setIsParsing(false);
    }
  };

  const runOcrParsing = async (base64Data: string, mimeType: string, textData: string) => {
    setIsParsing(true);
    setErrorMsg('');
    try {
      const parsed = await parseRentsDueDocumentGemini(base64Data, mimeType, textData || textInput, apiKey);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setParsedEmployees(parsed as ParsedEmployee[]);
      } else {
        throw new Error("Parsed output was empty or invalid.");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to parse Rents Due report. Make sure you have a valid Gemini API key or try our interactive demo dataset.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleManualTextParse = async () => {
    if (!textInput.trim()) {
      alert("Please paste the spreadsheet text copy or CSV data first!");
      return;
    }
    const blob = new Blob([textInput], { type: 'text/plain' });
    handleArchiveUpload(blob, 'pasted_rents_due.txt');
    
    try {
      setIsParsing(true);
      const cloudParsed = await parseRentsDueCSVCloud(textInput);
      if (cloudParsed && cloudParsed.length > 0) {
        setParsedEmployees(cloudParsed as ParsedEmployee[]);
        setIsParsing(false);
        return;
      }
    } catch (err) {
      console.warn("Cloud parse failed, falling back to Gemini", err);
    }
    
    runOcrParsing('', '', textInput);
  };

  const loadDemoData = () => {
    setIsParsing(true);
    setErrorMsg('');
    setFileName('rents_due_june_2026_copy.csv');
    
    demoTimeoutRef.current = setTimeout(() => {
      setParsedEmployees(mockRentsDuePayload as ParsedEmployee[]);
      setIsParsing(false);
    }, 1200);
  };

  // Sync parsed metrics back to the store roster (updates active roster metrics or imports new ones)
  const handleSyncToRoster = () => {
    if (!parsedEmployees || parsedEmployees.length === 0) return;
    if (!bulkImportEmployees) {
      alert("Error: Store action to bulk import employees is missing.");
      return;
    }
    
    const { importList } = mapParsedRentsToRoster(parsedEmployees, comparisonRoster);
    
    bulkImportEmployees(importList, selectedPeriod);
    
    const gaps = getGapsSummary();
    if (snapshotDate) {
      addDailySnapshot(snapshotDate, importList);
    }

    setSyncSuccess(true);
    
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      setSyncSuccess(false);
    }, 4000);
  };

  // Calculate gaps
  const getGapsSummary = () => {
    if (!parsedEmployees) return { rev: 0, apps: 0, pms: 0 };
    return parsedEmployees.reduce((acc, curr) => {
      if (curr.revenueStatus === 'off-track') {
        acc.rev += Math.max(0, curr.revenueOwed - curr.revenue);
      }
      if (curr.appsStatus === 'off-track') {
        acc.apps += Math.max(0, curr.appsOwed - curr.apps);
      }
      if (curr.membershipsStatus === 'off-track') {
        acc.pms += Math.max(0, curr.membershipsOwed - curr.memberships);
      }
      return acc;
    }, { rev: 0, apps: 0, pms: 0 });
  };

  const gaps = getGapsSummary();

  return (
    <div className="flex-column gap-xl mt-md">
      
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
        rosterHistoryKeys={Object.keys(rosterHistory)}
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
        !parsedEmployees ? (
          <RentsDueUploader 
            fileName={fileName}
            errorMsg={errorMsg}
            isParsing={isParsing}
            textInput={textInput}
            setTextInput={setTextInput}
            handleFileChange={handleFileChange}
            fileInputRef={fileInputRef}
            handleManualTextParse={handleManualTextParse}
            handleProcessFile={handleProcessFile}
            loadDemoData={loadDemoData}
          />
        ) : (
          <RentsDueLedger 
            gaps={gaps}
            parsedEmployees={parsedEmployees}
            setParsedEmployees={setParsedEmployees}
            syncSuccess={syncSuccess}
            handleSyncToRoster={handleSyncToRoster}
          />
        )
      )}

    </div>
  );
}
