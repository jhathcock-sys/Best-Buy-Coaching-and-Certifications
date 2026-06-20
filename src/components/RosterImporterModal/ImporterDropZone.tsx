import React from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, X, ChevronRight } from 'lucide-react';

export default function ImporterDropZone({ 
  parsedData,
  mappedHeaders,
  handleHeaderMapping,
  generatedRoster,
  onBulkImportEmployees,
  onClose,
  handleFileUpload,
  setImportStep,
  handleDragOver,
  handleDrop,
  errorMsg
}) {
  return (
    <>
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{
                border: '2px dashed var(--border-glass)',
                borderRadius: '16px',
                padding: '3rem 2rem',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.01)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => fileInputRef.current.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept=".csv" 
                style={{ display: 'none' }} 
              />
              <div style={{ background: 'rgba(0, 70, 190, 0.08)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                <Upload size={32} color="var(--info)" />
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Drag & Drop CSV File here</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                or click to browse your files. Excel/Google Sheets files should be exported/saved as **.csv** first.
              </p>
              
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <FileText size={14} /> Expected Columns: Name, Department, Hours, Memberships, Cards, GSP, Surveys, RPH, Basket, M365 Attach, Audio Attach
              </div>
            </div>
    </>
  );
}
