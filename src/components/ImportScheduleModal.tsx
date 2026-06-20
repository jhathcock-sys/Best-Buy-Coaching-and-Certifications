import ImportScheduleRow from './ImportSchedule/ImportScheduleRow';
// @ts-nocheck
import { useState, useRef } from 'react';
import { X, Check, AlertCircle, FileText, Camera } from 'lucide-react';
import { parseScheduleImage } from '../services/ai';

// standard department/zone mapping helper
import { useScheduleParser } from '../hooks/useScheduleParser';
import { generateBreaks } from '../utils/scheduleParserUtils';
import ImportWizardStep1 from './ImportSchedule/ImportWizardStep1';
import ImportWizardStep2 from './ImportSchedule/ImportWizardStep2';

export default function ImportScheduleModal({ isOpen, onClose, roster = [], onImportConfirm, apiKey, onAddEmployee }) {
  const {
    activeTab, setActiveTab,
    isParsing, setIsParsing,
    parsedItems, setParsedItems,
    reviews, setReviews,
    fileName, setFileName,
    errorMsg, setErrorMsg,
    csvHeaders, setCsvHeaders,
    csvDataRows, setCsvDataRows,
    csvMappings, setCsvMappings,
    isWeeklyCsv, setIsWeeklyCsv,
    selectedDayColumn, setSelectedDayColumn,
    fileInputRef,
    handleImageFile,
    handleCsvFile,
    handleMatchChange,
    handleZoneChange,
    handleShiftTimeChange,
    handleConfirmImport
  } = useScheduleParser(roster, onImportConfirm, onClose, apiKey, onAddEmployee, isOpen);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '980px', background: '#0e1220', padding: 0 }} onClick={(e: any) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid var(--border-glass)' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <CalendarIcon size={20} color="var(--bby-yellow)" /> Floor Schedule Importer
          </h3>
          <button className="btn btn-secondary btn-icon" style={{ padding: '0.4rem' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tab Selection Headers */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--border-glass)' }}>
          <button 
            style={{ flex: 1, padding: '1rem', background: activeTab === 'image' ? 'rgba(0,70,190,0.1)' : 'transparent', border: 'none', borderBottom: activeTab === 'image' ? '3px solid var(--bby-blue)' : 'none', color: activeTab === 'image' ? '#fff' : 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer' }}
            onClick={() => { setActiveTab('image'); setErrorMsg(''); setParsedItems([]); }}
          >
            📸 Screenshot Upload
          </button>
          <button 
            style={{ flex: 1, padding: '1rem', background: activeTab === 'csv' ? 'rgba(0,70,190,0.1)' : 'transparent', border: 'none', borderBottom: activeTab === 'csv' ? '3px solid var(--bby-blue)' : 'none', color: activeTab === 'csv' ? '#fff' : 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer' }}
            onClick={() => { setActiveTab('csv'); setErrorMsg(''); setParsedItems([]); }}
          >
            📊 CSV Spreadsheet
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '2rem', maxHeight: '65vh', overflowY: 'auto' }}>
          
          {errorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '1rem', borderRadius: '12px', color: '#fca5a5', display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{errorMsg}</div>
            </div>
          )}

          {parsedItems.length === 0 ? (
            /* STEP 1: UPLOAD STATE */
            <div>
              {activeTab === 'image' ? (
                // Screenshot Import View
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div 
                    style={{ border: '2px dashed var(--border-glass)', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', cursor: 'pointer' }}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={(e: any) => e.target.files[0] && handleImageFile(e.target.files[0])} 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                    />
                    <div style={{ background: 'rgba(0, 70, 190, 0.08)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyText: 'center', alignContent: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                      <Camera size={32} color="var(--info)" />
                    </div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Drag & Drop Schedule Screenshot</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                      Supports JPEG, PNG daily scheduling printout snapshots.
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button className="btn btn-secondary" onClick={runDemoParse}>
                      ⚡ Try Demo Image Parse
                    </button>
                  </div>
                </div>
              ) : (
                // CSV Import View
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div 
                    style={{ border: '2px dashed var(--border-glass)', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', cursor: 'pointer' }}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={(e: any) => e.target.files[0] && handleCsvFile(e.target.files[0])} 
                      accept=".csv" 
                      style={{ display: 'none' }} 
                    />
                    <div style={{ background: 'rgba(0, 70, 190, 0.08)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyText: 'center', alignContent: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                      <FileText size={32} color="var(--info)" />
                    </div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Drag & Drop Schedule CSV</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                      Supports Weekly Calendar sheets or Daily list sheets.
                    </p>
                  </div>

                  {csvHeaders.length > 0 && (
                    <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Configure CSV Columns ({fileName})</h4>
                      
                      {isWeeklyCsv ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '320px' }}>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Select Day to Import:</label>
                          <select 
                            className="form-control" 
                            style={{ background: '#0e1220' }}
                            value={selectedDayColumn}
                            onChange={(e: any) => setSelectedDayColumn(e.target.value)}
                          >
                            {csvHeaders.filter(h => WEEKDAY_KEYS.includes(h.toLowerCase())).map((h, i) => (
                              <option key={i} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Name Column:</label>
                            <select 
                              className="form-control" 
                              style={{ background: '#0e1220' }}
                              value={csvMappings.name} 
                              onChange={(e: any) => setCsvMappings({ ...csvMappings, name: parseInt(e.target.value) })}
                            >
                              {csvHeaders.map((h, i) => (
                                <option key={i} value={i}>Col {i + 1}: {h}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Shift Column:</label>
                            <select 
                              className="form-control" 
                              style={{ background: '#0e1220' }}
                              value={csvMappings.shift} 
                              onChange={(e: any) => setCsvMappings({ ...csvMappings, shift: parseInt(e.target.value) })}
                            >
                              {csvHeaders.map((h, i) => (
                                <option key={i} value={i}>Col {i + 1}: {h}</option>
                              ))}
                            </select>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Zone/Dept Column:</label>
                            <select 
                              className="form-control" 
                              style={{ background: '#0e1220' }}
                              value={csvMappings.zone} 
                              onChange={(e: any) => setCsvMappings({ ...csvMappings, zone: parseInt(e.target.value) })}
                            >
                              <option value={-1}>-- Default Zone --</option>
                              {csvHeaders.map((h, i) => (
                                <option key={i} value={i}>Col {i + 1}: {h}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      <button className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '0.5rem 1.5rem' }} onClick={generatePreviewFromCsv}>
                        Analyze CSV Data
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : isParsing ? (
            /* LOADING PARSE STATE */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '1.5rem' }}>
              <div className="spinner" style={{ width: '48px', height: '48px', border: '4px solid rgba(255,255,255,0.05)', borderTopColor: 'var(--bby-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>Analyzing schedule image...</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>Gemini is extracting schedule names, times, and zones.</p>
              </div>
            </div>
          ) : (
            /* STEP 2: REVIEW & OVERRIDE VALIDATION GRID */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', margin: 0 }}>Validate & Map Floor Schedule</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.775rem', margin: '0.15rem 0 0 0' }}>Verify fuzzy matches to your roster. Red highlights indicate unmatched names that will be ignored unless overridden.</p>
                </div>
                <button 
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                  onClick={() => { setParsedItems([]); setReviews([]); }}
                >
                  Clear Import
                </button>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid var(--border-glass)', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(16, 24, 48, 0.9)', borderBottom: '1px solid var(--border-glass)' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>EXTRACTED NAME</th>
                      <th style={{ padding: '0.75rem 1rem' }}>SHIFT TIME</th>
                      <th style={{ padding: '0.75rem 1rem' }}>ROSTER MATCH</th>
                      <th style={{ padding: '0.75rem 1rem' }}>ZONE ASSIGNMENT</th>
                      <th style={{ padding: '0.75rem 1rem' }}>AUTO BREAKS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((rev) => {
                      const matched = rev.matchedEmpId !== '';
                      const breaks = generateBreaks(rev.matchedEmpId, 'Mock', rev.startTimeStr, rev.durationHours);

                      return (
                        <ImportScheduleRow 
                          key={rev.id}
                          rev={rev}
                          roster={roster}
                          handleShiftTimeChange={handleShiftTimeChange}
                          handleMatchChange={handleMatchChange}
                          handleZoneChange={handleZoneChange}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem 2rem', borderTop: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.01)' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          
          {parsedItems.length > 0 && !isParsing && (
            <button 
              className="btn btn-accent" 
              style={{ color: '#000', display: 'flex', alignItems: 'center', gap: '0.35rem' }} 
              onClick={handleConfirmImport}
            >
              <Check size={16} /> Confirm Import ({reviews.filter(r => r.matchedEmpId !== '').length} Associates)
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

// Inline mini Calendar icon representation to avoid extra Lucide import concerns
function CalendarIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}

