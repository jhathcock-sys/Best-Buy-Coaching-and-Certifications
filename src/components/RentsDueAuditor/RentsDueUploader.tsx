import React from 'react';
import { Upload, FileText, RefreshCw } from 'lucide-react';

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
  loadDemoData
}: RentsDueUploaderProps) {
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
              className="form-control resize-none text-xs font-mono bg-[rgba(11,15,25,0.4)]"
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
            <div className="col-span-full p-md bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.25)] rounded-xl text-xs text-[#fca5a5]">
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
