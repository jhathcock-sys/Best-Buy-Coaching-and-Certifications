import { useRef } from 'react';
import { Upload, X, Check, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import { useRosterImporter, FUZZY_MAP } from './RosterImporter/useRosterImporter';

export default function RosterImporterModal({ isOpen, onClose, onImport }: { isOpen: boolean, onClose: () => void, onImport: (rows: any[]) => void }) {
  const {
    csvData,
    headers,
    mappings,
    parsedRows,
    fileName,
    errorMsg,
    handleFile,
    handleMappingChange,
    reset
  } = useRosterImporter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleSaveImport = () => {
    if (parsedRows.length === 0) return;
    onImport(parsedRows);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal-content glass-card max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header flex-between p-lg border-b border-glass">
          <h3 className="m-0 flex-center gap-sm font-bold text-primary">
            <Upload className="text-bby-yellow w-5 h-5" /> Bulk Roster CSV Importer
          </h3>
          <button className="btn btn-secondary p-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="p-xl overflow-y-auto" style={{ maxHeight: '70vh' }}>
          
          {errorMsg && (
            <div className="bg-error-alpha border border-error rounded-xl p-md flex gap-sm mb-lg text-error">
              <AlertCircle size={18} className="flex-shrink-0" />
              <div className="text-sm">{errorMsg}</div>
            </div>
          )}

          {!csvData ? (
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-dashed border-2 border-glass rounded-xl p-xl flex-column align-center text-center cursor-pointer hover-scale bg-white-alpha-05 transition-normal"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".csv" className="hidden" style={{ display: 'none' }} />
              <div className="w-16 h-16 rounded-full bg-bby-blue-alpha-20 flex-center mb-lg">
                <Upload size={32} className="text-info" />
              </div>
              <h4 className="text-lg font-bold mb-sm text-primary">Drag & Drop CSV File here</h4>
              <p className="text-sm text-secondary mb-xl">
                or click to browse your files. Excel/Google Sheets files should be exported/saved as **.csv** first.
              </p>
              <div className="inline-flex align-center gap-sm bg-white-alpha-10 px-md py-sm rounded-lg text-xs text-muted">
                <FileText size={14} /> Expected Columns: Name, Department, Hours, Memberships, Cards, GSP, Surveys, RPH, Basket, M365 Attach, Audio Attach
              </div>
            </div>
          ) : (
            <div>
              <div className="flex-between align-center bg-white-alpha-05 p-md rounded-xl border-glass mb-xl">
                <div className="flex-center gap-sm">
                  <FileText size={18} className="text-bby-yellow" />
                  <span className="text-sm font-semibold text-primary">{fileName}</span>
                  <span className="text-xs text-muted">({csvData.length} records found)</span>
                </div>
                <button className="btn btn-secondary text-xs py-sm" onClick={reset}>
                  Change File
                </button>
              </div>

              <h4 className="text-base font-bold mb-sm flex-center justify-start gap-xs text-primary">
                Verify CSV Column Mapping <ChevronRight size={16} />
              </h4>
              <p className="text-xs text-secondary mb-lg">
                Our system automatically matched your spreadsheet columns. Verify below that each field aligns with the correct app parameter.
              </p>

              <div className="dashboard-grid bg-white-alpha-05 p-lg rounded-xl border-glass mb-xl" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                {Object.keys(FUZZY_MAP).map(key => (
                  <div key={key} className="flex-column gap-xs">
                    <label className="text-xs font-semibold text-secondary capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}:
                    </label>
                    <select
                      className="bby-select text-sm p-sm bg-obsidian border-glass text-primary rounded-lg"
                      value={mappings[key]}
                      onChange={(e) => handleMappingChange(key, parseInt(e.target.value, 10))}
                    >
                      <option value={-1}>-- Ignore / Default to 0 --</option>
                      {headers.map((header, idx) => (
                        <option key={idx} value={idx}>Column {idx + 1}: {header}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <h4 className="text-base font-bold mb-sm text-primary">Data Preview Summary</h4>
              <div className="overflow-x-auto border-glass rounded-xl bg-black-alpha-20" style={{ maxHeight: '250px' }}>
                <table className="w-full text-left text-sm" style={{ borderCollapse: 'collapse' }}>
                  <thead className="bg-bg-card border-b border-glass sticky top-0">
                    <tr>
                      <th className="p-md font-semibold text-secondary">Name</th>
                      <th className="p-md font-semibold text-secondary">Department</th>
                      <th className="p-md font-semibold text-secondary text-center">Hours</th>
                      <th className="p-md font-semibold text-secondary text-center">Memberships</th>
                      <th className="p-md font-semibold text-secondary text-center">BBY Cards</th>
                      <th className="p-md font-semibold text-secondary text-center">GSP Attach</th>
                      <th className="p-md font-semibold text-secondary text-center">5 Star</th>
                      <th className="p-md font-semibold text-secondary text-center">RPH</th>
                      <th className="p-md font-semibold text-secondary text-center">Basket ($)</th>
                      <th className="p-md font-semibold text-secondary text-center">Dept Attach</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className="border-b border-glass last:border-0 hover:bg-white-alpha-05">
                        <td className="p-md font-semibold text-primary">{row.name}</td>
                        <td className="p-md">
                          <span className="px-sm py-xs rounded-lg text-xs bg-white-alpha-05 border-glass">
                            {row.dept}
                          </span>
                        </td>
                        <td className="p-md text-center">{row.hours}h</td>
                        <td className="p-md text-center">{row.memberships}%</td>
                        <td className="p-md text-center">{row.creditCards} Apps</td>
                        <td className="p-md text-center">{row.warranty}%</td>
                        <td className="p-md text-center">{row.surveys.toFixed(1)}</td>
                        <td className="p-md text-center">${row.rph}/hr</td>
                        <td className="p-md text-center">{(row.dept === 'Computing' || row.dept === 'Home Theatre') ? `$${parseFloat(row.basket || 0).toFixed(2)}` : '—'}</td>
                        <td className="p-md text-center">{row.dept === 'Computing' ? `${row.m365 || 0}% M365` : row.dept === 'Home Theatre' ? `${row.audio || 0}% Audio` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        <div className="modal-footer flex-end gap-md p-lg border-t border-glass">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          
          {csvData && (
            <button className="btn btn-primary flex-center gap-sm bg-bby-yellow text-black hover:bg-bby-yellow-hover" onClick={handleSaveImport}>
              <Check size={16} /> Import {parsedRows.length} Associates
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
