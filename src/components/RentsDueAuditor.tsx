import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import RentsDueUploader from './RentsDueAuditor/RentsDueUploader';
import RentsDueLedger, { ParsedEmployee } from './RentsDueAuditor/RentsDueLedger';
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
  const [showNewPeriodInput, setShowNewPeriodInput] = useState(false);
  const [customPeriodName, setCustomPeriodName] = useState('');

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
          setIsParsing(true);
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

      {/* Target Period Selector */}
      <div className="glass-card flex-row align-center gap-md flex-wrap p-lg bg-[rgba(255,255,255,0.015)]">
        <div className="flex-column gap-xs">
          <label className="text-xs font-bold text-secondary">Target Ledger Period (Month):</label>
          {!showNewPeriodInput ? (
            <div className="flex-row align-center gap-sm">
              <select
                className="form-control cursor-pointer bg-obsidian border border-glass rounded-md px-md py-[0.45rem] text-[0.85rem] text-white w-[210px]"
                value={selectedPeriod}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    setShowNewPeriodInput(true);
                  } else {
                    setSelectedPeriod(e.target.value);
                  }
                }}
                data-testid="target-period-select"
              >
                {Object.keys(rosterHistory).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
                <option value="__new__">+ Create New Month...</option>
              </select>
            </div>
          ) : (
            <div className="flex-row align-center gap-sm">
              <input
                type="text"
                className="form-control bg-obsidian border border-glass rounded-md px-md py-[0.45rem] text-[0.85rem] text-white w-[210px]"
                placeholder="e.g. April 2026"
                value={customPeriodName}
                onChange={(e) => setCustomPeriodName(e.target.value)}
                data-testid="custom-period-input"
              />
              <button
                type="button"
                className="btn btn-primary cursor-pointer text-xs px-[0.85rem] py-[0.45rem]"
                onClick={() => {
                  if (customPeriodName.trim()) {
                    const cleaned = customPeriodName.trim();
                    setSelectedPeriod(cleaned);
                    setShowNewPeriodInput(false);
                  } else {
                    alert("Please enter a valid period name.");
                  }
                }}
                data-testid="use-custom-period-btn"
              >
                Use
              </button>
              <button
                type="button"
                className="btn btn-secondary cursor-pointer text-xs px-[0.85rem] py-[0.45rem]"
                onClick={() => {
                  setShowNewPeriodInput(false);
                  setSelectedPeriod(activePeriod);
                }}
                data-testid="cancel-custom-period-btn"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        <div className="text-xs text-muted flex-1 leading-relaxed">
          Uploading and parsing will apply to the performance ledger of <strong className="text-bby-yellow">{selectedPeriod}</strong>. 
          {comparisonRoster.length > 0 ? (
            <span> This period has <strong>{comparisonRoster.length}</strong> existing team members. Syncing will merge the parsed metrics.</span>
          ) : (
            <span> This is a new period. Syncing will automatically initialize this month's roster in the database with the parsed data.</span>
          )}
        </div>
      </div>
      
      {/* Snapshot Date Config */}
      <div className="glass-card flex-row align-center gap-md p-md mb-xl">
        <span className="text-sm font-semibold text-secondary">Log Snapshot As:</span>
        <input 
          type="date"
          className="form-input px-sm py-[0.4rem] text-[0.85rem] max-w-[200px]"
          value={snapshotDate}
          onChange={(e) => setSnapshotDate(e.target.value)}
          data-testid="snapshot-date-input"
        />
        <span className="text-xs text-muted">This sets the date for Trend Reporting aggregation.</span>
      </div>

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
            <div className="flex-column gap-md" data-testid="archives-list">
              {!archives || archives.length === 0 ? (
                <div className="glass-card p-xl text-center text-secondary" data-testid="empty-archives-msg">
                  No Rents Due archives found for this store.
                </div>
              ) : (
                archives?.map(arch => (
                  <div key={arch.id} className="glass-card p-md flex-row justify-between align-center" data-testid={`archive-item-${arch.id}`}>
                    <div>
                      <h4 className="m-0 font-bold text-sm">{arch.fileName}</h4>
                      <div className="text-xs text-secondary mt-xs">
                        Period: {arch.period} | Uploaded: {new Date(arch.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <a href={arch.downloadUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary cursor-pointer text-xs px-md py-sm flex-center-y gap-xs" data-testid={`download-archive-${arch.id}`}>
                      <FileText size={14} /> View / Download
                    </a>
                  </div>
                ))
              )}
            </div>
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
