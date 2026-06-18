import { useState, useRef } from 'react';
import { X, Check, AlertCircle, FileText, Camera } from 'lucide-react';
import { parseScheduleImage } from '../services/ai';

// standard department/zone mapping helper
const normalizeZone = (rawZone) => {
  if (!rawZone) return 'Computing';
  const clean = rawZone.toLowerCase().trim();
  if (clean.includes('comp') || clean.includes('pc') || clean.includes('laptop') || clean.includes('sales')) return 'Computing';
  if (clean.includes('mob') || clean.includes('phone') || clean.includes('wireless') || clean.includes('mobile')) return 'Mobile';
  if (clean.includes('theat') || clean.includes('tv') || clean.includes('audio') || clean.includes('ht') || clean.includes('home')) return 'Home Theatre';
  if (clean.includes('front') || clean.includes('cash') || clean.includes('cs') || clean.includes('checkout') || clean.includes('customer') || clean.includes('ops') || clean.includes('register')) return 'Front End';
  if (clean.includes('gs') || clean.includes('geek') || clean.includes('squad') || clean.includes('serv')) return 'Geek Squad';
  if (clean.includes('app') || clean.includes('fridge') || clean.includes('wash')) return 'Appliances';
  return 'Computing'; // default fallback
};

// Fuzzy match name string to active roster list
const fuzzyMatchName = (nameStr, roster) => {
  if (!nameStr) return null;
  const cleanStr = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  const target = cleanStr(nameStr);
  if (!target) return null;

  // 1. Exact match
  let match = roster.find(emp => cleanStr(emp.name) === target);
  if (match) return match;

  // 2. Contains match
  const candidates = roster.filter(emp => {
    const empName = cleanStr(emp.name);
    return empName.includes(target) || target.includes(empName);
  });
  if (candidates.length === 1) return candidates[0];

  // 3. Token overlap match (e.g. "James H" matches "James Hathcock")
  const targetTokens = target.split(/\s+/);
  const bestMatch = roster.map(emp => {
    const empName = cleanStr(emp.name);
    const empTokens = empName.split(/\s+/);
    let score = 0;
    targetTokens.forEach(t => {
      if (empTokens.some(et => et.startsWith(t) || t.startsWith(et))) {
        score++;
      }
    });
    return { emp, score: score / Math.max(targetTokens.length, empTokens.length) };
  }).filter(res => res.score > 0.4)
    .sort((a, b) => b.score - a.score)[0];

  return bestMatch ? bestMatch.emp : null;
};

