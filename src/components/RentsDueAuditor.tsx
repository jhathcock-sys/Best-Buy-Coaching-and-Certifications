import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import RentsDueUploader from './RentsDueAuditor/RentsDueUploader';
import RentsDueLedger from './RentsDueAuditor/RentsDueLedger';
import { parseRentsDueDocumentGemini } from '../services/ai';
import { useStore } from '../store/useStore';
import { mockRentsDuePayload } from '../data/mockRentsDue';
import { mapParsedRentsToRoster } from '../utils/rentsDueUtils';

export default function RentsDueAuditor({ roster = [], activePeriod, rosterHistory = {}, onBulkImportEmployees, apiKey }) {
  const [selectedPeriod, setSelectedPeriod] = useState(activePeriod);
  const [showNewPeriodInput, setShowNewPeriodInput] = useState(false);
  const [customPeriodName, setCustomPeriodName] = useState('');

  const [isParsing, setIsParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState('');
  const [textInput, setTextInput] = useState('');
  const [parsedEmployees, setParsedEmployees] = useState(null);
  const [syncSuccess, setSyncSuccess] = useState(false);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [snapshotDate, setSnapshotDate] = useState(todayStr);

  const addDailySnapshot = useStore((state) => state.addDailySnapshot);
  const fileInputRef = useRef(null);

  const comparisonRoster = React.useMemo(() => {
    if (selectedPeriod === activePeriod) return roster;
    const rawRoster = rosterHistory[selectedPeriod] || {};
    return Object.values(rawRoster).sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [selectedPeriod, activePeriod, roster, rosterHistory]);

  // File drop/upload handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleProcessFile(file);
  };

  const handleProcessFile = (file) => {
    setFileName(file.name);
    setErrorMsg('');
    setParsedEmployees(null);

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
        runOcrParsing('', '', text);
      };
      reader.readAsText(file);
    } else {
      setErrorMsg('Error: Please upload a valid CSV file, text sheet copy-paste, or image screenshot.');
    }
  };

  const runOcrParsing = async (base64Data, mimeType, textData) => {
    setIsParsing(true);
    setErrorMsg('');
    try {
      const parsed = await parseRentsDueDocumentGemini(base64Data, mimeType, textData || textInput, apiKey);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setParsedEmployees(parsed);
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

  const handleManualTextParse = () => {
    if (!textInput.trim()) {
      alert("Please paste the spreadsheet text copy or CSV data first!");
      return;
    }
    runOcrParsing('', '', textInput);
  };

  const loadDemoData = () => {
    setIsParsing(true);
    setErrorMsg('');
    setFileName('rents_due_june_2026_copy.csv');
    
    setTimeout(() => {
      setParsedEmployees(mockRentsDuePayload);
      setIsParsing(false);
    }, 1200);
  };

  // Sync parsed metrics back to the store roster (updates active roster metrics or imports new ones)
  const handleSyncToRoster = () => {
    if (!parsedEmployees || parsedEmployees.length === 0) return;
    if (!onBulkImportEmployees) {
      alert("Error: Store action to bulk import employees is missing.");
      return;
    }
    
    const { importList, updatedCount, addedCount } = mapParsedRentsToRoster(parsedEmployees, comparisonRoster);
    
    onBulkImportEmployees(importList);
    setSyncSuccess(true);
    
    setTimeout(() => {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1rem' }}>
      
      {/* Description Panel */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--bby-yellow)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <FileText size={20} /> Rents Due Document Auditor
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginTop: '0.5rem', lineHeight: '1.4' }}>
          "Paying Rent" represents meeting baseline sales metrics. Upload your weirdly laid out **Rents Due** spreadsheet report (as a CSV file, copied spreadsheet text lines, or an image/screenshot of the table). The AI parses salesperson RPH, total revenue, apps, memberships, and protection warranty attachments, showing who has paid rent and mapping the gaps.
        </p>
      </div>

      {/* Target Period Selector */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', background: 'rgba(255, 255, 255, 0.015)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Target Ledger Period (Month):</label>
          {!showNewPeriodInput ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                className="form-control"
                style={{
                  background: 'rgba(11, 15, 25, 0.6)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '6px',
                  padding: '0.45rem 1.75rem 0.45rem 1rem',
                  fontSize: '0.85rem',
                  color: '#fff',
                  width: '210px',
                  cursor: 'pointer'
                }}
                value={selectedPeriod}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    setShowNewPeriodInput(true);
                  } else {
                    setSelectedPeriod(e.target.value);
                  }
                }}
              >
                {Object.keys(rosterHistory).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
                <option value="__new__">+ Create New Month...</option>
              </select>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-control"
                style={{
                  background: 'rgba(11, 15, 25, 0.6)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '6px',
                  padding: '0.45rem 1rem',
                  fontSize: '0.85rem',
                  color: '#fff',
                  width: '210px'
                }}
                placeholder="e.g. April 2026"
                value={customPeriodName}
                onChange={(e) => setCustomPeriodName(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}
                onClick={() => {
                  if (customPeriodName.trim()) {
                    const cleaned = customPeriodName.trim();
                    setSelectedPeriod(cleaned);
                    setShowNewPeriodInput(false);
                  } else {
                    alert("Please enter a valid period name.");
                  }
                }}
              >
                Use
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem', border: '1px solid var(--border-glass)' }}
                onClick={() => {
                  setShowNewPeriodInput(false);
                  setSelectedPeriod(activePeriod);
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        <div style={{ flex: 1, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Uploading and parsing will apply to the performance ledger of <strong style={{ color: 'var(--bby-yellow)' }}>{selectedPeriod}</strong>. 
          {comparisonRoster.length > 0 ? (
            <span> This period has <strong>{comparisonRoster.length}</strong> existing team members. Syncing will merge the parsed metrics.</span>
          ) : (
            <span> This is a new period. Syncing will automatically initialize this month's roster in the database with the parsed data.</span>
          )}
        </div>
      </div>
      
      {/* Snapshot Date Config */}
      <div className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Log Snapshot As:</span>
        <input 
          type="date"
          className="form-input"
          value={snapshotDate}
          onChange={(e) => setSnapshotDate(e.target.value)}
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', maxWidth: '200px' }}
        />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>This sets the date for Trend Reporting aggregation.</span>
      </div>


          {!parsedEmployees ? (
            <RentsDueUploader 
              selectedPeriod={selectedPeriod}
              setSelectedPeriod={setSelectedPeriod}
              showNewPeriodInput={showNewPeriodInput}
              setShowNewPeriodInput={setShowNewPeriodInput}
              customPeriodName={customPeriodName}
              setCustomPeriodName={setCustomPeriodName}
              snapshotDate={snapshotDate}
              setSnapshotDate={setSnapshotDate}
              rosterHistory={rosterHistory}
              activePeriod={activePeriod}
              todayStr={todayStr}
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
              parsedEmployees={parsedEmployees}
              setParsedEmployees={setParsedEmployees}
              syncSuccess={syncSuccess}
              setSyncSuccess={setSyncSuccess}
              handleSyncToRoster={handleSyncToRoster}
              comparisonRoster={comparisonRoster}
 />
          ) : (
            <RentsDueLedger 
              gaps={gaps}
              selectedPeriod={selectedPeriod}
              setSelectedPeriod={setSelectedPeriod}
              showNewPeriodInput={showNewPeriodInput}
              setShowNewPeriodInput={setShowNewPeriodInput}
              customPeriodName={customPeriodName}
              setCustomPeriodName={setCustomPeriodName}
              snapshotDate={snapshotDate}
              setSnapshotDate={setSnapshotDate}
              rosterHistory={rosterHistory}
              activePeriod={activePeriod}
              todayStr={todayStr}

              parsedEmployees={parsedEmployees}
              setParsedEmployees={setParsedEmployees}
              syncSuccess={syncSuccess}
              setSyncSuccess={setSyncSuccess}
              handleSyncToRoster={handleSyncToRoster}
              comparisonRoster={comparisonRoster}
 />
          )}


    </div>
  );
}
