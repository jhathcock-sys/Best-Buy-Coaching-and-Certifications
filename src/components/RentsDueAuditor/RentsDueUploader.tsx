// @ts-nocheck
import React from 'react';
import { Upload, FileText, CheckCircle2, RefreshCw } from 'lucide-react';

export default function RentsDueUploader({ 
  selectedPeriod,
  setSelectedPeriod,
  showNewPeriodInput,
  setShowNewPeriodInput,
  customPeriodName,
  setCustomPeriodName,
  snapshotDate,
  setSnapshotDate,
  rosterHistory,
  activePeriod,
  todayStr,
  fileName,
  errorMsg,
  isParsing,
  textInput,
  setTextInput,
  handleFileChange,
  fileInputRef,
  handleTextSubmit,
  parsedEmployees,
  setParsedEmployees,
  syncSuccess,
  setSyncSuccess,
  handleSyncToRoster,
  comparisonRoster
 }) {
  return (
    <>
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
    </>
  );
}
