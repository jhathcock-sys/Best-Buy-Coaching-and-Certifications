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
    <div className="glass-card flex-column gap-lg p-xl">
      <div>
        <h2 className="flex-center justify-start gap-sm mb-sm text-2xl font-heading">
          <Camera color="var(--bby-blue)" size={22} /> Visual Floor Audit
        </h2>
        <p className="text-secondary text-sm">
          Capture a live photo of checkout queues, visual merchandising displays, or department staffing layouts. Gemini will conduct a store general manager audit.
        </p>
      </div>

      {selectedImage ? (
        <div className="relative w-full min-h-200 flex-center overflow-hidden rounded-xl bg-black-alpha-20 border-glass-dashed">
          {selectedImage.startsWith('data:image/png;base64,iVBORw0K') ? (
            <div className="p-xl text-center flex-column align-center gap-sm">
              <Camera size={38} color="var(--bby-yellow)" />
              <span className="font-bold text-sm">Demo Store Queue Snapshot Loaded</span>
              <span className="text-muted text-xs">Busy register lane with 3+ waiting customers, unsorted Computing laptop table.</span>
            </div>
          ) : (
            <img src={selectedImage} alt="Store upload preview" className="w-full h-auto max-h-350 object-contain" />
          )}
          <button 
            className="btn btn-secondary absolute bottom-sm right-sm px-md py-xs text-xs cursor-pointer z-10"
            onClick={onClear}
            disabled={isAuditing}
          >
            Clear Image
          </button>
        </div>
      ) : (
        <div className="flex-column gap-md">
          <label className="flex-column align-center justify-center p-xl rounded-xl border-glass-dashed bg-white-alpha-01 transition-normal cursor-pointer hover-border-primary">
            <Camera size={44} className="text-muted mb-md" />
            <span className="font-bold text-white mb-xs text-sm">Select Store Photo</span>
            <span className="text-secondary text-xs">PNG, JPG or WebP images</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="d-none" />
          </label>

          <div className="text-center">
            <span className="text-muted text-xs font-bold">OR</span>
          </div>

          <button className="btn btn-secondary w-full p-md cursor-pointer" data-testid="demo-photo-btn" onClick={handleTryDemo}>
            Load Demo Store Photo Snapshot
          </button>
        </div>
      )}

      {selectedImage && (
        <button 
          className="btn btn-accent w-full p-md cursor-pointer" 
          data-testid="run-audit-btn"
          onClick={onRunAudit}
          disabled={isAuditing}
        >
          {isAuditing ? (
            <div className="flex-center gap-sm">
              <RefreshCw size={14} className="spin" /> Inspecting Store Layout...
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
