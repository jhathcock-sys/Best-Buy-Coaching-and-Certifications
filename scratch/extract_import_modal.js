const fs = require('fs');

const code = fs.readFileSync('src/components/ImportScheduleModal.tsx', 'utf8');
const lines = code.split('\n');

const hookLogicStart = lines.findIndex(l => l.includes("const [activeTab, setActiveTab] = useState('image');"));
const hookLogicEnd = lines.findIndex(l => l.includes('return ('));

const hookLogic = lines.slice(hookLogicStart, hookLogicEnd).join('\n');

const helpersStart = lines.findIndex(l => l.includes('const normalizeZone ='));
const helpersEnd = hookLogicStart - 1;

const helpers = lines.slice(helpersStart, helpersEnd).join('\n');

const hookFile = \import { useState, useRef } from 'react';
import { parseScheduleImage } from '../services/ai';

\ + helpers + \

export function useScheduleParser(roster, onImportConfirm, onClose, apiKey, onAddEmployee, isOpen) {
\ + hookLogic + \
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
\;

fs.writeFileSync('src/hooks/useScheduleParser.ts', hookFile);

const newComponentCode = lines.slice(0, helpersStart).join('\n') + \
import { useScheduleParser } from '../hooks/useScheduleParser';

export default function ImportScheduleModal({ isOpen, onClose, roster = [], onImportConfirm, apiKey, onAddEmployee }) {
  const {
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
  } = useScheduleParser(roster, onImportConfirm, onClose, apiKey, onAddEmployee, isOpen);

  if (!isOpen) return null;

\ + lines.slice(hookLogicEnd).join('\n');

fs.writeFileSync('src/components/ImportScheduleModal.tsx', newComponentCode);

console.log('Done extracting useScheduleParser!');
