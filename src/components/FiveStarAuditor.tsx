import { useState } from 'react';
import { useStore } from '../store/useStore';
import { auditFiveStarSurveyGemini } from '../services/ai';
import AuditorInputForm from './AuditorInputForm';
import AuditorResults from './AuditorResults';

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
      <AuditorInputForm 
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        setAuditResult={setAuditResult}
        setIsSaved={setIsSaved}
        textInput={textInput}
        setTextInput={setTextInput}
        isAuditing={isAuditing}
        handleImageUpload={handleImageUpload}
        handleLoadDemo={handleLoadDemo}
        handleRunAudit={handleRunAudit}
      />
      
      <AuditorResults 
        isAuditing={isAuditing}
        auditResult={auditResult}
        isSaved={isSaved}
        handleSaveToLogs={handleSaveToLogs}
      />
    </div>
  );
}
