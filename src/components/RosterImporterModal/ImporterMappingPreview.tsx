import React from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, X, ChevronRight } from 'lucide-react';

export default function ImporterMappingPreview({ 
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
            <div>
              {/* Loaded File Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-glass)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={18} color="var(--bby-yellow)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{fileName}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({csvData.length} records found)</span>
                </div>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', height: '28px' }}
                  onClick={() => {
                    setCsvData(null);
                    setHeaders([]);
                    setParsedRows([]);
                    setFileName('');
                  }}
                >
                  Change File
                </button>
              </div>

              {/* Step 2: Mapping Grid */}
              <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                Verify CSV Column Mapping <ChevronRight size={16} />
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Our system automatically matched your spreadsheet columns. Verify below that each field aligns with the correct app parameter.
              </p>

              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                  gap: '1rem', 
                  marginBottom: '2rem',
                  background: 'rgba(255,255,255,0.01)',
                  padding: '1.25rem',
                  borderRadius: '16px',
                  border: '1px solid var(--border-glass)'
                }}
              >
                {Object.keys(FUZZY_MAP).map(key => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
    </>
  );
}
