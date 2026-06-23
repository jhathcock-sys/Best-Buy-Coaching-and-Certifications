import React from 'react';
import { FileText, Camera } from 'lucide-react';
import { WEEKDAY_KEYS } from '../../utils/scheduleParserUtils';

export default function ImportWizardStep1({
  activeTab,
  fileName,
  fileInputRef,
  handleImageFile,
  handleCsvFile,
  isWeeklyCsv,
  csvHeaders,
  selectedDayColumn,
  setSelectedDayColumn,
  csvMappings,
  setCsvMappings,
  generatePreviewFromCsv,
  runDemoParse
}) {
  return (
    <div>
      {activeTab === 'image' ? (
        // Screenshot Import View
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div 
            style={{ border: '2px dashed var(--border-glass)', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', cursor: 'pointer' }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e: any) => e.target.files[0] && handleImageFile(e.target.files[0])} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
            <div style={{ background: 'rgba(0, 70, 190, 0.08)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
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
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e: any) => e.target.files[0] && handleCsvFile(e.target.files[0])} 
              accept=".csv" 
              style={{ display: 'none' }} 
            />
            <div style={{ background: 'rgba(0, 70, 190, 0.08)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
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
                    {csvHeaders.filter(h => WEEKDAY_KEYS.includes(h?.toLowerCase())).map((h, i) => (
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
  );
}
