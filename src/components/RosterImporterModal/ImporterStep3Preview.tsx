import React from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, X } from 'lucide-react';

export default function ImporterStep3Preview({ 
  parsedData,
  mappedHeaders,
  handleHeaderMapping,
  generatedRoster,
  onBulkImportEmployees,
  onClose,
  handleFileUpload,
  setImportStep
 }) {
  return (
    <>
            <button 
              className="btn btn-accent" 
              style={{ color: '#000', display: 'flex', alignItems: 'center', gap: '0.35rem' }} 
              onClick={handleSaveImport}
            >
              <Check size={16} /> Import {parsedRows.length} Associates
            </button>
    </>
  );
}