// Shift time parser
const parseShiftHours = (shiftStr) => {
  if (!shiftStr) return { duration: 0, startTimeStr: '9:00 AM' };
  
  // Clean string and split by separators
  const parts = shiftStr.split(/[-—to]/).map(p => p.trim());
  if (parts.length < 2) return { duration: 0, startTimeStr: '9:00 AM' };

  const toMinutes = (timeStr) => {
    const match = timeStr.match(/(\d+):?(\d+)?\s*(AM|PM|am|pm)?/i);
    if (!match) return null;
    let h = parseInt(match[1], 10);
    let m = match[2] ? parseInt(match[2], 10) : 0;
    let ampm = match[3] ? match[3].toUpperCase() : '';

    if (!ampm) {
      // Guess PM for typical retail afternoon hours if not specified
      if (h >= 1 && h <= 7) ampm = 'PM';
      else if (h >= 8 && h <= 11) ampm = 'AM';
      else if (h === 12) ampm = 'PM';
      else ampm = 'PM';
    }

    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  const startMin = toMinutes(parts[0]);
  let endMin = toMinutes(parts[1]);

  if (startMin === null || endMin === null) {
    return { duration: 0, startTimeStr: '9:00 AM' };
  }

  if (endMin < startMin) {
    endMin += 24 * 60; // crossover midnight
  }

  const duration = (endMin - startMin) / 60;

  const formatMins = (totalMins) => {
    let h = Math.floor(totalMins / 60) % 24;
    let m = totalMins % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    const pad = m < 10 ? '0' : '';
    return `${h}:${pad}${m} ${ampm}`;
  };

  return {
    duration,
    startTimeStr: formatMins(startMin)
  };
};

// Auto-generate break list based on shift duration
const generateBreaks = (empId, empName, startTimeStr, durationHours) => {
  if (durationHours < 4 || !empId) return [];

  const parseToMins = (tStr) => {
    const [hm, ampm] = tStr.split(' ');
    let [h, m] = hm.split(':').map(Number);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  const formatMins = (totalMins) => {
    let h = Math.floor(totalMins / 60) % 24;
    let m = totalMins % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    const pad = m < 10 ? '0' : '';
    return `${h}:${pad}${m} ${ampm}`;
  };

  const startMins = parseToMins(startTimeStr);
  const breaks = [];
  const baseTime = Date.now();

  if (durationHours >= 7.5) {
    // Two 15m breaks and a 30m lunch
    breaks.push({
      id: `break_${empId}_1_${baseTime}`,
      empId,
      name: empName,
      time: formatMins(startMins + 120), // 2 hours in
      type: '15 min Break',
      completed: false
    });
    breaks.push({
      id: `lunch_${empId}_${baseTime}`,
      empId,
      name: empName,
      time: formatMins(startMins + 240), // 4 hours in
      type: '30 min Lunch',
      completed: false
    });
    breaks.push({
      id: `break_${empId}_2_${baseTime}`,
      empId,
      name: empName,
      time: formatMins(startMins + 360), // 6 hours in
      type: '15 min Break',
      completed: false
    });
  } else if (durationHours >= 5.5) {
    // One 30m lunch
    breaks.push({
      id: `lunch_${empId}_${baseTime}`,
      empId,
      name: empName,
      time: formatMins(startMins + 210), // 3.5 hours in
      type: '30 min Lunch',
      completed: false
    });
  } else if (durationHours >= 4.0) {
    // One 15m break
    breaks.push({
      id: `break_${empId}_1_${baseTime}`,
      empId,
      name: empName,
      time: formatMins(startMins + 120), // 2 hours in
      type: '15 min Break',
      completed: false
    });
  }
  return breaks;
};

const WEEKDAY_KEYS = ['mon', 'monday', 'tue', 'tuesday', 'wed', 'wednesday', 'thu', 'thursday', 'fri', 'friday', 'sat', 'saturday', 'sun', 'sunday'];

export default function ImportScheduleModal({ isOpen, onClose, roster = [], onImportConfirm, apiKey, onAddEmployee }) {
  const [activeTab, setActiveTab] = useState('image'); // 'image' | 'csv'
  const [isParsing, setIsParsing] = useState(false);
  const [parsedItems, setParsedItems] = useState([]); // Array of raw extracted rows
  const [reviews, setReviews] = useState([]); // Array of resolved objects
  const [fileName, setFileName] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  
  // CSV specific states
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvDataRows, setCsvDataRows] = useState([]);
  const [csvMappings, setCsvMappings] = useState({ name: 0, shift: 1, zone: 2 });
  const [isWeeklyCsv, setIsWeeklyCsv] = useState(false);
  const [selectedDayColumn, setSelectedDayColumn] = useState('');

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Handle image upload and trigger OCR parsing
  const handleImageFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Error: Please upload a valid image file (.png, .jpg, .jpeg).');
      return;
    }
    setErrorMsg('');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Url = e.target.result;

      
      const base64Data = base64Url.split(',')[1];
      const mimeType = file.type;

      if (apiKey && apiKey.trim().length > 10) {
        // Run actual Gemini OCR Vision
        runOcrParsing(base64Data, mimeType);
      } else {
        // Graceful simulation notice
        setErrorMsg('Note: No active Gemini API Key found. You can click "Try Demo Image Parse" below to test this flow with sample schedule data.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Call Gemini Vision to extract schedule data
  const runOcrParsing = async (base64Data, mimeType) => {
    setIsParsing(true);
    setErrorMsg('');
    try {
      const data = await parseScheduleImage(base64Data, mimeType, apiKey);
      if (Array.isArray(data)) {
        setParsedItems(data);
        generateReviewList(data);
      } else {
        throw new Error('Parsed result was not a JSON array.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to parse schedule image. Please verify your Gemini API key or try the CSV loader instead.');
    } finally {
      setIsParsing(false);
    }
  };

  // Run a mock visual parse for demo/testing
  const runDemoParse = () => {
    setIsParsing(true);
    setErrorMsg('');
    
    // Simulate API delay
    setTimeout(() => {
      const mockExtracted = [
        { name: 'Ricky', shift: '9:00 AM - 5:30 PM', zone: 'General Sales' },
        { name: 'Julianna', shift: '10:00 AM - 6:30 PM', zone: 'PC / Computing' },
        { name: 'Yinel', shift: '12:00 PM - 8:30 PM', zone: 'Checkout' },
        { name: 'Muntarin', shift: '1:00 PM - 9:30 PM', zone: 'Home Theater' },
        { name: 'Daniel', shift: '2:00 PM - 8:00 PM', zone: 'Mobile' },
        { name: 'Paulie', shift: '9:00 AM - 1:00 PM', zone: 'Appliances' }
      ];
      setParsedItems(mockExtracted);
      generateReviewList(mockExtracted);
      setIsParsing(false);
    }, 1500);
  };

  // Handle CSV file processing
  const handleCsvFile = (file) => {
    if (!file.name.endsWith('.csv')) {
      setErrorMsg('Error: Please upload a valid CSV file (.csv).');
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
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) {
      setErrorMsg('Error: CSV file must contain a header row and at least one data row.');
      return;
    }

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

    const headers = parseCSVLine(lines[0]);
    const dataRows = lines.slice(1).map(line => parseCSVLine(line));

    setCsvHeaders(headers);
    setCsvDataRows(dataRows);

    // Check if it is a weekly CSV sheet (with day headers)
    const dayCols = headers.filter(h => WEEKDAY_KEYS.includes(h.toLowerCase()));
    
    if (dayCols.length >= 3) {
      // We found days of week - it's a Weekly Calendar CSV!
      setIsWeeklyCsv(true);
      // Auto-detect current weekday to default select it
      const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const matchedCol = headers.find(h => h.toLowerCase() === currentDayName || h.toLowerCase() === currentDayName.slice(0, 3));
      setSelectedDayColumn(matchedCol || headers.find(h => WEEKDAY_KEYS.includes(h.toLowerCase())));
    } else {
      // Standard Daily CSV List
      setIsWeeklyCsv(false);
      // Guess columns index
      const nameIdx = headers.findIndex(h => h.toLowerCase().includes('name') || h.toLowerCase().includes('employee'));
      const shiftIdx = headers.findIndex(h => h.toLowerCase().includes('shift') || h.toLowerCase().includes('time') || h.toLowerCase().includes('hour'));
      const zoneIdx = headers.findIndex(h => h.toLowerCase().includes('zone') || h.toLowerCase().includes('dept') || h.toLowerCase().includes('area'));
      
      setCsvMappings({
        name: nameIdx !== -1 ? nameIdx : 0,
        shift: shiftIdx !== -1 ? shiftIdx : 1,
        zone: zoneIdx !== -1 ? zoneIdx : 2
      });
    }
  };

  // Convert CSV parsed data rows to list of review records
  const generatePreviewFromCsv = () => {
    let items = [];

    if (isWeeklyCsv) {
      // Weekly Calendar structure (Name column + Day Shift column)
      const nameColIdx = csvHeaders.findIndex(h => h.toLowerCase().includes('name') || h.toLowerCase().includes('employee') || h.toLowerCase() === 'associate');
      const nameIdx = nameColIdx !== -1 ? nameColIdx : 0;
      const dayColIdx = csvHeaders.indexOf(selectedDayColumn);

      if (dayColIdx === -1) {
        setErrorMsg('Please select a valid weekday column.');
        return;
      }

      csvDataRows.forEach(row => {
        const empName = row[nameIdx];
        const shiftStr = row[dayColIdx];
        
        // Skip off days
        if (empName && shiftStr && shiftStr.toLowerCase() !== 'off' && shiftStr.trim() !== '') {
          // Attempt to map department based on the store roster if employee already exists
          const existingEmp = roster.find(r => r.name.toLowerCase().includes(empName.toLowerCase()));
          const guessedZone = existingEmp ? existingEmp.dept : 'Computing';

          items.push({
            name: empName,
            shift: shiftStr,
            zone: guessedZone
          });
        }
      });
    } else {
      // Daily CSV structure (direct row map)
      csvDataRows.forEach(row => {
        const empName = row[csvMappings.name];
        const shiftStr = row[csvMappings.shift];
        const deptStr = csvMappings.zone !== -1 ? row[csvMappings.zone] : '';
        
        if (empName && shiftStr) {
          items.push({
            name: empName,
            shift: shiftStr,
            zone: deptStr
          });
        }
      });
    }

    if (items.length === 0) {
      setErrorMsg('No schedule records found. Verify headers and column values.');
      return;
    }

    setParsedItems(items);
    generateReviewList(items);
  };

  // Build the editable validation reviews list from raw parsed inputs
  const generateReviewList = (rawItems) => {
    const list = rawItems.map((item, idx) => {
      // Fuzzy match against active roster
      const matchedEmp = fuzzyMatchName(item.name, roster);
      const shiftDetails = parseShiftHours(item.shift);
      const finalZone = normalizeZone(item.zone);

      return {
        id: `review_${idx}`,
        originalName: item.name,
        originalShift: item.shift,
        matchedEmpId: matchedEmp ? matchedEmp.id : '', // empty means unmatched/ignore
        assignedZone: finalZone,
        startTimeStr: shiftDetails.startTimeStr,
        durationHours: shiftDetails.duration
      };
    });
    setReviews(list);
  };

  // Handle matching updates in validation grid
  const handleMatchChange = (reviewId, selectedId) => {
    setReviews(prev => prev.map(rev => {
      if (rev.id === reviewId) {
        return { ...rev, matchedEmpId: selectedId };
      }
      return rev;
    }));
  };

  // Handle zone mapping override
  const handleZoneChange = (reviewId, zoneName) => {
    setReviews(prev => prev.map(rev => {
      if (rev.id === reviewId) {
        return { ...rev, assignedZone: zoneName };
      }
      return rev;
    }));
  };

  // Handle shift string manual edit
  const handleShiftTimeChange = (reviewId, newShiftTime) => {
    setReviews(prev => prev.map(rev => {
      if (rev.id === reviewId) {
        const shiftDetails = parseShiftHours(newShiftTime);
        return { 
          ...rev, 
          originalShift: newShiftTime,
          startTimeStr: shiftDetails.startTimeStr,
          durationHours: shiftDetails.duration
        };
      }
      return rev;
    }));
  };

  // Confirm schedule insertion
  const handleConfirmImport = () => {
    const activeReviews = reviews.filter(rev => rev.matchedEmpId !== '');
    if (activeReviews.length === 0) {
      alert('Please match at least one associate before importing.');
      return;
    }

    // 1. Build zone assignments
    const finalZoneAssignments = {
      'Computing': [],
      'Mobile': [],
      'Home Theatre': [],
      'Front End': [],
      'Geek Squad': [],
      'Appliances': []
    };

    // 2. Build break events
    const finalBreakSchedule = [];

    activeReviews.forEach(rev => {
      let empId;
      let empName;

      if (rev.matchedEmpId === 'create_new') {
        // Create new employee dynamically with unique ID and default parameters
        const newId = `emp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const newEmp = {
          id: newId,
          name: rev.originalName.trim(),
          dept: rev.assignedZone,
          hours: parseFloat(rev.durationHours) || 8.0,
          memberships: 0,
          creditCards: 0,
          warranty: 0.0,
          surveys: 5.0,
          rph: 600,
          gap: 'None'
        };
        if (onAddEmployee) {
          onAddEmployee(newEmp);
        }
        empId = newId;
        empName = newEmp.name;
      } else {
        const emp = roster.find(e => e.id === rev.matchedEmpId);
        if (!emp) return;
        empId = emp.id;
        empName = emp.name;
      }

      // Assign to zone
      if (finalZoneAssignments[rev.assignedZone]) {
        finalZoneAssignments[rev.assignedZone].push(empId);
      }

      // Generate breaks & lunches
      const calculatedBreaks = generateBreaks(empId, empName, rev.startTimeStr, rev.durationHours);
      finalBreakSchedule.push(...calculatedBreaks);
    });

    onImportConfirm({
      zoneAssignments: finalZoneAssignments,
      breakSchedule: finalBreakSchedule
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '980px', background: '#0e1220', padding: 0 }} onClick={(e) => e.stopPropagation()}>
        
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
                      onChange={(e) => e.target.files[0] && handleImageFile(e.target.files[0])} 
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
                      onChange={(e) => e.target.files[0] && handleCsvFile(e.target.files[0])} 
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
                            onChange={(e) => setSelectedDayColumn(e.target.value)}
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
                              onChange={(e) => setCsvMappings({ ...csvMappings, name: parseInt(e.target.value) })}
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
                              onChange={(e) => setCsvMappings({ ...csvMappings, shift: parseInt(e.target.value) })}
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
                              onChange={(e) => setCsvMappings({ ...csvMappings, zone: parseInt(e.target.value) })}
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
                        <tr 
                          key={rev.id} 
                          style={{ 
                            borderBottom: '1px solid rgba(255,255,255,0.02)',
                            background: rev.matchedEmpId === 'create_new' ? 'rgba(6, 182, 212, 0.03)' : !matched ? 'rgba(239, 68, 68, 0.02)' : 'transparent'
                          }}
                        >
                          {/* Raw Name */}
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>
                            {rev.originalName}
                          </td>

                          {/* Raw Shift */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <input 
                              type="text" 
                              className="form-control"
                              style={{ width: '150px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', background: '#0e1220', margin: 0 }}
                              value={rev.originalShift}
                              onChange={(e) => handleShiftTimeChange(rev.id, e.target.value)}
                            />
                          </td>

                          {/* Roster Match Selector */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <select
                              className="form-control"
                              style={{ 
                                fontSize: '0.75rem', 
                                padding: '0.2rem 0.5rem', 
                                background: rev.matchedEmpId === 'create_new' ? 'rgba(6, 182, 212, 0.15)' : matched ? '#0e1220' : 'rgba(239, 68, 68, 0.1)',
                                borderColor: rev.matchedEmpId === 'create_new' ? 'var(--info)' : matched ? 'var(--border-glass)' : 'var(--error)',
                                color: rev.matchedEmpId === 'create_new' ? 'var(--info)' : matched ? '#fff' : 'var(--error)',
                                margin: 0,
                                height: '30px'
                              }}
                              value={rev.matchedEmpId}
                              onChange={(e) => handleMatchChange(rev.id, e.target.value)}
                            >
                              <option value="">-- Unmatched (Ignore) --</option>
                              <option value="create_new" style={{ color: 'var(--info)', fontWeight: 'bold' }}>[+] Add as New Associate</option>
                              {roster.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept})</option>
                              ))}
                            </select>
                          </td>

                          {/* Zone Assignment Override */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <select
                              className="form-control"
                              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#0e1220', margin: 0, height: '30px' }}
                              value={rev.assignedZone}
                              onChange={(e) => handleZoneChange(rev.id, e.target.value)}
                            >
                              {['Computing', 'Mobile', 'Home Theatre', 'Front End', 'Geek Squad', 'Appliances'].map(z => (
                                <option key={z} value={z}>{z}</option>
                              ))}
                            </select>
                          </td>

                          {/* Auto Break Math Info */}
                          <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                            {matched ? (
                              breaks.length === 0 ? (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No breaks (&lt;4h)</span>
                              ) : (
                                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                  {breaks.map((b, i) => (
                                    <span key={i} style={{ padding: '0.15rem 0.35rem', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', fontSize: '0.65rem', border: '1px solid rgba(255,255,255,0.05)' }} title={b.type}>
                                      {b.time} ({b.type.includes('15') ? '15m' : '30m'})
                                    </span>
                                  ))}
                                </div>
                              )
                            ) : (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>—</span>
                            )}
                          </td>
                        </tr>
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
