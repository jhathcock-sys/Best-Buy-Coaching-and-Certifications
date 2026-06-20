const fs = require('fs');

const code = fs.readFileSync('src/components/ImportScheduleModal.tsx', 'utf8');
const lines = code.split('\n');

const step1Start = lines.findIndex(l => l.includes('{/* Upload & Paste State */}'));
const step2Start = lines.findIndex(l => l.includes('{/* LOADING PARSE STATE */}'));
const step2UIStart = lines.findIndex(l => l.includes('{/* STEP 2: REVIEW & OVERRIDE VALIDATION GRID */}'));

const step1JSX = lines.slice(step1Start, step2Start).join('\n');
const loadingJSX = lines.slice(step2Start, step2UIStart).join('\n');
const step2JSX = lines.slice(step2UIStart, lines.findIndex(l => l.includes('<div style={{ display: \\'flex\\', justifyContent: \\'flex-end\\', gap: \\'1rem\\', marginTop: \\'2rem\\' }}>'))).join('\n');

const step1File = \import React from 'react';
import { FileText, Camera } from 'lucide-react';

export default function ImportWizardStep1({
  activeTab,
  errorMsg,
  fileName,
  fileInputRef,
  handleImageFile,
  handleCsvFile,
  isWeeklyCsv,
  setIsWeeklyCsv,
  csvHeaders,
  selectedDayColumn,
  setSelectedDayColumn,
  csvMappings,
  setCsvMappings,
  generatePreviewFromCsv
}) {
  return (
    <>
\ + step1JSX + \
    </>
  );
}
\;

fs.writeFileSync('src/components/ImportSchedule/ImportWizardStep1.tsx', step1File);

const step2File = \import React from 'react';
import { AlertCircle } from 'lucide-react';
import { generateBreaks } from '../../services/scheduler'; // Assuming this exists or will be moved

export default function ImportWizardStep2({
  reviews,
  setReviews,
  setParsedItems,
  roster,
  handleMatchChange,
  handleZoneChange,
  handleShiftTimeChange
}) {
  return (
    <>
\ + step2JSX + \
    </>
  );
}
\;

// Actually we need generateBreaks in Step2. It is currently in the modal.
// wait, generateBreaks is inline or imported? Let's check!
