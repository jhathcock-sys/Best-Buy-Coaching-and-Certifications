import ImportScheduleRow from './ImportSchedule/ImportScheduleRow';
import React, { useState, useRef } from 'react';
import { X, Check, AlertCircle, FileText, Camera, Calendar as CalendarIcon } from 'lucide-react';
import { parseScheduleImage } from '../services/ai';

// standard department/zone mapping helper
import { useScheduleParser } from '../hooks/useScheduleParser';
import { generateBreaks, WEEKDAY_KEYS } from '../utils/scheduleParserUtils';
import ImportWizardStep1 from './ImportSchedule/ImportWizardStep1';
import ImportWizardStep2 from './ImportSchedule/ImportWizardStep2';

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
    handleConfirmImport,
    runDemoParse,
    generatePreviewFromCsv
  } = useScheduleParser(roster, onImportConfirm, onClose, apiKey, onAddEmployee, isOpen);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '980px', background: '#0e1220', padding: 0 }} onClick={(e: any) => e.stopPropagation()}>
        
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '1.5rem' }}>
              <div className="spinner" style={{ width: '48px', height: '48px', border: '4px solid rgba(255,255,255,0.05)', borderTopColor: 'var(--bby-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>Analyzing schedule image...</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>Gemini is extracting schedule names, times, and zones.</p>
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
            />
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
