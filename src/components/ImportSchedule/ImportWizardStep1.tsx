import React from 'react';
import { FileText, Camera } from 'lucide-react';
import { WEEKDAY_KEYS } from '../../utils/scheduleParserUtils';

export interface CsvMappings {
  name: number;
  shift: number;
  zone: number;
}

export interface ImportWizardStep1Props {
  activeTab: string;
  fileName: string;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleImageFile: (file: File) => void;
  handleCsvFile: (file: File) => void;
  isWeeklyCsv: boolean;
  csvHeaders?: string[];
  selectedDayColumn: string;
  setSelectedDayColumn: (val: string) => void;
  csvMappings: CsvMappings;
  setCsvMappings: (mappings: CsvMappings) => void;
  generatePreviewFromCsv: () => void;
  runDemoParse: () => void;
  isProcessing?: boolean;
}

export default function ImportWizardStep1({
  activeTab,
  fileName,
  fileInputRef,
  handleImageFile,
  handleCsvFile,
  isWeeklyCsv,
  csvHeaders = [],
  selectedDayColumn,
  setSelectedDayColumn,
  csvMappings,
  setCsvMappings,
  generatePreviewFromCsv,
  runDemoParse,
  isProcessing = false
}: ImportWizardStep1Props) {
  return (
    <div>
      {activeTab === 'image' ? (
        // Screenshot Import View
        <div className="flex-column gap-xl">
          <div 
            className="border-2-dashed-glass rounded-2xl p-3rem-2rem text-center bg-white-alpha-01 cursor-pointer transition-all hover-bg-white-alpha-05"
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            data-testid="image-dropzone"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleImageFile(e.target.files[0]);
                }
              }} 
              accept="image/*" 
              className="hidden" 
              disabled={isProcessing}
            />
            <div className="bg-bby-blue-alpha-08 w-64px h-64px rounded-full flex-center justify-center mx-auto mb-xl">
              <Camera size={32} color="var(--info)" />
            </div>
            <h4 className="text-lg mb-sm text-white">Drag & Drop Schedule Screenshot</h4>
            <p className="text-secondary text-sm">
              Supports JPEG, PNG daily scheduling printout snapshots.
            </p>
          </div>
          
          <div className="flex-center justify-center">
            <button 
              className="btn btn-secondary cursor-pointer" 
              onClick={runDemoParse}
              disabled={isProcessing}
              data-testid="demo-image-parse-btn"
            >
              ⚡ Try Demo Image Parse
            </button>
          </div>
        </div>
      ) : (
        // CSV Import View
        <div className="flex-column gap-xl">
          <div 
            className="border-2-dashed-glass rounded-2xl p-3rem-2rem text-center bg-white-alpha-01 cursor-pointer transition-all hover-bg-white-alpha-05"
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            data-testid="csv-dropzone"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleCsvFile(e.target.files[0]);
                }
              }} 
              accept=".csv" 
              className="hidden" 
              disabled={isProcessing}
            />
            <div className="bg-bby-blue-alpha-08 w-64px h-64px rounded-full flex-center justify-center mx-auto mb-xl">
              <FileText size={32} color="var(--info)" />
            </div>
            <h4 className="text-lg mb-sm text-white">Drag & Drop Schedule CSV</h4>
            <p className="text-secondary text-sm">
              Supports Weekly Calendar sheets or Daily list sheets.
            </p>
          </div>

          {(csvHeaders?.length ?? 0) > 0 && (
            <div className="glass-card p-xl border-glass flex-column gap-lg">
              <h4 className="text-md m-0 text-white">Configure CSV Columns ({fileName})</h4>
              
              {isWeeklyCsv ? (
                <div className="flex-column gap-sm max-w-320">
                  <label className="text-xs text-secondary">Select Day to Import:</label>
                  <select 
                    className="form-control bg-obsidian" 
                    value={selectedDayColumn}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDayColumn(e.target.value)}
                    disabled={isProcessing}
                    data-testid="day-column-select"
                  >
                    {csvHeaders.filter(h => h && WEEKDAY_KEYS.includes(h.toLowerCase())).map((h, i) => (
                      <option key={i} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-auto-fit-200 gap-md">
                  <div className="flex-column gap-xs">
                    <label className="text-xs text-secondary">Name Column:</label>
                    <select 
                      className="form-control bg-obsidian" 
                      value={csvMappings.name} 
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCsvMappings({ ...csvMappings, name: parseInt(e.target.value) })}
                      disabled={isProcessing}
                      data-testid="name-column-select"
                    >
                      {csvHeaders.map((h, i) => (
                        <option key={i} value={i}>Col {i + 1}: {h}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex-column gap-xs">
                    <label className="text-xs text-secondary">Shift Column:</label>
                    <select 
                      className="form-control bg-obsidian" 
                      value={csvMappings.shift} 
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCsvMappings({ ...csvMappings, shift: parseInt(e.target.value) })}
                      disabled={isProcessing}
                      data-testid="shift-column-select"
                    >
                      {csvHeaders.map((h, i) => (
                        <option key={i} value={i}>Col {i + 1}: {h}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-column gap-xs">
                    <label className="text-xs text-secondary">Zone/Dept Column:</label>
                    <select 
                      className="form-control bg-obsidian" 
                      value={csvMappings.zone} 
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCsvMappings({ ...csvMappings, zone: parseInt(e.target.value) })}
                      disabled={isProcessing}
                      data-testid="zone-column-select"
                    >
                      <option value={-1}>-- Default Zone --</option>
                      {csvHeaders.map((h, i) => (
                        <option key={i} value={i}>Col {i + 1}: {h}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <button 
                className="btn btn-primary self-end py-sm px-xl cursor-pointer" 
                onClick={generatePreviewFromCsv}
                disabled={isProcessing}
                data-testid="analyze-csv-btn"
              >
                Analyze CSV Data
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
