import { useState, useEffect, useRef, useCallback } from 'react';

export const FUZZY_MAP = {
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
} as const;

type FuzzyMapKeys = keyof typeof FUZZY_MAP;

export interface ParsedEmployeeRow {
  name: string;
  employeeNumber: string;
  dept: string;
  hours: number;
  memberships: number;
  creditCards: number;
  warranty: number;
  surveys: number;
  rph: number;
  basket: number;
  m365: number;
  audio: number;
  opportunityGap: string;
}

export function useRosterImporter() {
  const [csvData, setCsvData] = useState<string[][] | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<string, number>>({});
  const [parsedRows, setParsedRows] = useState<ParsedEmployeeRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const normalizeDept = useCallback((raw: string) => {
    if (!raw) return 'General Sales';
    const clean = raw.toLowerCase().trim();
    if (clean.includes('comp') || clean.includes('pc') || clean.includes('laptop')) return 'Computing';
    if (clean.includes('theat') || clean.includes('tv') || clean.includes('audio') || clean.includes('ht')) return 'Home Theatre';
    if (clean.includes('mob') || clean.includes('phone') || clean.includes('wireless')) return 'Mobile';
    if (clean.includes('app') || clean.includes('fridge') || clean.includes('wash')) return 'Appliances';
    if (clean.includes('gs') || clean.includes('geek') || clean.includes('serv')) return 'Geek Squad';
    if (clean.includes('front') || clean.includes('cash') || clean.includes('cs') || clean.includes('checkout')) return 'Front End';
    return 'General Sales';
  }, []);

  const generatePreview = useCallback((rows: string[][], currentMappings: Record<string, number>) => {
    const list = rows.map(row => {
      const parsedDept = currentMappings.department !== -1 && row[currentMappings.department] ? normalizeDept(row[currentMappings.department]) : 'General Sales';
      const emp: ParsedEmployeeRow = {
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
  }, [normalizeDept]);

  const parseCSVText = useCallback((text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) {
      setErrorMsg("Error: The CSV file must contain a header row and at least one data row.");
      return;
    }

    const parseCSVLine = (line: string) => {
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
    
    const parsedData = lines.slice(1).map(line => parseCSVLine(line));
    setCsvData(parsedData);

    const initialMappings: Record<string, number> = {};
    (Object.keys(FUZZY_MAP) as FuzzyMapKeys[]).forEach(key => {
      const matchIndex = parsedHeaders.findIndex(header => {
        const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
        return FUZZY_MAP[key].some((term: string) => {
          const normalizedTerm = term.toLowerCase().replace(/[^a-z0-9]/g, '');
          return normalizedHeader.includes(normalizedTerm) || normalizedTerm.includes(normalizedHeader);
        });
      });

      if (matchIndex !== -1) {
        initialMappings[key] = matchIndex;
      } else {
        if (key === 'name' && parsedHeaders[0]) initialMappings.name = 0;
        else if (key === 'department' && parsedHeaders[1]) initialMappings.department = 1;
        else initialMappings[key] = -1;
      }
    });

    setMappings(initialMappings);
    generatePreview(parsedData, initialMappings);
  }, [generatePreview]);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      setErrorMsg("Error: Please upload a valid CSV file (.csv). Excel files can be saved as CSV in one click!");
      return;
    }
    setErrorMsg('');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (!isMounted.current) return;
      const text = e.target?.result;
      if (typeof text !== 'string') {
        setErrorMsg('Failed to read file');
        return;
      }
      parseCSVText(text);
    };
    reader.readAsText(file);
  }, [parseCSVText]);

  const handleMappingChange = useCallback((key: string, index: number) => {
    setMappings(prev => {
      const newMappings = { ...prev, [key]: index };
      if (csvData) generatePreview(csvData, newMappings);
      return newMappings;
    });
  }, [csvData, generatePreview]);

  const reset = useCallback(() => {
    setCsvData(null);
    setHeaders([]);
    setParsedRows([]);
    setFileName('');
    setErrorMsg('');
  }, []);

  return {
    csvData,
    headers,
    mappings,
    parsedRows,
    fileName,
    errorMsg,
    handleFile,
    handleMappingChange,
    reset
  };
}
