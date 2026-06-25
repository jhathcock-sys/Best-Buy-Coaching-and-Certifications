import { useState } from 'react';
import { Camera, RefreshCw, Sparkles } from 'lucide-react';

interface Props {
  selectedImage: string | null;
  isAuditing: boolean;
  onImageSelect: (image: string, mime: string) => void;
  onRunAudit: () => void;
  onClear: () => void;
}

const MOCK_RETAIL_IMAGE = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export default function FloorAuditUploader({ selectedImage, isAuditing, onImageSelect, onRunAudit, onClear }: Props) {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mime = file.type;
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageSelect(reader.result as string, mime);
    };
    reader.readAsDataURL(file);
  };

  const handleTryDemo = () => {
    onImageSelect(`data:image/png;base64,${MOCK_RETAIL_IMAGE}`, 'image/png');
  };

  return (
    <div className="glass-card flex-column gap-lg">
      <div>
        <h2 className="flex-center justify-start gap-sm mb-sm text-2xl">
          <Camera color="var(--bby-blue)" size={22} /> Visual Floor Audit
        </h2>
        <p className="text-secondary text-sm">
          Capture a live photo of checkout queues, visual merchandising displays, or department staffing layouts. Gemini will conduct a store general manager audit.
        </p>
      </div>

      {selectedImage ? (
        <div className="relative w-full h-220px flex-center overflow-hidden rounded-xl bg-black-alpha-20 border-glass" style={{ borderStyle: 'dashed' }}>
          {selectedImage.startsWith('data:image/png;base64,iVBORw0K') ? (
            <div className="p-xl text-center flex-column align-center gap-sm">
              <Camera size={38} color="var(--bby-yellow)" />
              <span className="font-semibold text-sm">Demo Store Queue Snapshot Loaded</span>
              <span className="text-muted" style={{ fontSize: '0.7rem' }}>Busy register lane with 3+ waiting customers, unsorted Computing laptop table.</span>
            </div>
          ) : (
            <img src={selectedImage} alt="Store upload preview" className="w-full h-full" style={{ objectFit: 'contain', maxHeight: '350px' }} />
          )}
          <button 
            className="btn btn-secondary absolute"
            style={{ bottom: '10px', right: '10px', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            onClick={onClear}
          >
            Clear Image
          </button>
        </div>
      ) : (
        <div className="flex-column gap-md">
          <label className="flex-column align-center justify-center p-xl rounded-xl border-glass transition-normal cursor-pointer commitment-card-hover" style={{ background: 'rgba(255,255,255,0.01)', borderStyle: 'dashed', borderWidth: '2px' }}>
            <Camera size={44} className="text-muted mb-md" />
            <span className="font-semibold text-white mb-xs text-sm">Select Store Photo</span>
            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>PNG, JPG or WebP images</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="opacity-0 w-full h-full absolute inset-0 cursor-pointer" style={{ display: 'none' }} />
          </label>

          <div className="text-center">
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>OR</span>
          </div>

          <button className="btn btn-secondary w-full" data-testid="demo-photo-btn" onClick={handleTryDemo}>
            Load Demo Store Photo Snapshot
          </button>
        </div>
      )}

      {selectedImage && (
        <button 
          className="btn btn-accent w-full" 
          data-testid="run-audit-btn"
          onClick={onRunAudit}
          disabled={isAuditing}
        >
          {isAuditing ? (
            <div className="flex-center gap-sm">
              <RefreshCw size={14} className="typing-dots" style={{ animation: 'spin 2s linear infinite' }} /> Inspecting Store Layout...
            </div>
          ) : (
            <div className="flex-center gap-sm">
              <Sparkles size={16} /> Audit Store Floor Layout
            </div>
          )}
        </button>
      )}
    </div>
  );
}
