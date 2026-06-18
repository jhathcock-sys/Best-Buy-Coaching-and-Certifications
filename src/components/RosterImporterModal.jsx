import { useState, useRef } from 'react';
import { Upload, X, Check, AlertCircle, FileText, ChevronRight } from 'lucide-react';

const FUZZY_MAP = {
  name: ['name', 'associate', 'employee', 'staff', 'member', 'associate name'],
  employeeNumber: ['employee number', 'emp #', 'id', 'employee id', 'associate number', 'associate id', 'badge', 'a id'],
  department: ['dept', 'department', 'area', 'role', 'business group'],
  hours: ['hours', 'hrs', 'scheduled hours', 'hours worked', 'hours count', 'scheduled'],
  memberships: ['memberships', 'pm', 'plus/total', 'total', 'plus', 'pm attach', 'membership%', 'membership attach'],
  creditCards: ['creditcards', 'cards', 'bby card', 'bp', 'apps', 'bp apps', 'credit card apps', 'bp apps count'],
  warranty: ['warranty', 'gsp', 'applecare', 'protection', 'gsp attach', 'protection%', 'gsp%'],
  surveys: ['surveys', '5 star', 'nps', 'csat', 'survey', 'survey rating', 'rating', 'surveys count'],
  rph: ['rph', 'revenue', 'rev per hour', 'sales/hour', 'revenue/hour', 'sales per hour'],
  basket: ['basket', 'basket size', 'average basket', 'basket$', 'avg basket', 'basket total'],
  m365: ['m365', 'microsoft 365', 'office 365', 'm365 attach', 'office attach', 'm365%', 'microsoft attach'],
  audio: ['audio', 'audio attach', 'audio%', 'audio attach%', 'sound attach', 'ht audio']
};

