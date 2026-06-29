import ImportScheduleRow from './ImportSchedule/ImportScheduleRow';
import React, { useState, useRef } from 'react';
import { X, Check, AlertCircle, FileText, Camera, Calendar as CalendarIcon } from 'lucide-react';
import { parseScheduleImage } from '../services/ai';

// standard department/zone mapping helper
import { useScheduleParser } from '../hooks/useScheduleParser';
import { useStore } from '../store/useStore';
import { generateBreaks, WEEKDAY_KEYS } from '../utils/scheduleParserUtils';
import ImportWizardStep1 from './ImportSchedule/ImportWizardStep1';
import ImportWizardStep2 from './ImportSchedule/ImportWizardStep2';
import { Employee } from '../types';

interface ImportScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportConfirm: (payload: { zoneAssignments: any; breakSchedule: any }) => void;
}

export default function ImportScheduleModal({ isOpen, onClose, onImportConfirm }: ImportScheduleModalProps) {
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
    handleConfirmImport,
    runDemoParse,
    generatePreviewFromCsv
  } = useScheduleParser({ onImportConfirm, onClose, isOpen });

  const activePeriod = useStore(state => state.activePeriod);
  const rosterHistory = useStore(state => state.rosterHistory);
  const _rawroster = activePeriod && rosterHistory ? (rosterHistory[activePeriod] || {}) : {};
  const roster = Object.values(_rawroster) as Employee[];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay z-1100 cursor-pointer" onClick={onClose} data-testid="import-schedule-modal">
      <div className="modal-content max-w-980 p-none bg-obsidian" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="flex-between align-center p-x-2rem p-y-xl border-glass-bottom">
          <h3 className="flex-center gap-sm m-none text-xl font-heading">
            <CalendarIcon size={20} color="var(--bby-yellow)" /> Floor Schedule Importer
          </h3>
          <button className="btn btn-secondary btn-icon p-sm cursor-pointer" data-testid="close-modal-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tab Selection Headers */}
        <div className="flex-row bg-white-alpha-01 border-glass-bottom">
          <button 
            className={`flex-1 p-md border-none font-bold cursor-pointer ${activeTab === 'image' ? 'bg-primary-alpha-10 border-bottom-primary text-white' : 'bg-transparent text-secondary'}`}
            data-testid="tab-image"
            onClick={() => { setActiveTab('image'); setErrorMsg(''); setParsedItems([]); }}
          >
            📸 Screenshot Upload
          </button>
          <button 
            className={`flex-1 p-md border-none font-bold cursor-pointer ${activeTab === 'csv' ? 'bg-primary-alpha-10 border-bottom-primary text-white' : 'bg-transparent text-secondary'}`}
            data-testid="tab-csv"
            onClick={() => { setActiveTab('csv'); setErrorMsg(''); setParsedItems([]); }}
          >
            📊 CSV Spreadsheet
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-xxl max-h-65vh overflow-y-auto">
          
          {errorMsg && (
            <div className="bg-error-alpha-08 border-error-alpha-25 p-md rounded-xl text-error flex-row gap-sm mb-lg text-sm">
              <AlertCircle size={18} className="flex-shrink-0" />
              <div>{errorMsg}</div>
            </div>
          )}

          {parsedItems?.length === 0 ? (
            /* STEP 1: UPLOAD STATE */
            <ImportWizardStep1 
              activeTab={activeTab}
              fileName={fileName}
              fileInputRef={fileInputRef}
              handleImageFile={handleImageFile}
              handleCsvFile={handleCsvFile}
              isWeeklyCsv={isWeeklyCsv}
              csvHeaders={csvHeaders}
              selectedDayColumn={selectedDayColumn}
              setSelectedDayColumn={setSelectedDayColumn}
              csvMappings={csvMappings}
              setCsvMappings={setCsvMappings}
              generatePreviewFromCsv={generatePreviewFromCsv}
              runDemoParse={runDemoParse}
              isProcessing={isParsing}
            />
          ) : isParsing ? (
            /* LOADING PARSE STATE */
            <div className="flex-column align-center justify-center p-y-4rem gap-lg">
              <div className="spinner w-48 h-48 border-4 border-solid border-white-alpha-05 border-top-primary rounded-full spin"></div>
              <div className="text-center">
                <h4 className="text-lg m-none mb-sm font-heading">Analyzing schedule image...</h4>
                <p className="text-secondary text-sm m-none">Gemini is extracting schedule names, times, and zones.</p>
              </div>
            </div>
          ) : (
            /* STEP 2: REVIEW & OVERRIDE VALIDATION GRID */
            <ImportWizardStep2 
              reviews={reviews}
              setReviews={setReviews}
              setParsedItems={setParsedItems}
              roster={roster}
              handleMatchChange={handleMatchChange}
              handleZoneChange={handleZoneChange}
              handleShiftTimeChange={handleShiftTimeChange}
              isProcessing={isParsing}
            />
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex-between p-x-2rem p-y-xl border-glass-top bg-white-alpha-01">
          <button className="btn btn-secondary cursor-pointer" onClick={onClose} data-testid="cancel-import-btn">
            Cancel
          </button>
          
          {(parsedItems?.length ?? 0) > 0 && !isParsing && (
            <button 
              className="btn btn-accent text-black flex-center gap-xs cursor-pointer" 
              data-testid="confirm-import-btn"
              onClick={handleConfirmImport}
            >
              <Check size={16} /> Confirm Import ({(reviews?.filter(r => r.matchedEmpId !== '') ?? []).length} Associates)
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
