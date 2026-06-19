// @ts-nocheck
import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import { parseRentsDueDocumentGemini } from '../services/ai';
import { useStore } from '../store/useStore';

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
    return Array.isArray(rosterHistory[selectedPeriod]) ? rosterHistory[selectedPeriod] : [];
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
        const base64Url = e.target.result;
        const base64Data = base64Url.split(',')[1];
        runOcrParsing(base64Data, file.type, '');
      };
      reader.readAsDataURL(file);
    } else if (file.name.endsWith('.csv') || file.type === 'text/csv' || file.type === 'text/plain') {
      reader.onload = async (e) => {
        const text = e.target.result;
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
      setParsedEmployees([
        {
          name: "Ricky",
          rph: 649,
          rphOwed: 700,
          rphStatus: "off-track",
          revenue: 38875,
          revenueOwed: 42000,
          revenueStatus: "off-track",
          apps: 7,
          appsOwed: 10,
          appsStatus: "off-track",
          memberships: 3,
          membershipsOwed: 5,
          membershipsStatus: "off-track",
          warranty: 11.5,
          warrantyGoal: 12.0,
          warrantyStatus: "off-track"
        },
        {
          name: "Yinel",
          rph: 744,
          rphOwed: 640,
          rphStatus: "on-track",
          revenue: 25668,
          revenueOwed: 22000,
          revenueStatus: "on-track",
          apps: 10,
          appsOwed: 8,
          appsStatus: "on-track",
          memberships: 22,
          membershipsOwed: 15,
          membershipsStatus: "on-track",
          warranty: 22.2,
          warrantyGoal: 11.0,
          warrantyStatus: "on-track"
        },
        {
          name: "Muntarin",
          rph: 868,
          rphOwed: 800,
          rphStatus: "on-track",
          revenue: 44615,
          revenueOwed: 48000,
          revenueStatus: "off-track",
          apps: 0,
          appsOwed: 5,
          appsStatus: "off-track",
          memberships: 4,
          membershipsOwed: 6,
          membershipsStatus: "off-track",
          warranty: 17.1,
          warrantyGoal: 11.0,
          warrantyStatus: "on-track"
        },
        {
          name: "Victor",
          rph: 629,
          rphOwed: 800,
          rphStatus: "off-track",
          revenue: 81203,
          revenueOwed: 103200,
          revenueStatus: "off-track",
          apps: 13,
          appsOwed: 15,
          appsStatus: "off-track",
          memberships: 11,
          membershipsOwed: 12,
          membershipsStatus: "off-track",
          warranty: 8.0,
          warrantyGoal: 11.0,
          warrantyStatus: "off-track"
        },
        {
          name: "Daniel",
          rph: 1386,
          rphOwed: 700,
          rphStatus: "on-track",
          revenue: 42688,
          revenueOwed: 21500,
          revenueStatus: "on-track",
          apps: 3,
          appsOwed: 4,
          appsStatus: "off-track",
          memberships: 2,
          membershipsOwed: 3,
          membershipsStatus: "off-track",
          warranty: 7.5,
          warrantyGoal: 8.0,
          warrantyStatus: "off-track"
        },
        {
          name: "Paulie",
          rph: 1436,
          rphOwed: 1200,
          rphStatus: "on-track",
          revenue: 35900,
          revenueOwed: 30000,
          revenueStatus: "on-track",
          apps: 3,
          appsOwed: 3,
          appsStatus: "on-track",
          memberships: 2,
          membershipsOwed: 2,
          membershipsStatus: "on-track",
          warranty: 11.6,
          warrantyGoal: 12.0,
          warrantyStatus: "off-track"
        },
        {
          name: "Sarah Jenkins",
          rph: 850,
          rphOwed: 900,
          rphStatus: "off-track",
          revenue: 15400,
          revenueOwed: 18000,
          revenueStatus: "off-track",
          apps: 4,
          appsOwed: 5,
          appsStatus: "off-track",
          memberships: 3,
          membershipsOwed: 4,
          membershipsStatus: "off-track",
          warranty: 10.5,
          warrantyGoal: 11.0,
          warrantyStatus: "off-track"
        },
        {
          name: "Marcus Vance",
          rph: 720,
          rphOwed: 700,
          rphStatus: "on-track",
          revenue: 12500,
          revenueOwed: 11000,
          revenueStatus: "on-track",
          apps: 3,
          appsOwed: 2,
          appsStatus: "on-track",
          memberships: 2,
          membershipsOwed: 2,
          membershipsStatus: "on-track",
          warranty: 8.5,
          warrantyGoal: 8.0,
          warrantyStatus: "on-track"
        },
        {
          name: "Elena Rostova",
          rph: 1250,
          rphOwed: 1200,
          rphStatus: "on-track",
          revenue: 41200,
          revenueOwed: 36000,
          revenueStatus: "on-track",
          apps: 5,
          appsOwed: 4,
          appsStatus: "on-track",
          memberships: 4,
          membershipsOwed: 3,
          membershipsStatus: "on-track",
          warranty: 13.2,
          warrantyGoal: 12.0,
          warrantyStatus: "on-track"
        }
      ]);
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
    
    let updatedCount = 0;
    let addedCount = 0;
    
    const importList = parsedEmployees.map(parsedEmp => {
      const nameKey = parsedEmp.name.toLowerCase().trim();
      const existing = comparisonRoster.find(r => r.name.toLowerCase().trim() === nameKey);
      
      const parsedRPH = parsedEmp.rph || (existing ? existing.rph : 640);
      const parsedRev = parsedEmp.revenue || (existing ? (existing.hours * existing.rph) : 0);
      const safeRPH = parsedRPH > 0 ? parsedRPH : 640;
      const calculatedHours = parsedRev > 0 ? Math.round((parsedRev / safeRPH) * 10) / 10 : (existing ? existing.hours : 0);

      // Infer department from target RPH
      let inferredDept = 'General Sales';
      const rphTarget = parsedEmp.rphOwed || 640;
      if (rphTarget === 1200) inferredDept = 'Appliances';
      else if (rphTarget === 900) inferredDept = 'Computing';
      else if (rphTarget === 800) inferredDept = 'Home Theatre';
      else if (rphTarget === 700) inferredDept = 'Mobile';
      else if (rphTarget === 500) inferredDept = 'Geek Squad';
      else if (rphTarget === 640) inferredDept = 'General Sales';

      if (existing) {
        updatedCount++;
        // For existing, only overwrite performance values
        return {
          name: existing.name, // Keep existing case name
          rph: parsedRPH,
          memberships: parsedEmp.memberships !== undefined ? parsedEmp.memberships : existing.memberships,
          creditCards: parsedEmp.apps !== undefined ? parsedEmp.apps : existing.creditCards,
          warranty: parsedEmp.warranty !== undefined ? parsedEmp.warranty : existing.warranty,
          hours: calculatedHours
        };
      } else {
        addedCount++;
        // For new, provide full employee structure
        return {
          name: parsedEmp.name.trim(),
          dept: inferredDept,
          hours: calculatedHours,
          memberships: parsedEmp.memberships || 0,
          creditCards: parsedEmp.apps || 0,
          warranty: parsedEmp.warranty || 0.0,
          surveys: 5.0,
          rph: parsedRPH,
          basket: 0,
          m365: 0,
          audio: 0,
          focus5: false,
          gap: 'None'
        };
      }
    });

    onBulkImportEmployees(importList, selectedPeriod);
    addDailySnapshot(snapshotDate, parsedEmployees);
    setSyncSuccess(true);
    
    let msg = `Successfully synced metrics: `;
    if (updatedCount > 0 && addedCount > 0) {
      msg += `updated ${updatedCount} existing associates and added ${addedCount} new associates to your ${selectedPeriod} roster!`;
    } else if (addedCount > 0) {
      msg += `added ${addedCount} new associates to your ${selectedPeriod} roster!`;
    } else {
      msg += `updated ${updatedCount} existing associates in your ${selectedPeriod} roster!`;
    }
    
    alert(msg);
    setTimeout(() => setSyncSuccess(false), 4000);
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
        /* UPLOAD PORTAL */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
          
          {/* File Upload card */}
          <div 
            className="glass-card"
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '3rem 2rem',
              border: '2px dashed var(--border-glass)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handleProcessFile(file);
            }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
              accept=".csv,text/csv,text/plain,image/*"
            />
            <Upload size={48} color="var(--bby-blue)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>Upload Rents Due Document</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'center' }}>
              Drag & drop CSV, spreadsheet text, or a photo screenshot here
            </p>
            <button className="btn btn-secondary" style={{ marginTop: '1.25rem', pointerEvents: 'none' }}>
              Choose File
            </button>
            {fileName && (
              <span style={{ fontSize: '0.75rem', color: 'var(--bby-yellow)', marginTop: '0.75rem' }}>
                Selected: {fileName}
              </span>
            )}
          </div>

          {/* Copy Paste Text Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FileText size={16} /> Copy-Paste Spreadsheet Rows:
            </h3>
            <textarea 
              className="form-control"
              rows={6}
              style={{ resize: 'none', fontSize: '0.8rem', fontFamily: 'monospace', background: 'rgba(11, 15, 25, 0.4)' }}
              placeholder="Ricky,649,700,off-track,38000,42000,off-track,7,10,off-track,3,5,off-track..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '0.65rem' }} 
                onClick={loadDemoData}
              >
                Try Demo Dataset
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '0.65rem' }} 
                onClick={handleManualTextParse}
                disabled={isParsing}
              >
                {isParsing ? 'Processing...' : 'Parse Text Report'}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div style={{ gridColumn: '1/-1', padding: '1rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', fontSize: '0.8rem', color: '#fca5a5' }}>
              {errorMsg}
            </div>
          )}

          {isParsing && (
            <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={14} className="animate-spin" /> AI is parsing layout configurations and auditing salesperson metrics...
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse" style={{ height: '56px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '10px' }} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* AUDIT RESULTS VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Top KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Revenue Rent Owed</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: gaps.rev > 0 ? 'var(--error)' : 'var(--success)', marginTop: '0.25rem', fontFamily: 'var(--font-heading)' }}>
                ${gaps.rev.toLocaleString()}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Outstanding salesperson gap</span>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Apps Owed</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: gaps.apps > 0 ? 'var(--bby-yellow)' : 'var(--success)', marginTop: '0.25rem', fontFamily: 'var(--font-heading)' }}>
                {gaps.apps} Apps
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Credit Card apps to reach standard</span>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Memberships Owed</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: gaps.pms > 0 ? 'var(--info)' : 'var(--success)', marginTop: '0.25rem', fontFamily: 'var(--font-heading)' }}>
                {gaps.pms} Plus/Total
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Memberships to reach standard</span>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Rent Payer Rate</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.25rem', fontFamily: 'var(--font-heading)' }}>
                {Math.round((parsedEmployees.filter(e => e.rphStatus === 'on-track' && e.revenueStatus === 'on-track').length / parsedEmployees.length) * 100)}%
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Associates meeting all baseline Rents</span>
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => setParsedEmployees(null)}>
                ← Reset & Upload New File
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                className="btn btn-accent" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                onClick={handleSyncToRoster}
              >
                Sync Metrics to Active Roster
              </button>
            </div>
          </div>

          {syncSuccess && (
            <div style={{ padding: '0.75rem 1.25rem', background: 'var(--success-glow)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', fontSize: '0.825rem', color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} /> Roster ledger values updated. All performance evaluations and sparklines will reflect these parsed values immediately.
            </div>
          )}

          {/* Ledger Table */}
          <div className="glass-card" style={{ overflowX: 'auto', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.01)' }}>
                  <th style={{ padding: '1rem' }}>SALESPERSON</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>RPH ($/hr)</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>REVENUE ($)</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>CREDIT CARDS</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>MEMBERSHIPS</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>WARRANTY GSP</th>
                </tr>
              </thead>
              <tbody>
                {parsedEmployees.map((emp, idx) => {
                  const isPaidAll = emp.rphStatus === 'on-track' && emp.revenueStatus === 'on-track' && emp.appsStatus === 'on-track' && emp.membershipsStatus === 'on-track';
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-glass)', background: isPaidAll ? 'rgba(16, 185, 129, 0.02)' : 'transparent' }}>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{emp.name}</span>
                          <span style={{ fontSize: '0.7rem', color: isPaidAll ? 'var(--success)' : 'var(--text-muted)' }}>
                            {isPaidAll ? 'Paid Full Rent' : 'Owes Rent'}
                          </span>
                        </div>
                      </td>
                      
                      {/* RPH */}
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold' }}>${emp.rph}</span>
                          <span style={{ fontSize: '0.7rem', color: emp.rphStatus === 'on-track' ? 'var(--success)' : 'var(--error)' }}>
                            {emp.rphStatus === 'on-track' ? 'Paid' : `Owed: $${emp.rphOwed}`}
                          </span>
                        </div>
                      </td>

                      {/* REVENUE */}
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold' }}>${emp.revenue.toLocaleString()}</span>
                          <span style={{ fontSize: '0.7rem', color: emp.revenueStatus === 'on-track' ? 'var(--success)' : 'var(--error)' }}>
                            {emp.revenueStatus === 'on-track' ? 'Paid' : `Owed: $${emp.revenueOwed.toLocaleString()}`}
                          </span>
                        </div>
                      </td>

                      {/* APPS */}
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold' }}>{emp.apps} Apps</span>
                          <span style={{ fontSize: '0.7rem', color: emp.appsStatus === 'on-track' ? 'var(--success)' : 'var(--error)' }}>
                            {emp.appsStatus === 'on-track' ? 'Paid' : `Owed: ${emp.appsOwed}`}
                          </span>
                        </div>
                      </td>

                      {/* MEMBERSHIPS */}
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold' }}>{emp.memberships} PMs</span>
                          <span style={{ fontSize: '0.7rem', color: emp.membershipsStatus === 'on-track' ? 'var(--success)' : 'var(--error)' }}>
                            {emp.membershipsStatus === 'on-track' ? 'Paid' : `Owed: ${emp.membershipsOwed}`}
                          </span>
                        </div>
                      </td>

                      {/* WARRANTY */}
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold' }}>{emp.warranty}%</span>
                          <span style={{ fontSize: '0.7rem', color: emp.warrantyStatus === 'on-track' ? 'var(--success)' : 'var(--error)' }}>
                            Goal: {emp.warrantyGoal}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}