export default function RosterImporterModal({ isOpen, onClose, onImport }) {
  const [csvData, setCsvData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [mappings, setMappings] = useState({});
  const [parsedRows, setParsedRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleFile = (file) => {
    if (!file.name.endsWith('.csv')) {
      setErrorMsg("Error: Please upload a valid CSV file (.csv). Excel files can be saved as CSV in one click!");
      return;
    }
    setErrorMsg('');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      parseCSVText(text);
    };
    reader.readAsText(file);
  };

  const parseCSVText = (text) => {
    // Split by lines, ignoring empty lines
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) {
      setErrorMsg("Error: The CSV file must contain a header row and at least one data row.");
      return;
    }

    // Parse CSV line helper (handles quoted commas correctly)
    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const parsedHeaders = parseCSVLine(lines[0]);
    setHeaders(parsedHeaders);
    setCsvData(lines.slice(1).map(line => parseCSVLine(line)));

    // Generate initial intelligent mappings
    const initialMappings = {};
    Object.keys(FUZZY_MAP).forEach(key => {
      const matchIndex = parsedHeaders.findIndex(header => {
        const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
        return FUZZY_MAP[key].some(term => {
          const normalizedTerm = term.toLowerCase().replace(/[^a-z0-9]/g, '');
          return normalizedHeader.includes(normalizedTerm) || normalizedTerm.includes(normalizedHeader);
        });
      });

      if (matchIndex !== -1) {
        initialMappings[key] = matchIndex;
      } else {
        // Fallback matching
        if (key === 'name' && parsedHeaders[0]) initialMappings.name = 0;
        else if (key === 'department' && parsedHeaders[1]) initialMappings.department = 1;
        else initialMappings[key] = -1; // Unmapped
      }
    });

    setMappings(initialMappings);
    generatePreview(lines.slice(1).map(line => parseCSVLine(line)), initialMappings);
  };

  const handleMappingChange = (key, index) => {
    const newMappings = { ...mappings, [key]: index };
    setMappings(newMappings);
    generatePreview(csvData, newMappings);
  };

  const generatePreview = (rows, currentMappings) => {
    const list = rows.map(row => {
      const parsedDept = currentMappings.department !== -1 && row[currentMappings.department] ? normalizeDept(row[currentMappings.department]) : 'General Sales';
      const emp = {
        name: currentMappings.name !== -1 && row[currentMappings.name] ? row[currentMappings.name] : 'Unknown Name',
        employeeNumber: currentMappings.employeeNumber !== -1 && row[currentMappings.employeeNumber] ? row[currentMappings.employeeNumber] : '',
        dept: parsedDept,
        hours: currentMappings.hours !== -1 && row[currentMappings.hours] ? Math.max(0, parseFloat(row[currentMappings.hours])) || 0 : 0,
        memberships: currentMappings.memberships !== -1 && row[currentMappings.memberships] ? Math.max(0, parseFloat(row[currentMappings.memberships].replace(/[^0-9.]/g, ''))) || 0 : 0,
        creditCards: currentMappings.creditCards !== -1 && row[currentMappings.creditCards] ? Math.max(0, parseInt(row[currentMappings.creditCards].replace(/[^0-9]/g, ''), 10)) || 0 : 0,
        warranty: currentMappings.warranty !== -1 && row[currentMappings.warranty] ? Math.max(0, parseFloat(row[currentMappings.warranty].replace(/[^0-9.]/g, ''))) || 0 : 0,
        surveys: currentMappings.surveys !== -1 && row[currentMappings.surveys] ? Math.max(1.0, Math.min(5.0, parseFloat(row[currentMappings.surveys].replace(/[^0-9.]/g, '')))) || 5.0 : 5.0,
        rph: currentMappings.rph !== -1 && row[currentMappings.rph] ? Math.max(0, parseFloat(row[currentMappings.rph].replace(/[^0-9.]/g, ''))) || 0 : 0,
        basket: (parsedDept === 'Computing' || parsedDept === 'Home Theatre') && currentMappings.basket !== -1 && row[currentMappings.basket] ? Math.max(0, parseFloat(row[currentMappings.basket].replace(/[^0-9.]/g, ''))) || 0 : 0,
        m365: parsedDept === 'Computing' && currentMappings.m365 !== -1 && row[currentMappings.m365] ? Math.max(0, parseFloat(row[currentMappings.m365].replace(/[^0-9.]/g, ''))) || 0 : 0,
        audio: parsedDept === 'Home Theatre' && currentMappings.audio !== -1 && row[currentMappings.audio] ? Math.max(0, parseFloat(row[currentMappings.audio].replace(/[^0-9.]/g, ''))) || 0 : 0,
        opportunityGap: ''
      };
      return emp;
    });
    setParsedRows(list);
  };

  const normalizeDept = (raw) => {
    if (!raw) return 'General Sales';
    const clean = raw.toLowerCase().trim();
    if (clean.includes('comp') || clean.includes('pc') || clean.includes('laptop')) return 'Computing';
    if (clean.includes('theat') || clean.includes('tv') || clean.includes('audio') || clean.includes('ht')) return 'Home Theatre';
    if (clean.includes('mob') || clean.includes('phone') || clean.includes('wireless')) return 'Mobile';
    if (clean.includes('app') || clean.includes('fridge') || clean.includes('wash')) return 'Appliances';
    if (clean.includes('gs') || clean.includes('geek') || clean.includes('serv')) return 'Geek Squad';
    if (clean.includes('front') || clean.includes('cash') || clean.includes('cs') || clean.includes('checkout')) return 'Front End';
    return 'General Sales';
  };

  const handleSaveImport = () => {
    if (parsedRows.length === 0) return;
    onImport(parsedRows);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '950px', background: '#0e1220' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload color="var(--bby-yellow)" size={20} /> Bulk Roster CSV Importer
          </h3>
          <button className="btn btn-secondary btn-icon" style={{ padding: '0.4rem' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
          
          {errorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '1rem', borderRadius: '12px', color: '#fca5a5', display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Step 1: File Drop Zone */}
          {!csvData ? (
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
          ) : (
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
                      {key.replace(/([A-Z])/g, ' $1')}:
                    </label>
                    <select
                      className="form-control"
                      style={{ fontSize: '0.8rem', height: '36px', background: '#0e1220' }}
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

              {/* Step 3: Preview list */}
              <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Data Preview Summary</h4>
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-glass)', borderRadius: '12px', maxHeight: '250px', background: 'rgba(0,0,0,0.2)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(16, 24, 48, 0.9)', borderBottom: '1px solid var(--border-glass)' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Department</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Hours</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Memberships</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>BBY Cards</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>GSP Attach</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>5 Star</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>RPH</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Basket ($)</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Dept Attach</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#fff' }}>{row.name}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                            {row.dept}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{row.hours}h</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{row.memberships}%</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{row.creditCards} Apps</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{row.warranty}%</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{row.surveys.toFixed(1)}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>${row.rph}/hr</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{(row.dept === 'Computing' || row.dept === 'Home Theatre') ? `$${parseFloat(row.basket || 0).toFixed(2)}` : '—'}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{row.dept === 'Computing' ? `${row.m365 || 0}% M365` : row.dept === 'Home Theatre' ? `${row.audio || 0}% Audio` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          
          {csvData && (
            <button 
              className="btn btn-accent" 
              style={{ color: '#000', display: 'flex', alignItems: 'center', gap: '0.35rem' }} 
              onClick={handleSaveImport}
            >
              <Check size={16} /> Import {parsedRows.length} Associates
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
