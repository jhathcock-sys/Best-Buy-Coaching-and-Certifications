import { useState } from 'react';
import { Camera, CheckCircle, AlertCircle, RefreshCw, Sparkles, Star, Upload, FileText, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useStore } from '../store/useStore';
import { auditFiveStarSurveyGemini } from '../services/ai';

// Simple 1x1 PNG pixel for mock uploader
const MOCK_SURVEY_IMAGE = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export default function FiveStarAuditor({ roster = [] }) {
  const apiKey = useStore((state) => state.apiKey);
const playbookSettings = useStore((state) => state.playbookSettings);
  const logCoachingSession = useStore((state) => state.logCoachingSession);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imageMime, setImageMime] = useState('image/png');
  const [textInput, setTextInput] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageMime(file.type);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
      setAuditResult(null);
      setIsSaved(false);
      if (!textInput) {
        setTextInput("Survey screenshot uploaded. Ready to audit customer rating and comments.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLoadDemo = () => {
    setSelectedImage(`data:image/png;base64,${MOCK_SURVEY_IMAGE}`);
    setImageMime('image/png');
    setTextInput("2 Stars. Checkout line was extremely long and the cashier Jordan didn't even ask if I had a membership or thank me. Terrible service.");
    setAuditResult(null);
    setIsSaved(false);
  };

  const handleRunAudit = async () => {
    if (!selectedImage && !textInput.trim()) {
      alert("Please upload a survey screenshot or copy-paste survey feedback text first!");
      return;
    }

    setIsAuditing(true);
    setIsSaved(false);

    try {
      const base64Data = selectedImage ? selectedImage.split(',')[1] : null;
      const result = await auditFiveStarSurveyGemini(
        apiKey,
        base64Data,
        imageMime,
        textInput,
        playbookSettings
      );
      setAuditResult(result);
    } catch (e) {
      console.error(e);
      alert("An error occurred while auditing the survey. Running offline fallback.");
      setAuditResult({
        rating: 2,
        comment: textInput || "The checkout line was extremely long and the cashier Jordan didn't even ask if I had a membership or thank me.",
        associateName: "Jordan",
        department: "Front End",
        rootCause: "Operational queue bottleneck at checkout combined with transaction-focused cashier behavior (skipping customer greeting, membership inquiry, and closing appreciation).",
        coachingScript: "Hey Jordan, I noticed we got some survey feedback about checkout speed and membership check-ins yesterday. How did you feel the checkout flow was during the afternoon rush? What do you think we could do to make sure we're acknowledging memberships even when there's a queue? Let's align on greeting every customer and handing out the receipt sleeve as our standard checkout process.",
        checkItems: [
          "Observe Jordan's checkout flow during the next afternoon rush to check queue management.",
          "Validate that Jordan is actively using the receipt sleeve to frame survey and membership benefits.",
          "Ensure secondary support cashiers are called promptly when checkout line exceeds 3 customers."
        ]
      });
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSaveToLogs = () => {
    if (!auditResult) return;

    const matchedEmployee = roster.find(
      (emp) => emp.name.toLowerCase() === (auditResult.associateName || '').toLowerCase()
    );

    const notes = `### 5-Star Detractor Audit Summary
**Rating:** ${auditResult.rating} / 5 Stars
**Customer Comment:** "${auditResult.comment}"
**Department:** ${auditResult.department || 'Front End'}

#### GM Root-Cause Analysis:
${auditResult.rootCause}

#### GROW Coaching Script:
"${auditResult.coachingScript}"

#### Leader Floor Check Items:
${auditResult.checkItems ? auditResult.checkItems.map((item, idx) => `${idx + 1}. ${item}`).join('\n') : '- Verify standard checkout behaviors.'}
`;

    logCoachingSession({
      customerName: matchedEmployee ? matchedEmployee.name : (auditResult.associateName || 'Jordan'),
      employeeId: matchedEmployee ? matchedEmployee.id : `emp-${Date.now()}`,
      category: '5-Star Survey Feedback',
      score: auditResult.rating * 20,
      avatar: matchedEmployee?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      notes: notes
    });

    setIsSaved(true);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
      
      {/* Left Column: Upload and Inputs */}
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

      {/* Right Column: AI Analysis & Coaching Script Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {isAuditing && (
          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '2rem', justifyContent: 'center' }}>
            <div className="skeleton-pulse" style={{ height: '24px', width: '50%', background: 'rgba(255,255,255,0.08)', borderRadius: '6px' }}></div>
            <div className="skeleton-pulse" style={{ height: '14px', width: '90%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
            <div className="skeleton-pulse" style={{ height: '14px', width: '80%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
            <div className="skeleton-pulse" style={{ height: '14px', width: '85%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
              <Sparkles size={24} className="typing-dots" style={{ color: 'var(--bby-yellow)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Gemini is auditing customer detractor survey...</span>
            </div>
          </div>
        )}

        {!isAuditing && !auditResult && (
          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={36} style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '0.85rem' }}>Upload a survey screenshot or copy customer feedback, then run the audit to generate coaching steps.</p>
          </div>
        )}

        {!isAuditing && auditResult && (
          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="var(--info)" /> Audit & Detractor Script
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={15}
                    color={star <= auditResult.rating ? 'var(--bby-yellow)' : 'var(--text-muted)'}
                    fill={star <= auditResult.rating ? 'var(--bby-yellow)' : 'transparent'}
                  />
                ))}
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--bby-yellow)', marginLeft: '0.35rem' }}>
                  ({auditResult.rating} / 5 Rating)
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Associate Mentioned</span>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginTop: '0.15rem' }}>
                  {auditResult.associateName || 'Unknown'}
                </p>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Department</span>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--info)', marginTop: '0.15rem' }}>
                  {auditResult.department || 'General Sales'}
                </p>
              </div>
            </div>

            <div style={{ padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.725rem', color: 'var(--error)', textTransform: 'uppercase', fontWeight: 700 }}>GM Root-Cause Breakdown</span>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                {auditResult.rootCause}
              </p>
            </div>

            <div style={{ padding: '0.85rem 1rem', background: 'rgba(0, 70, 190, 0.04)', border: '1px solid rgba(0, 70, 190, 0.2)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--bby-blue)', textTransform: 'uppercase', fontWeight: 700 }}>GROW Coaching Script</span>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.2rem 0.4rem', fontSize: '0.65rem', height: 'auto' }} 
                  onClick={() => { navigator.clipboard.writeText(auditResult.coachingScript); alert('Coaching script copied!'); }}
                >
                  Copy Script
                </button>
              </div>
              <p style={{ fontSize: '0.825rem', color: '#fff', fontStyle: 'italic', lineHeight: 1.4 }}>
                "{auditResult.coachingScript}"
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                Leader Floor Verification Items
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {auditResult.checkItems && auditResult.checkItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '50%', padding: '0.15rem', display: 'inline-flex', marginTop: '0.1rem' }}>
                      <CheckCircle size={10} />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem', display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.65rem' }} 
                onClick={handleSaveToLogs}
                disabled={isSaved}
              >
                {isSaved ? (
                  <>
                    <CheckCircle size={15} /> Logged Successfully!
                  </>
                ) : (
                  <>
                    <Save size={15} /> Save to Coaching Logs
                  </>
                )}
              </button>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
