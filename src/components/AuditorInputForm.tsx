import React, { ChangeEvent } from 'react';
import { Camera, RefreshCw, Sparkles, Star, Upload } from 'lucide-react';

export interface AuditorFormState {
  selectedImage: string | null;
  textInput: string;
  isAuditing: boolean;
}

export interface AuditorFormHandlers {
  setSelectedImage: (image: string | null) => void;
  setAuditResult: (result: any) => void;
  setIsSaved: (saved: boolean) => void;
  setTextInput: (text: string) => void;
  handleImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  handleLoadDemo: () => void;
  handleRunAudit: () => void;
}

interface AuditorInputFormProps {
  formState: AuditorFormState;
  formHandlers: AuditorFormHandlers;
}

export default function AuditorInputForm({
  formState,
  formHandlers
}: AuditorInputFormProps) {
  const { selectedImage, textInput, isAuditing } = formState;
  const { 
    setSelectedImage, 
    setAuditResult, 
    setIsSaved, 
    setTextInput, 
    handleImageUpload, 
    handleLoadDemo, 
    handleRunAudit 
  } = formHandlers;

  return (
    <div className="glass-card flex-column gap-xl p-xl">
      <div>
        <h2 className="text-xl mb-sm flex-row align-center gap-sm font-heading">
          <Star color="var(--bby-yellow)" fill="var(--bby-yellow)" size={22} /> NPS 5-Star Detractor Coach
        </h2>
        <p className="text-secondary text-sm m-0">
          Upload customer survey screenshots or copy-paste survey feedback. The General Manager AI extracts detractor details, analyzes root-causes, and creates a GROW coaching script.
        </p>
      </div>

      {selectedImage ? (
        <div className="relative w-full min-h-200 bg-black-alpha-20 border-glass-dashed rounded-xl flex-center overflow-hidden">
          {selectedImage.startsWith('data:image/png;base64,iVBORw0K') ? (
            <div className="p-xl text-center flex-column align-center gap-md">
              <Camera size={38} color="var(--bby-yellow)" />
              <span className="text-sm font-bold text-white">Demo Survey Screenshot Loaded</span>
              <span className="text-xs text-muted">MOCK PNG Image (1-5 Star Detractor Review)</span>
            </div>
          ) : (
            <img 
              src={selectedImage} 
              alt="Survey screenshot preview" 
              className="w-full h-auto max-h-250 object-contain" 
            />
          )}
          <button 
            className="btn btn-secondary absolute bottom-sm right-sm px-md py-xs text-xs z-10 cursor-pointer"
            onClick={() => { setSelectedImage(null); setAuditResult(null); setIsSaved(false); }}
            data-testid="clear-image-btn"
          >
            Clear Image
          </button>
        </div>
      ) : (
        <div className="flex-column gap-md">
          <label 
            className="cursor-pointer flex-column align-center justify-center border-glass-dashed rounded-xl p-xxl bg-white-alpha-01 hover-border-primary transition-normal commitment-card-hover"
            data-testid="image-upload-label"
          >
            <Upload size={38} color="var(--text-muted)" className="mb-md" />
            <span className="text-sm font-bold text-white mb-xs">Drag or Choose Screenshot</span>
            <span className="text-xs text-secondary">Upload a customer survey snippet</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="d-none" 
              data-testid="image-upload-input"
            />
          </label>
          <div className="text-center">
            <span className="text-xs text-muted font-bold">OR</span>
          </div>
          <button 
            className="btn btn-secondary w-full p-md cursor-pointer" 
            onClick={handleLoadDemo}
            data-testid="load-demo-btn"
          >
            Load Demo Detractor Screenshot
          </button>
        </div>
      )}

      <div className="form-group">
        <label className="form-label text-sm text-secondary">Survey Comment / Text Feedback:</label>
        <textarea
          className="form-control text-sm bg-obsidian-alpha-40 border-glass rounded-md p-md"
          rows={4}
          placeholder="Paste raw customer comment here (e.g. Jordan didn't offer a membership and checkout took forever...)"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          data-testid="text-input-feedback"
        />
      </div>

      <button 
        className="btn btn-accent w-full p-md cursor-pointer"
        onClick={handleRunAudit}
        disabled={isAuditing || (!selectedImage && !textInput?.trim())}
        data-testid="run-audit-btn"
      >
        {isAuditing ? (
          <div className="flex-center gap-sm">
            <RefreshCw size={14} className="spin" /> GM Auditing Customer Review...
          </div>
        ) : (
          <div className="flex-center gap-sm">
            <Sparkles size={16} /> Audit Survey & Draft Coaching
          </div>
        )}
      </button>
    </div>
  );
}
