import { Camera, RefreshCw, Sparkles, Star, Upload } from 'lucide-react';

export default function AuditorInputForm({
  selectedImage,
  setSelectedImage,
  setAuditResult,
  setIsSaved,
  textInput,
  setTextInput,
  isAuditing,
  handleImageUpload,
  handleLoadDemo,
  handleRunAudit
}) {
  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Star color="var(--bby-yellow)" fill="var(--bby-yellow)" size={22} /> NPS 5-Star Detractor Coach
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
          Upload customer survey screenshots or copy-paste survey feedback. The General Manager AI extracts detractor details, analyzes root-causes, and creates a GROW coaching script.
        </p>
      </div>

      {selectedImage ? (
        <div style={{ position: 'relative', width: '100%', minHeight: '200px', background: 'rgba(0,0,0,0.2)', border: '1px dashed var(--border-glass)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {selectedImage.startsWith('data:image/png;base64,iVBORw0K') ? (
            <div style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <Camera size={38} color="var(--bby-yellow)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Demo Survey Screenshot Loaded</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MOCK PNG Image (1-5 Star Detractor Review)</span>
            </div>
          ) : (
            <img src={selectedImage} alt="Survey screenshot preview" style={{ width: '100%', height: 'auto', maxHeight: '250px', objectFit: 'contain' }} />
          )}
          <button 
            className="btn btn-secondary" 
            style={{ position: 'absolute', bottom: '10px', right: '10px', padding: '0.35rem 0.75rem', fontSize: '0.75rem', zIndex: 10 }} 
            onClick={() => { setSelectedImage(null); setAuditResult(null); setIsSaved(false); }}
          >
            Clear Image
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border-glass)', borderRadius: '16px', padding: '3rem 2rem', background: 'rgba(255,255,255,0.01)', transition: 'border-color 0.2s' }} className="commitment-card-hover">
            <Upload size={38} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginBottom: '0.25rem' }}>Drag or Choose Screenshot</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Upload a customer survey snippet</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          </label>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OR</span>
          </div>
          <button className="btn btn-secondary" onClick={handleLoadDemo} style={{ width: '100%', padding: '0.65rem' }}>
            Load Demo Detractor Screenshot
          </button>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Survey Comment / Text Feedback:</label>
        <textarea
          className="form-control"
          rows={4}
          placeholder="Paste raw customer comment here (e.g. Jordan didn't offer a membership and checkout took forever...)"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          style={{ fontSize: '0.85rem', background: 'rgba(11, 15, 25, 0.4)', borderColor: 'var(--border-glass)', borderRadius: '8px' }}
        />
      </div>

      <button 
        className="btn btn-accent" 
        style={{ width: '100%', padding: '0.75rem' }}
        onClick={handleRunAudit}
        disabled={isAuditing || (!selectedImage && !textInput.trim())}
      >
        {isAuditing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
            <RefreshCw size={14} className="typing-dots" style={{ animation: 'spin 2s linear infinite' }} /> GM Auditing Customer Review...
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
            <Sparkles size={16} /> Audit Survey & Draft Coaching
          </div>
        )}
      </button>
    </div>
  );
}
