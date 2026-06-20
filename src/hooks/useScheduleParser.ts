import { useState } from 'react';
import { normalizeZone, fuzzyMatchName, parseShiftHours, generateBreaks, WEEKDAY_KEYS } from '../utils/scheduleParserUtils';

export function useScheduleParser(roster, onImportConfirm, onClose, apiKey, onAddEmployee, isOpen) {
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

  

  // Handle image upload and trigger OCR parsing
  const handleImageFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Error: Please upload a valid image file (.png, .jpg, .jpeg).');
      return;
    }
    setErrorMsg('');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (e: any) => {
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
    reader.onload = (e: any) => {
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

  return {
    activeTab, setActiveTab,
    isParsing, setIsParsing,
    parsedItems, setParsedItems,
    reviews, setReviews,
    fileName, setFileName,
    errorMsg, setErrorMsg,
    csvHeaders, setCsvHeaders,
    csvDataRows, setCsvDataRows,
    csvMappings, setCsvMappings,
    isWeeklyCsv, setIsWeeklyCsv,
    selectedDayColumn, setSelectedDayColumn,
    fileInputRef,
    handleImageFile,
    handleCsvFile,
    handleMatchChange,
    handleZoneChange,
    handleShiftTimeChange,
    handleConfirmImport
  };
}
