import { useState, useRef, useEffect } from 'react';
import { parseRentsDueDocumentGemini } from '../services/ai';
import { mockRentsDuePayload } from '../data/mockRentsDue';
import { mapParsedRentsToRoster, parseRentsDueCSVLocal } from '../utils/rentsDueUtils';
import { ParsedEmployee } from '../components/RentsDueAuditor/RentsDueLedger';
import { uploadRentsDueArchive, saveRentsDueArchiveMetadata } from '../services/firebase';
import { Employee } from '../types';

interface UseRentsDueParserProps {
  storeId: string;
  apiKey: string;
  selectedPeriod: string;
  comparisonRoster: Employee[];
  bulkImportEmployees: (list: Employee[], period: string) => Promise<void>;
  addDailySnapshot: (date: string, list: Employee[]) => void;
  snapshotDate: string;
}

export function useRentsDueParser({
  storeId,
  apiKey,
  selectedPeriod,
  comparisonRoster,
  bulkImportEmployees,
  addDailySnapshot,
  snapshotDate
}: UseRentsDueParserProps) {
  const [isParsing, setIsParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState('');
  const [textInput, setTextInput] = useState('');
  const [parsedEmployees, setParsedEmployees] = useState<ParsedEmployee[] | null>(null);
  const [syncSuccess, setSyncSuccess] = useState(false);
  
  const [mappingState, setMappingState] = useState<{
    isMapping: boolean;
    fields: string[];
    prefilledMapping: Record<string, string>;
    textData: string;
  }>({
    isMapping: false,
    fields: [],
    prefilledMapping: {},
    textData: ''
  });

  const isMounted = useRef(true);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
    };
  }, []);

  const handleArchiveUpload = async (fileOrBlob: File | Blob, name: string) => {
    if (!storeId) return;
    const timestamp = Date.now();
    const finalName = `${timestamp}_${name}`;
    const downloadUrl = await uploadRentsDueArchive(storeId, fileOrBlob, finalName);
    if (downloadUrl) {
      await saveRentsDueArchiveMetadata(storeId, {
        fileName: name,
        downloadUrl,
        period: selectedPeriod,
        timestamp
      });
    }
  };

  const runOcrParsing = async (base64Data: string, mimeType: string, textData: string, resetInput?: () => void) => {
    setIsParsing(true);
    setErrorMsg('');
    try {
      const parsed = await parseRentsDueDocumentGemini(base64Data, mimeType, textData || textInput, apiKey);
      if (!isMounted.current) return;
      if (Array.isArray(parsed) && parsed.length > 0) {
        setParsedEmployees(parsed as ParsedEmployee[]);
      } else {
        throw new Error("Parsed output was empty or invalid.");
      }
    } catch (e) {
      if (!isMounted.current) return;
      console.error(e);
      setErrorMsg('Failed to parse Rents Due report. Make sure you have a valid Gemini API key or try our interactive demo dataset.');
    } finally {
      if (isMounted.current) setIsParsing(false);
      if (resetInput) resetInput();
    }
  };

  const handleProcessFile = (file: File, resetInput?: () => void) => {
    setFileName(file.name);
    setErrorMsg('');
    setParsedEmployees(null);
    setIsParsing(true);
    
    handleArchiveUpload(file, file.name).catch(err => console.error("Failed to archive upload", err));

    const reader = new FileReader();

    reader.onerror = () => {
      setErrorMsg('Failed to read the uploaded file. The file may be corrupted or unavailable.');
      setIsParsing(false);
      if (resetInput) resetInput();
    };
    
    reader.onabort = () => {
      setErrorMsg('File reading was aborted.');
      setIsParsing(false);
      if (resetInput) resetInput();
    };

    try {
      if (file.type.startsWith('image/')) {
        reader.onload = async (e) => {
          const base64Url = e.target?.result?.toString() || '';
          const base64Data = base64Url.split(',')[1] || '';
          runOcrParsing(base64Data, file.type, '', resetInput);
        };
        reader.readAsDataURL(file);
      } else if (file.name.endsWith('.csv') || file.type === 'text/csv' || file.type === 'text/plain') {
        reader.onload = async (e) => {
          const text = e.target?.result?.toString() || '';
          setTextInput(text);
          try {
            const localParsed = await parseRentsDueCSVLocal(text);
            if (!isMounted.current) return;
            
            if (localParsed?.requiresMapping) {
              setMappingState({
                isMapping: true,
                fields: localParsed.fields || [],
                prefilledMapping: localParsed.prefilledMapping || {},
                textData: text
              });
              setIsParsing(false);
              if (resetInput) resetInput();
              return;
            }

            if (localParsed?.parsedData && localParsed.parsedData.length > 0) {
              setParsedEmployees(localParsed.parsedData as ParsedEmployee[]);
              setIsParsing(false);
              if (resetInput) resetInput();
              return;
            }
          } catch (err) {
            if (!isMounted.current) return;
            console.warn("Local parse failed, falling back to Gemini", err);
          }
          if (!isMounted.current) return;
          runOcrParsing('', '', text, resetInput);
        };
        reader.readAsText(file);
      } else {
        setErrorMsg('Error: Please upload a valid CSV file, text sheet copy-paste, or image screenshot.');
        setIsParsing(false);
        if (resetInput) resetInput();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An unexpected error occurred while processing the file.');
      setIsParsing(false);
      if (resetInput) resetInput();
    }
  };

  const handleManualTextParse = async () => {
    if (!textInput.trim()) {
      alert("Please paste the spreadsheet text copy or CSV data first!");
      return;
    }
    const blob = new Blob([textInput], { type: 'text/plain' });
    handleArchiveUpload(blob, 'pasted_rents_due.txt').catch(err => console.error("Failed to archive paste", err));
    
    try {
      setIsParsing(true);
      const localParsed = await parseRentsDueCSVLocal(textInput);
      if (!isMounted.current) return;
      
      if (localParsed?.requiresMapping) {
        setMappingState({
          isMapping: true,
          fields: localParsed.fields || [],
          prefilledMapping: localParsed.prefilledMapping || {},
          textData: textInput
        });
        setIsParsing(false);
        return;
      }

      if (localParsed?.parsedData && localParsed.parsedData.length > 0) {
        setParsedEmployees(localParsed.parsedData as ParsedEmployee[]);
        setIsParsing(false);
        return;
      }
    } catch (err) {
      if (!isMounted.current) return;
      console.warn("Local parse failed, falling back to Gemini", err);
    }
    
    runOcrParsing('', '', textInput);
  };

  const handleConfirmMapping = async (userMapping: Record<string, string>) => {
    try {
      setIsParsing(true);
      setMappingState(prev => ({ ...prev, isMapping: false }));
      const localParsed = await parseRentsDueCSVLocal(mappingState.textData, userMapping);
      if (!isMounted.current) return;
      
      if (localParsed?.parsedData && localParsed.parsedData.length > 0) {
        setParsedEmployees(localParsed.parsedData as ParsedEmployee[]);
        setIsParsing(false);
        return;
      }
      
      runOcrParsing('', '', mappingState.textData);
    } catch (err) {
      if (!isMounted.current) return;
      console.error(err);
      setErrorMsg('Failed to apply mapping. Falling back to Gemini...');
      runOcrParsing('', '', mappingState.textData);
    }
  };

  const loadDemoData = () => {
    setIsParsing(true);
    setErrorMsg('');
    setFileName('rents_due_june_2026_copy.csv');
    
    demoTimeoutRef.current = setTimeout(() => {
      if (!isMounted.current) return;
      setParsedEmployees(mockRentsDuePayload as ParsedEmployee[]);
      setIsParsing(false);
    }, 1200);
  };

  const handleSyncToRoster = async () => {
    if (!parsedEmployees || parsedEmployees.length === 0) return;
    if (!bulkImportEmployees) {
      alert("Error: Store action to bulk import employees is missing.");
      return;
    }
    
    const { importList } = mapParsedRentsToRoster(parsedEmployees, comparisonRoster);
    
    await bulkImportEmployees(importList, selectedPeriod);
    
    if (snapshotDate) {
      addDailySnapshot(snapshotDate, importList);
    }

    setSyncSuccess(true);
    
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      if (!isMounted.current) return;
      setSyncSuccess(false);
    }, 4000);
  };

  const getGapsSummary = () => {
    if (!parsedEmployees) return { rev: 0, apps: 0, pms: 0 };
    return parsedEmployees.reduce((acc, curr) => {
      if (curr.revenueStatus === 'off-track') {
        acc.rev += Math.max(0, (curr.revenueOwed || 0) - (curr.revenue || 0));
      }
      if (curr.appsStatus === 'off-track') {
        acc.apps += Math.max(0, (curr.appsOwed || 0) - (curr.apps || 0));
      }
      if (curr.membershipsStatus === 'off-track') {
        acc.pms += Math.max(0, (curr.membershipsOwed || 0) - (curr.memberships || 0));
      }
      return acc;
    }, { rev: 0, apps: 0, pms: 0 });
  };

  const gaps = getGapsSummary();

  return {
    isParsing,
    errorMsg,
    fileName,
    textInput,
    setTextInput,
    parsedEmployees,
    setParsedEmployees,
    syncSuccess,
    mappingState,
    setMappingState,
    gaps,
    handleProcessFile,
    handleManualTextParse,
    handleConfirmMapping,
    loadDemoData,
    handleSyncToRoster
  };
}
