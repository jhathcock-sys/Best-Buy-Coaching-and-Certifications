import React, { useState, useEffect } from 'react';
import { Upload, FileText, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';

export interface RentsDueUploaderProps {
  fileName: string | null;
  errorMsg: string | null;
  isParsing: boolean;
  textInput: string;
  setTextInput: (val: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleManualTextParse: () => void;
  handleProcessFile: (file: File) => void;
  loadDemoData: () => void;
  mappingState?: {
    isMapping: boolean;
    fields: string[];
    prefilledMapping: Record<string, string>;
    textData: string;
  };
  onCancelMapping?: () => void;
  onConfirmMapping?: (mapping: Record<string, string>) => void;
}

export default function RentsDueUploader({ 
  fileName,
  errorMsg,
  isParsing,
  textInput,
  setTextInput,
  handleFileChange,
  fileInputRef,
  handleManualTextParse,
  handleProcessFile,
  loadDemoData,
  mappingState,
  onCancelMapping,
  onConfirmMapping
}: RentsDueUploaderProps) {
  const [currentMapping, setCurrentMapping] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mappingState?.isMapping) {
      setCurrentMapping(mappingState.prefilledMapping || {});
    }
  }, [mappingState?.isMapping, mappingState?.prefilledMapping]);

  const handleFieldChange = (key: string, value: string) => {
    setCurrentMapping(prev => ({ ...prev, [key]: value }));
  };

  const MAPPING_METRICS = [
    { key: 'name', label: 'Employee Name (Required)' },
    { key: 'rph', label: 'Rev / Hr' },
    { key: 'rphOwed', label: 'RPH Goal' },
    { key: 'revenue', label: 'Total Revenue' },
    { key: 'revenueOwed', label: 'Revenue Goal' },
    { key: 'apps', label: 'BPs / Apps' },
    { key: 'appsOwed', label: 'Apps Goal' },
    { key: 'memberships', label: 'Memberships (Plus/Total)' },
    { key: 'membershipsOwed', label: 'Memberships Goal' },
    { key: 'warranty', label: 'Warranty / GSP' },
    { key: 'warrantyGoal', label: 'Warranty Goal' }
  ];

  if (mappingState?.isMapping) {
    return (
      <div className="glass-card p-xl flex-column gap-md">
        <h3 className="text-lg font-heading text-bby-yellow flex-center-y gap-sm m-0">
          <AlertCircle size={20} /> Column Mapping Required
        </h3>
        <p className="text-sm text-secondary m-0">
          We couldn't automatically detect all standard columns in your CSV. Please select the correct column for each metric below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md mt-md">
          {MAPPING_METRICS.map(metric => (
            <div key={metric.key} className="flex-column gap-xs">
              <label className="text-xs font-bold text-secondary">{metric.label}</label>
              <select 
                className="form-control text-sm"
                value={currentMapping[metric.key] || ''}
                onChange={(e) => handleFieldChange(metric.key, e.target.value)}
                data-testid={`mapping-select-${metric.key}`}
              >
                <option value="">-- Ignore / Not Present --</option>
                {mappingState.fields.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="flex gap-sm justify-end mt-lg">
          <button className="btn btn-secondary cursor-pointer" onClick={onCancelMapping} data-testid="cancel-mapping-btn">
            Cancel
          </button>
          <button 
            className="btn btn-primary cursor-pointer flex-center-y gap-xs"
            onClick={() => onConfirmMapping?.(currentMapping)}
            disabled={!currentMapping.name || (!currentMapping.rph && !currentMapping.revenue)}
            data-testid="confirm-mapping-btn"
          >
            Confirm Mapping <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
        {/* UPLOAD PORTAL */}
        <div className="metrics-grid">
          
          {/* File Upload card */}
          <div 
            className="glass-card flex-column flex-center text-center p-[3rem_2rem] border-2 border-dashed border-[var(--border-glass)] cursor-pointer transition-normal"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (isParsing) return;
              const file = e.dataTransfer?.files?.[0];
              if (file) handleProcessFile(file);
            }}
            data-testid="upload-dropzone"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden"
              onChange={(e) => {
                if (isParsing) return;
                handleFileChange(e);
              }}
              accept=".csv,text/csv,text/plain,image/*"
              data-testid="upload-input"
            />
            <Upload size={48} className="text-bby-blue mb-md opacity-80" />
            <h3 className="text-base font-bold m-0">Upload Rents Due Document</h3>
            <p className="text-xs text-secondary mt-sm text-center">
              Drag & drop CSV, spreadsheet text, or a photo screenshot here
            </p>
            <button className="btn btn-secondary mt-xl pointer-events-none">
              Choose File
            </button>
            {fileName && (
              <span className="text-xs text-bby-yellow mt-md">
                Selected: {fileName}
              </span>
            )}
          </div>

          {/* Copy Paste Text Card */}
          <div className="glass-card flex-column gap-md p-xl">
            <h3 className="text-[0.95rem] font-bold m-0 flex-center-y gap-xs">
              <FileText size={16} /> Copy-Paste Spreadsheet Rows:
            </h3>
            <textarea 
              className="form-control resize-none text-xs font-mono bg-obsidian"
              rows={6}
              placeholder="Ricky,649,700,off-track,38000,42000,off-track,7,10,off-track,3,5,off-track..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              data-testid="paste-textarea"
            />
            
            <div className="flex gap-md mt-sm">
              <button 
                className="btn btn-secondary flex-1 p-[0.65rem] cursor-pointer" 
                onClick={loadDemoData}
                data-testid="try-demo-btn"
                disabled={isParsing}
              >
                Try Demo Dataset
              </button>
              <button 
                className={`btn btn-primary flex-1 p-[0.65rem] cursor-pointer ${isParsing ? 'opacity-50' : ''}`}
                onClick={handleManualTextParse}
                disabled={isParsing}
                data-testid="parse-text-btn"
              >
                {isParsing ? 'Processing...' : 'Parse Text Report'}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="col-span-full p-md bg-obsidian border border-error rounded-xl text-xs text-error-light">
              {errorMsg}
            </div>
          )}

          {isParsing && (
            <div className="col-span-full flex-column gap-md mt-md">
              <div className="text-sm text-secondary flex-center-y gap-sm">
                <RefreshCw size={14} className="animate-spin" /> AI is parsing layout configurations and auditing salesperson metrics...
              </div>
              <div className="flex-column gap-sm">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse h-[56px] bg-white-alpha-02 border border-[var(--border-glass)] rounded-xl" />
                ))}
              </div>
            </div>
          )}
        </div>
    </>
  );
}
